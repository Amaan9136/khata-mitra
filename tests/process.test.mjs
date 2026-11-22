import test from "node:test";
import assert from "node:assert/strict";
import { missingDocs, validateStep, unresolvedHigh, dueFrom, SLA_DAYS, DAY_MS } from "../src/lib/process.js";
import { priorityOf, byPriority, NEEDS_ATTENTION } from "../src/lib/priority.js";
import { parseJson } from "../src/lib/groq.js";
import { buildSeed } from "../src/lib/seedData.js";
import { dict } from "../src/lib/i18n.js";
const NOW = Date.UTC(2026, 10, 22);
const app = (o = {}) => ({ mutationType: "sale", status: "open", receivedAt: new Date(NOW - 2 * DAY_MS), dueAt: new Date(NOW + 20 * DAY_MS), stepEnteredAt: new Date(NOW - 2 * DAY_MS), documents: ["sale_deed", "rtc", "ec", "id_proof"].map((kind) => ({ kind })), flags: [], ...o });
test("missingDocs lists required documents that are absent", () => {
  assert.deepEqual(missingDocs(app()), []);
  assert.deepEqual(missingDocs(app({ documents: [{ kind: "rtc" }] })), ["sale_deed", "ec", "id_proof"]);
  assert.deepEqual(missingDocs(app({ mutationType: "inheritance", documents: [{ kind: "rtc" }, { kind: "id_proof" }] })), ["death_certificate", "heir_certificate"]);
});
test("dueFrom adds the service window", () => {
  assert.equal(dueFrom(NOW).getTime() - NOW, SLA_DAYS * DAY_MS);
});
test("intake needs every check and every required document", () => {
  const checks = { identity: true, survey: true, complete: true };
  assert.equal(validateStep(app(), "intake", { checks }), null);
  assert.equal(validateStep(app(), "intake", { checks: { ...checks, survey: false } }), "intake_checks");
  assert.equal(validateStep(app({ documents: [] }), "intake", { checks }), "intake_missing");
});
test("verification is blocked by unresolved serious flags", () => {
  const flags = [{ severity: "high", resolved: false }, { severity: "medium", resolved: false }];
  assert.equal(unresolvedHigh(app({ flags })).length, 1);
  assert.equal(validateStep(app({ flags }), "verification", { reviewed: true }), "verification_high");
  assert.equal(validateStep(app({ flags: [{ severity: "high", resolved: true }] }), "verification", { reviewed: true }), null);
  assert.equal(validateStep(app(), "verification", { reviewed: false }), "verification_reviewed");
});
test("inspection needs a date, a possession status and all items done", () => {
  const ok = { visitedAt: new Date(NOW), possession: "with_applicant", items: [{ done: true }] };
  assert.equal(validateStep(app(), "inspection", ok), null);
  assert.equal(validateStep(app(), "inspection", { ...ok, visitedAt: null }), "inspection_date");
  assert.equal(validateStep(app(), "inspection", { ...ok, possession: "" }), "inspection_possession");
  assert.equal(validateStep(app(), "inspection", { ...ok, items: [{ done: true }, { done: false }] }), "inspection_items");
  assert.equal(validateStep(app(), "inspection", { ...ok, items: [] }), "inspection_items");
});
test("overdue applications outrank everything else", () => {
  const overdue = priorityOf(app({ dueAt: new Date(NOW - 8 * DAY_MS) }), NOW);
  assert.equal(overdue.reasons[0].code, "overdue");
  assert.equal(overdue.reasons[0].n, 8);
  assert.ok(overdue.score >= NEEDS_ATTENTION);
  assert.ok(overdue.score > priorityOf(app({ documents: [] }), NOW).score);
});
test("a calm application scores zero and closed ones are ignored", () => {
  assert.equal(priorityOf(app(), NOW).score, 0);
  assert.equal(priorityOf(app({ status: "approved" }), NOW).score, -1);
});
test("missing documents, objections and idle time add reasons", () => {
  const p = priorityOf(app({ documents: [{ kind: "rtc" }], inspection: { objection: true }, stepEnteredAt: new Date(NOW - 9 * DAY_MS) }), NOW);
  assert.deepEqual(p.reasons.map((r) => r.code).sort(), ["idle", "missing_docs", "objection"]);
});
test("a due date today still reads as due soon", () => {
  assert.equal(priorityOf(app({ dueAt: new Date(NOW) }), NOW).reasons[0].code, "due_soon");
});
test("byPriority sorts by score then by due date", () => {
  const a = { priority: { score: 10 }, dueAt: new Date(NOW + 5 * DAY_MS) };
  const b = { priority: { score: 10 }, dueAt: new Date(NOW + 1 * DAY_MS) };
  const c = { priority: { score: 50 }, dueAt: new Date(NOW + 9 * DAY_MS) };
  assert.deepEqual([a, b, c].sort(byPriority), [c, b, a]);
});
test("parseJson survives code fences and chatter around the object", () => {
  assert.deepEqual(parseJson('{"a":1}'), { a: 1 });
  assert.deepEqual(parseJson('Here you go:\n```json\n{"a":[1,2]}\n```'), { a: [1, 2] });
  assert.deepEqual(parseJson('<think>maybe {"x":0} first</think>{"a":3}'), { a: 3 });
  assert.equal(parseJson("no json at all"), null);
});
test("seed data is internally consistent", () => {
  const { users, applications } = buildSeed(NOW);
  assert.equal(users.length, 2);
  assert.equal(new Set(applications.map((a) => a.applicationNo)).size, applications.length);
  for (const a of applications) {
    assert.ok(a.history.length > 0, a.applicationNo);
    if (a.status !== "open") assert.ok(a.decision?.outcome, a.applicationNo);
    if (a.step >= 1) assert.deepEqual(missingDocs(a), [], a.applicationNo);
  }
  const open = applications.filter((a) => a.status === "open");
  assert.ok(open.some((a) => priorityOf(a, NOW).reasons.some((r) => r.code === "overdue")));
  assert.ok(open.some((a) => missingDocs(a).length));
});
test("every Kannada string has an English twin", () => {
  assert.deepEqual(Object.keys(dict.kn).sort(), Object.keys(dict.en).sort());
});
