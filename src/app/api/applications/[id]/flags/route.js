import { NextResponse } from "next/server";
import { requireOfficer, loadApplication, fail, logEntry, view } from "@/lib/requireOfficer";
import { priorityOf } from "@/lib/priority";
import { missingDocs } from "@/lib/process";
export async function PATCH(request, { params }) {
  const { user, errorResponse } = await requireOfficer();
  if (errorResponse) return errorResponse;
  const app = await loadApplication((await params).id);
  if (!app) return fail("not_found", 404);
  if (app.status !== "open") return fail("not_open", 409);
  const { flagId, resolved, officerNote } = await request.json().catch(() => ({}));
  const flag = app.flags.id(flagId);
  if (!flag) return fail("not_found", 404);
  const note = String(officerNote || "").trim().slice(0, 300);
  if (resolved && flag.severity === "high" && note.length < 3) return fail("note_required", 422);
  flag.resolved = resolved === true;
  flag.officerNote = note;
  app.history.push(logEntry(user, resolved ? "flag_resolved" : "flag_reopened", "verification", `${flag.field}${note ? ` · ${note}` : ""}`));
  await app.save();
  const out = view(app);
  return NextResponse.json({ application: { ...out, priority: priorityOf(out), missing: missingDocs(out) } });
}
