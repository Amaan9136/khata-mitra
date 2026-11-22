import { NextResponse } from "next/server";
import { requireOfficer, loadApplication, fail, logEntry, view } from "@/lib/requireOfficer";
export async function POST(request, { params }) {
  const { user, errorResponse } = await requireOfficer();
  if (errorResponse) return errorResponse;
  const app = await loadApplication((await params).id);
  if (!app) return fail("not_found", 404);
  if (app.status !== "returned") return fail("not_returned", 409);
  const { note } = await request.json().catch(() => ({}));
  const now = new Date();
  const paused = Math.max(0, now.getTime() - new Date(app.decision?.at || now).getTime());
  app.dueAt = new Date(new Date(app.dueAt).getTime() + paused);
  app.status = "open";
  app.step = 0;
  app.stepEnteredAt = now;
  app.set("intake.checks", { identity: false, survey: false, complete: false });
  app.set("verification.reviewed", false);
  app.history.push(logEntry(user, "resumed", "intake", String(note || "").slice(0, 300)));
  await app.save();
  return NextResponse.json({ application: view(app) });
}
