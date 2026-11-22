import { NextResponse } from "next/server";
import { requireOfficer, loadApplication, fail, logEntry, view } from "@/lib/requireOfficer";
import { OUTCOMES } from "@/lib/process";
const STEP_OF = (app) => ["intake", "verification", "inspection", "decision"][app.step];
export async function POST(request, { params }) {
  const { user, errorResponse } = await requireOfficer();
  if (errorResponse) return errorResponse;
  const app = await loadApplication((await params).id);
  if (!app) return fail("not_found", 404);
  if (app.status !== "open") return fail("not_open", 409);
  const body = await request.json().catch(() => ({}));
  const outcome = body.outcome;
  const reason = String(body.reason || "").trim().slice(0, 1200);
  if (!OUTCOMES.includes(outcome)) return fail("invalid_outcome");
  if (outcome !== "return" && app.step !== 3) return fail("wrong_step", 409);
  if (outcome !== "approve" && reason.length < 10) return fail("reason_required", 422);
  const draft = app.ai?.reasonDraft;
  const used = !!draft?.text && draft.outcome === outcome;
  const edited = used && draft.text.trim() !== reason;
  app.status = { approve: "approved", reject: "rejected", return: "returned" }[outcome];
  app.decision = { outcome, reason, at: new Date(), byId: user.id, byName: user.name, aiDraftUsed: used, aiDraftEdited: edited };
  app.history.push(logEntry(user, { approve: "approved", reject: "rejected", return: "returned" }[outcome], STEP_OF(app), reason, false, { aiDraftUsed: used, aiDraftEdited: edited }));
  await app.save();
  return NextResponse.json({ application: view(app) });
}
