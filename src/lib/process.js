export const STEPS = ["intake", "verification", "inspection", "decision"];
export const SLA_DAYS = 30;
export const DAY_MS = 86400000;
export const MUTATION_TYPES = ["sale", "inheritance"];
export const DOC_KINDS = ["sale_deed", "rtc", "ec", "id_proof", "tax_receipt", "death_certificate", "heir_certificate", "family_tree", "affidavit", "other"];
export const REQUIRED_DOCS = {
  sale: ["sale_deed", "rtc", "ec", "id_proof"],
  inheritance: ["death_certificate", "heir_certificate", "rtc", "id_proof"]
};
export const INTAKE_CHECKS = ["identity", "survey", "complete"];
export const POSSESSION = ["with_applicant", "not_with_applicant", "disputed"];
export const OUTCOMES = ["approve", "reject", "return"];
export const missingDocs = (app) => (REQUIRED_DOCS[app.mutationType] || []).filter((k) => !(app.documents || []).some((d) => d.kind === k));
export const unresolvedHigh = (app) => (app.flags || []).filter((f) => f.severity === "high" && !f.resolved);
export const isOpen = (app) => app.status === "open";
export const dueFrom = (from) => new Date(new Date(from).getTime() + SLA_DAYS * DAY_MS);
export function validateStep(app, step, data) {
  if (step === "intake") {
    const c = data.checks || {};
    if (!INTAKE_CHECKS.every((k) => c[k] === true)) return "intake_checks";
    if (missingDocs(app).length) return "intake_missing";
  }
  if (step === "verification") {
    if (data.reviewed !== true) return "verification_reviewed";
    if (unresolvedHigh(app).length) return "verification_high";
  }
  if (step === "inspection") {
    const items = data.items || [];
    if (!data.visitedAt) return "inspection_date";
    if (!POSSESSION.includes(data.possession)) return "inspection_possession";
    if (!items.length || items.some((i) => !i.done)) return "inspection_items";
  }
  return null;
}
