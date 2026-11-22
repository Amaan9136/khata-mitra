import { groqChat, parseJson, AiError } from "@/lib/groq";
import { missingDocs } from "@/lib/process";
const clip = (s, n) => String(s || "").slice(0, n);
const langRule = (lang) => (lang === "kn" ? "Write every text value in simple, clear Kannada (ಕನ್ನಡ) as a village-level revenue officer would. Keep personal names, numbers, survey numbers and dates exactly as in the records. Keep the JSON keys in English." : "Write every text value in plain English. Keep the JSON keys in English.");
const SYSTEM = "You assist a Karnataka revenue officer (Grama Administrative Officer or Revenue Inspector) who processes khata mutation applications after a sale or an inheritance. You only suggest. The officer makes every decision. Never claim a document is genuine or forged. Only use facts present in the records given. If something is missing or unreadable, say so. Reply with one JSON object only.";
export function brief(app) {
  const p = app.property || {};
  const t = app.transaction || {};
  const docs = (app.documents || []).map((d, i) => `[${i + 1}] kind=${d.kind}; name=${clip(d.name, 120)}\n${d.extracted?.transcription ? clip(d.extracted.transcription, 1200) : clip(d.text, 1200) || "(no text available)"}`).join("\n\n");
  const flags = (app.flags || []).map((f) => `- ${f.severity}: ${f.field}: ${clip(f.finding, 200)}${f.resolved ? ` (resolved by officer: ${clip(f.officerNote, 120)})` : ""}`).join("\n");
  const ins = app.inspection || {};
  return [
    `Application ${app.applicationNo}; type=${app.mutationType}; received ${new Date(app.receivedAt).toISOString().slice(0, 10)}`,
    `Applicant: ${app.applicant?.name} (${app.applicant?.relation || "-"})`,
    `${app.mutationType === "sale" ? "Seller" : "Deceased khatedar"}: ${app.seller?.name}`,
    `Property: Sy.No ${p.surveyNo}, ${p.village}, ${p.hobli} hobli, ${p.taluk} taluk, extent ${p.extent}`,
    `Transaction ref: ${t.refNo || "-"} dated ${t.date ? new Date(t.date).toISOString().slice(0, 10) : "-"}`,
    `Missing required documents: ${missingDocs(app).join(", ") || "none"}`,
    `Documents:\n${docs || "(none)"}`,
    flags ? `Cross-check flags so far:\n${flags}` : "",
    ins.visitedAt ? `Field inspection: visited ${new Date(ins.visitedAt).toISOString().slice(0, 10)}; possession=${ins.possession}; objection=${ins.objection ? "yes" : "no"}; notes=${clip(ins.notes, 400)}; items: ${(ins.items || []).map((i) => `${i.text} [${i.done ? "done" : "open"}${i.note ? `: ${clip(i.note, 100)}` : ""}]`).join(" | ")}` : ""
  ].filter(Boolean).join("\n");
}
async function ask(user, lang, opts = {}) {
  const out = parseJson(await groqChat({ messages: [{ role: "system", content: SYSTEM }, { role: "user", content: `${user}\n\n${langRule(lang)}` }], ...opts }));
  if (!out) throw new AiError("ai_bad_output", "Model did not return JSON");
  return out;
}
const strs = (a, n) => (Array.isArray(a) ? a.map((x) => clip(typeof x === "string" ? x : JSON.stringify(x), 300)).filter(Boolean).slice(0, n) : []);
export async function extractDocument(doc, lang) {
  const task = `Read this document of kind "${doc.kind}" and return JSON: {"transcription": string (the key text, at most 700 characters), "names": [string], "surveyNo": string|null, "extent": string|null, "date": string|null, "registrationNo": string|null, "amount": string|null, "village": string|null, "notes": string (anything unreadable, cut off or suspicious about legibility, else empty)}. Copy values as written; do not guess.`;
  const content = doc.imageData ? [{ type: "text", text: task }, { type: "image_url", image_url: { url: doc.imageData } }] : `${task}\n\nDocument text:\n${clip(doc.text, 4000)}`;
  const out = parseJson(await groqChat({ vision: !!doc.imageData, messages: [{ role: "system", content: SYSTEM }, { role: "user", content }], maxTokens: 3000 }));
  if (!out) throw new AiError("ai_bad_output", "Model did not return JSON");
  const s = (v) => (v == null || v === "null" ? "" : clip(v, 200));
  return { transcription: clip(out.transcription, 900), names: strs(out.names, 8), surveyNo: s(out.surveyNo), extent: s(out.extent), date: s(out.date), registrationNo: s(out.registrationNo), amount: s(out.amount), village: s(out.village), notes: clip(out.notes, 300) };
}
export async function crossCheck(app, lang) {
  const out = await ask(`${brief(app)}\n\nCompare the documents with the application details and with each other: owner and party names (allow Kannada and English spelling variants but mention them as medium), survey number and sub-division (hissa), village and taluk, extent, dates (a deed or certificate must not be later than the application, a death must come before an inheritance claim), and whether the seller or deceased matches the owner on the RTC. Return JSON: {"flags":[{"severity":"high"|"medium"|"low","field":"short field name","finding":"one or two sentences saying exactly what differs and where","docs":["document kinds involved"]}],"consistent":["short statements of what matches properly"]}. high means it could change the legal outcome. At most 8 flags and 5 consistent items. Report only real differences or gaps, never invent any.`, lang, { maxTokens: 4000 });
  const sev = ["high", "medium", "low"];
  return { flags: (Array.isArray(out.flags) ? out.flags : []).slice(0, 8).map((f) => ({ severity: sev.includes(f.severity) ? f.severity : "medium", field: clip(f.field, 80) || "-", finding: clip(f.finding, 400), docs: strs(f.docs, 5) })).filter((f) => f.finding), consistent: strs(out.consistent, 5) };
}
export async function summarise(app, lang) {
  const out = await ask(`${brief(app)}\n\nSummarise this case for the officer in three or four short sentences: who is claiming what, for which land, what has been done so far, and the one thing that most needs the officer's attention now. Return JSON: {"summary": string, "attention": [string]} with at most 3 attention items, each under 20 words.`, lang);
  return { text: clip(out.summary, 900), attention: strs(out.attention, 3) };
}
export async function draftChecklist(app, lang) {
  const out = await ask(`${brief(app)}\n\nPrepare a field inspection checklist for the officer visiting the land. Make it specific to this case and to the cross-check flags. Return JSON: {"items": [string]} with 6 to 8 short imperative items, each under 18 words. Include confirming possession, boundaries, crops against the RTC, and for inheritance the presence of the heirs or statements from neighbours.`, lang);
  return strs(out.items, 8);
}
export async function draftReason(app, outcome, lang) {
  const goal = outcome === "return" ? "a note returning the application to the applicant that lists exactly what documents or clarifications are needed" : outcome === "reject" ? "a reasoned order rejecting the mutation, citing only the facts in the record" : "a short note recording why the mutation is approved";
  const out = await ask(`${brief(app)}\n\nDraft ${goal}. Use a formal but simple tone, at most 80 words, and mention only facts present above. Return JSON: {"reason": string}.`, lang);
  return clip(out.reason, 900);
}
