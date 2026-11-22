import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { requireOfficer, loadApplication, fail, logEntry, view } from "@/lib/requireOfficer";
import { priorityOf } from "@/lib/priority";
import { STEPS, POSSESSION, INTAKE_CHECKS, validateStep, missingDocs } from "@/lib/process";
const clip = (s, n) => String(s || "").slice(0, n);
const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : undefined);
export async function POST(request, { params }) {
  const { user, errorResponse } = await requireOfficer();
  if (errorResponse) return errorResponse;
  const app = await loadApplication((await params).id);
  if (!app) return fail("not_found", 404);
  const { step, data = {}, complete = false } = await request.json().catch(() => ({}));
  if (app.status !== "open") return fail("not_open", 409);
  if (!STEPS.includes(step) || STEPS.indexOf(step) !== app.step || step === "decision") return fail("wrong_step", 409);
  if (step === "intake") {
    app.set("intake.checks", Object.fromEntries(INTAKE_CHECKS.map((k) => [k, data.checks?.[k] === true])));
    app.set("intake.notes", clip(data.notes, 600));
  }
  if (step === "verification") {
    app.set("verification.reviewed", data.reviewed === true);
    app.set("verification.notes", clip(data.notes, 600));
  }
  if (step === "inspection") {
    app.set("inspection.items", (Array.isArray(data.items) ? data.items : []).slice(0, 20).map((i) => ({ ...(mongoose.isValidObjectId(i.id) ? { _id: i.id } : {}), text: clip(i.text, 200), done: i.done === true, note: clip(i.note, 300), fromAi: i.fromAi === true })).filter((i) => i.text.trim()));
    app.set("inspection.visitedAt", data.visitedAt ? new Date(data.visitedAt) : undefined);
    app.set("inspection.location", data.location && num(data.location.lat) !== undefined && num(data.location.lng) !== undefined ? { lat: num(data.location.lat), lng: num(data.location.lng) } : undefined);
    app.set("inspection.possession", POSSESSION.includes(data.possession) ? data.possession : "");
    app.set("inspection.objection", data.objection === true);
    app.set("inspection.notes", clip(data.notes, 1000));
  }
  if (complete) {
    const plain = app.toObject();
    const saved = { intake: { checks: plain.intake?.checks }, verification: { reviewed: plain.verification?.reviewed }, inspection: { items: plain.inspection?.items, visitedAt: plain.inspection?.visitedAt, possession: plain.inspection?.possession } }[step];
    const problem = validateStep(plain, step, saved);
    if (problem) return fail(problem, 422);
    app.set(`${step}.doneAt`, new Date());
    app.set(`${step}.doneBy`, user.name);
    app.step += 1;
    app.stepEnteredAt = new Date();
    app.history.push(logEntry(user, "step_done", step, clip(data.notes || data.reason, 300)));
  }
  await app.save();
  const out = view(app);
  return NextResponse.json({ application: { ...out, priority: priorityOf(out), missing: missingDocs(out) } });
}
