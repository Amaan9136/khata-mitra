import { NextResponse } from "next/server";
import { z } from "zod";
import Application from "@/models/Application";
import { requireOfficer, fail, logEntry, view } from "@/lib/requireOfficer";
import { priorityOf, byPriority, NEEDS_ATTENTION } from "@/lib/priority";
import { MUTATION_TYPES, DAY_MS, dueFrom } from "@/lib/process";
const LIST_FIELDS = "applicationNo mutationType applicant seller property receivedAt dueAt stepEnteredAt step status documents.kind flags inspection.objection decision.outcome decision.at decision.reason";
const text = (min, max) => z.string().trim().min(min).max(max);
const createSchema = z.object({
  mutationType: z.enum(MUTATION_TYPES),
  applicant: z.object({ name: text(2, 100), phone: z.string().trim().regex(/^[0-9]{10}$/), relation: text(0, 60).optional() }),
  seller: z.object({ name: text(2, 100) }),
  property: z.object({ surveyNo: text(1, 30), village: text(2, 60), hobli: text(2, 60), taluk: text(2, 60), extent: text(2, 60) }),
  transaction: z.object({ refNo: text(0, 60).optional(), date: z.string().optional() }).optional()
});
export async function GET(request) {
  const { errorResponse } = await requireOfficer();
  if (errorResponse) return errorResponse;
  const url = new URL(request.url);
  const tab = ["pending", "returned", "decided"].includes(url.searchParams.get("tab")) ? url.searchParams.get("tab") : "pending";
  const q = (url.searchParams.get("q") || "").trim().toLowerCase();
  const now = Date.now();
  const rows = (await Application.find().select(LIST_FIELDS).sort({ receivedAt: -1 }).limit(500).lean()).map((a) => ({ ...a, id: String(a._id), _id: undefined, priority: priorityOf(a, now) }));
  const open = rows.filter((a) => a.status === "open");
  const counts = {
    pending: open.length,
    overdue: open.filter((a) => a.priority.reasons.some((r) => r.code === "overdue")).length,
    attention: open.filter((a) => a.priority.score >= NEEDS_ATTENTION).length,
    returned: rows.filter((a) => a.status === "returned").length,
    decided: rows.filter((a) => a.status === "approved" || a.status === "rejected").length,
    decidedWeek: rows.filter((a) => (a.status === "approved" || a.status === "rejected") && now - new Date(a.decision?.at).getTime() < 7 * DAY_MS).length
  };
  const pick = { pending: (a) => a.status === "open", returned: (a) => a.status === "returned", decided: (a) => a.status === "approved" || a.status === "rejected" }[tab];
  let items = rows.filter(pick);
  if (q) items = items.filter((a) => [a.applicationNo, a.applicant?.name, a.seller?.name, a.property?.surveyNo, a.property?.village].some((v) => String(v || "").toLowerCase().includes(q)));
  items = tab === "pending" ? items.sort(byPriority) : items.sort((a, b) => new Date(b.decision?.at || b.receivedAt) - new Date(a.decision?.at || a.receivedAt));
  return NextResponse.json({ items: items.map((a) => ({ ...a, documents: undefined, flags: undefined, docCount: a.documents?.length || 0 })), counts });
}
export async function POST(request) {
  const { user, errorResponse } = await requireOfficer();
  if (errorResponse) return errorResponse;
  const parsed = createSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return fail("invalid", 400, { fields: parsed.error.issues.map((i) => i.path.join(".")) });
  const d = parsed.data;
  const year = new Date().getFullYear();
  let n = (await Application.countDocuments({ applicationNo: new RegExp(`^KM-${year}-`) })) + 1;
  const now = new Date();
  for (let tries = 0; tries < 5; tries++, n++) {
    try {
      const doc = await Application.create({
        applicationNo: `KM-${year}-${String(n).padStart(4, "0")}`,
        mutationType: d.mutationType,
        applicant: d.applicant,
        seller: d.seller,
        property: d.property,
        transaction: { refNo: d.transaction?.refNo || "", date: d.transaction?.date ? new Date(d.transaction.date) : undefined },
        receivedAt: now,
        stepEnteredAt: now,
        dueAt: dueFrom(now),
        history: [logEntry(user, "created", "intake")]
      });
      return NextResponse.json({ application: view(doc) }, { status: 201 });
    } catch (err) {
      if (err?.code !== 11000) throw err;
    }
  }
  return fail("number_conflict", 409);
}
