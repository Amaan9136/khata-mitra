import { NextResponse } from "next/server";
import { requireOfficer, loadApplication, fail, view } from "@/lib/requireOfficer";
import { priorityOf } from "@/lib/priority";
import { missingDocs } from "@/lib/process";
export async function GET(_req, { params }) {
  const { errorResponse } = await requireOfficer();
  if (errorResponse) return errorResponse;
  const app = await loadApplication((await params).id);
  if (!app) return fail("not_found", 404);
  const out = view(app);
  return NextResponse.json({ application: { ...out, priority: priorityOf(out), missing: missingDocs(out) } });
}
