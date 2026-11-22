import { NextResponse } from "next/server";
import { requireOfficer, loadApplication, fail, logEntry, view } from "@/lib/requireOfficer";
import { priorityOf } from "@/lib/priority";
import { OUTCOMES, missingDocs } from "@/lib/process";
import { extractDocument, crossCheck, summarise, draftChecklist, draftReason } from "@/lib/ai";
import { AiError } from "@/lib/groq";
import Application from "@/models/Application";
import mongoose from "mongoose";
export const maxDuration = 60;
const STEP_OF = (app) => ["intake", "verification", "inspection", "decision"][app.step];
export async function POST(request, { params }) {
  const { user, errorResponse } = await requireOfficer();
  if (errorResponse) return errorResponse;
  const id = (await params).id;
  if (!mongoose.isValidObjectId(id)) return fail("not_found", 404);
  const { task, lang = "kn", docId, outcome } = await request.json().catch(() => ({}));
  const L = lang === "en" ? "en" : "kn";
  const app = await Application.findById(id).select(task === "extract" ? "+documents.imageData" : "");
  if (!app) return fail("not_found", 404);
  if (app.status !== "open") return fail("not_open", 409);
  const step = STEP_OF(app);
  let extra = {};
  try {
    if (task === "extract") {
      const doc = app.documents.id(docId);
      if (!doc) return fail("not_found", 404);
      doc.extracted = await extractDocument(doc, L);
      app.history.push(logEntry(user, "ai_extract", step, `${doc.kind}${doc.name ? ` · ${doc.name.slice(0, 60)}` : ""}`, true));
    } else if (task === "crosscheck") {
      const out = await crossCheck(app.toObject(), L);
      const kept = app.flags.filter((f) => f.resolved);
      app.flags = out.flags.map((f) => {
        const prev = kept.find((k) => k.field === f.field && k.severity === f.severity);
        return prev ? { ...f, resolved: true, officerNote: prev.officerNote } : f;
      });
      app.consistent = out.consistent;
      app.ai.flagsAt = new Date();
      app.history.push(logEntry(user, "ai_crosscheck", step, `${out.flags.length}`, true));
    } else if (task === "summary") {
      app.ai.summary = { ...(await summarise(app.toObject(), L)), at: new Date() };
      app.history.push(logEntry(user, "ai_summary", step, "", true));
    } else if (task === "checklist") {
      const items = await draftChecklist(app.toObject(), L);
      const keep = app.inspection.items.filter((i) => i.done || !i.fromAi);
      app.inspection.items = [...keep, ...items.filter((t) => !keep.some((k) => k.text === t)).map((text) => ({ text, fromAi: true }))];
      app.ai.checklistAt = new Date();
      app.history.push(logEntry(user, "ai_checklist", step, `${items.length}`, true));
    } else if (task === "reason") {
      if (!OUTCOMES.includes(outcome)) return fail("invalid_outcome");
      const text = await draftReason(app.toObject(), outcome, L);
      app.ai.reasonDraft = { outcome, text, at: new Date() };
      app.history.push(logEntry(user, "ai_reason", step, outcome, true));
      extra = { reason: text };
    } else return fail("invalid_task");
  } catch (err) {
    if (err instanceof AiError) return fail(err.code, 503);
    throw err;
  }
  await app.save();
  const out = view(app);
  return NextResponse.json({ application: { ...out, priority: priorityOf(out), missing: missingDocs(out) }, ...extra });
}
