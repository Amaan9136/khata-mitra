import { NextResponse } from "next/server";
import { requireOfficer, loadApplication, fail, logEntry, view } from "@/lib/requireOfficer";
import { priorityOf } from "@/lib/priority";
import { DOC_KINDS, missingDocs } from "@/lib/process";
export async function POST(request, { params }) {
  const { user, errorResponse } = await requireOfficer();
  if (errorResponse) return errorResponse;
  const app = await loadApplication((await params).id);
  if (!app) return fail("not_found", 404);
  if (app.status !== "open") return fail("not_open", 409);
  const b = await request.json().catch(() => ({}));
  if (!DOC_KINDS.includes(b.kind)) return fail("invalid_kind");
  const image = typeof b.imageData === "string" && /^data:image\/(jpeg|png|webp);base64,/.test(b.imageData) ? b.imageData : "";
  if (image.length > 1500000) return fail("image_too_large", 413);
  const text = String(b.text || "").slice(0, 6000);
  if (!image && !text.trim()) return fail("empty_document");
  if (app.documents.length >= 14) return fail("too_many_documents", 409);
  app.documents.push({ kind: b.kind, name: String(b.name || "").slice(0, 120), text, ...(image ? { imageData: image, hasImage: true } : {}) });
  app.history.push(logEntry(user, "doc_added", STEP_OF(app), `${b.kind}${b.name ? ` · ${String(b.name).slice(0, 60)}` : ""}`));
  await app.save();
  const out = view(app);
  return NextResponse.json({ application: { ...out, priority: priorityOf(out), missing: missingDocs(out) } }, { status: 201 });
}
const STEP_OF = (app) => ["intake", "verification", "inspection", "decision"][app.step];
