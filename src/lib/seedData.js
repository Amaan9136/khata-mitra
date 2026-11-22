import { DAY_MS, SLA_DAYS } from "./process.js";
const OFFICERS = [
  { name: "Suresh Gowda", email: "ri@khatamitra.in", designation: "Revenue Inspector", office: "Nandagudi Hobli, Hoskote" },
  { name: "Kavitha M", email: "gao@khatamitra.in", designation: "Grama Administrative Officer", office: "Kolathur Circle, Hoskote" }
];
export const DEMO_PASSWORD = "Khata@2026";
const ago = (now, d, h = 0) => new Date(now - d * DAY_MS - h * 3600000);
const deedText = (o) => `SALE DEED\nRegistered at Sub-Registrar Office, ${o.taluk} on ${o.date}. Document No. ${o.refNo}.\nSeller: ${o.seller}\nPurchaser: ${o.buyer}\nProperty: Sy.No. ${o.sy}, ${o.village} village, ${o.hobli} hobli, ${o.taluk} taluk, extent ${o.extent}.\nSale consideration Rs. ${o.amount}/-. Possession delivered to the purchaser on the date of registration.`;
const rtcText = (o) => `RTC / PAHANI (Record of Rights)\nVillage: ${o.village}, Hobli: ${o.hobli}, Taluk: ${o.taluk}\nSurvey No: ${o.sy}  Extent: ${o.extent}\nOwner (Khatedar): ${o.owner}\nCultivator column: ${o.owner}\nCrops: ${o.crop}\nLiabilities: Nil`;
const ecText = (o) => `ENCUMBRANCE CERTIFICATE (Form 15)\nPeriod: 01-04-2006 to ${o.date}\nProperty: Sy.No. ${o.sy}, ${o.village} village, ${o.taluk} taluk, extent ${o.extent}\nRegistered owner: ${o.owner}\nEncumbrances: ${o.enc}`;
const idText = (o) => `AADHAAR (masked) XXXX XXXX ${o.last4}\nName: ${o.name}\nS/o: ${o.father}\nAddress: ${o.village}, ${o.taluk}`;
const deathText = (o) => `DEATH CERTIFICATE\nRegistration No: ${o.refNo}\nName of the deceased: ${o.name}\nDate of death: ${o.dod}\nPlace of death: ${o.village}\nIssued by Registrar of Births and Deaths on ${o.issued}`;
const heirText = (o) => `LEGAL HEIR CERTIFICATE\nIssued by Tahsildar, ${o.taluk}\nThe deceased ${o.name} of ${o.village} is survived by the following legal heirs:\n${o.heirs}`;
const doc = (kind, name, text, extracted = null) => ({ kind, name, text, extracted, uploadedAt: new Date() });
const hist = (now, d, actor, action, step, note = "", ai = false, meta) => ({ at: ago(now, d), actorId: actor.name, actorName: actor.name, action, step, note, ai, ...(meta ? { meta } : {}) });
export function buildSeed(now = Date.now()) {
  const [ri, gao] = OFFICERS;
  const base = (no, type, recv, applicant, seller, property, tx, extra = {}) => ({
    applicationNo: `KM-2026-${String(no).padStart(4, "0")}`,
    mutationType: type,
    applicant,
    seller,
    property,
    transaction: tx,
    receivedAt: ago(now, recv),
    dueAt: new Date(now - recv * DAY_MS + SLA_DAYS * DAY_MS),
    stepEnteredAt: ago(now, recv),
    step: 0,
    status: "open",
    flags: [],
    consistent: [],
    ai: {},
    ...extra
  });
  const applications = [];
  const p1 = { surveyNo: "45/2", village: "Kolathur", hobli: "Nandagudi", taluk: "Hoskote", extent: "1 Acre 10 Guntas" };
  const s1 = { seller: "Muniyappa S/o Late Venkatappa", buyer: "Ramesh K S/o Krishnappa", sy: "45/2", ...p1, extent: p1.extent, date: "14-08-2026", refNo: "HSK-1-04312-2026-27", amount: "14,50,000" };
  applications.push(base(1, "sale", 38, { name: "Ramesh K", phone: "9886012345", relation: "Purchaser" }, { name: "Muniyappa" }, p1, { refNo: s1.refNo, date: ago(now, 40) }, {
    step: 1,
    stepEnteredAt: ago(now, 30),
    documents: [
      doc("sale_deed", "Sale deed HSK-1-04312", deedText(s1)),
      doc("rtc", "RTC 2026", rtcText({ ...s1, owner: "Muniyappa S/o Venkatappa", crop: "Ragi" })),
      doc("ec", "EC Form 15", ecText({ ...s1, sy: "45/3", owner: "Muniyappa", enc: "Nil" })),
      doc("id_proof", "Aadhaar - purchaser", idText({ last4: "4821", name: "Ramesh K", father: "Krishnappa", village: "Kolathur", taluk: "Hoskote" }))
    ],
    intake: { checks: { identity: true, survey: true, complete: true }, notes: "", doneAt: ago(now, 30), doneBy: gao.name },
    flags: [
      { severity: "high", field: "ಸರ್ವೆ ನಂಬರ್ / Survey No", finding: "ಋಣಭಾರ ಪ್ರಮಾಣಪತ್ರದಲ್ಲಿ ಸರ್ವೆ ನಂ. 45/3 ಇದೆ, ಆದರೆ ಕ್ರಯ ಪತ್ರ ಮತ್ತು ಪಹಣಿಯಲ್ಲಿ 45/2 ಇದೆ.", docs: ["ec", "sale_deed", "rtc"] },
      { severity: "medium", field: "ಮಾಲೀಕರ ಹೆಸರು / Owner name", finding: "ಪಹಣಿಯಲ್ಲಿ 'Muniyappa S/o Venkatappa' ಇದೆ; ಇಸಿಯಲ್ಲಿ ತಂದೆಯ ಹೆಸರಿಲ್ಲದೆ 'Muniyappa' ಮಾತ್ರ ಇದೆ.", docs: ["rtc", "ec"] }
    ],
    ai: { flagsAt: ago(now, 29) },
    history: [hist(now, 38, gao, "created", "intake"), hist(now, 38, gao, "doc_added", "intake", "sale_deed"), hist(now, 38, gao, "doc_added", "intake", "rtc"), hist(now, 37, gao, "doc_added", "intake", "ec"), hist(now, 37, gao, "doc_added", "intake", "id_proof"), hist(now, 30, gao, "step_done", "intake"), hist(now, 29, gao, "ai_crosscheck", "verification", "2", true)]
  }));
  const s2 = { seller: "Lakshmamma W/o Late Chikkanna", buyer: "Manjunath C S/o Chikkanna", sy: "112/1", village: "Hosahalli", hobli: "Jadigenahalli", taluk: "Hoskote", extent: "2 Acres 5 Guntas", date: "02-10-2026", refNo: "HSK-1-05120-2026-27", amount: "21,00,000" };
  applications.push(base(2, "sale", 9, { name: "Manjunath C", phone: "9448123456", relation: "Purchaser" }, { name: "Lakshmamma" }, { surveyNo: s2.sy, village: s2.village, hobli: s2.hobli, taluk: s2.taluk, extent: s2.extent }, { refNo: s2.refNo, date: ago(now, 11) }, {
    step: 1,
    stepEnteredAt: ago(now, 7),
    documents: [
      doc("sale_deed", "Sale deed HSK-1-05120", deedText(s2)),
      doc("rtc", "RTC 2026", rtcText({ ...s2, owner: "Lakshmamma W/o Chikkanna", crop: "Mulberry" })),
      doc("ec", "EC Form 15", ecText({ ...s2, extent: "2 Acres 15 Guntas", owner: "Lakshmamma W/o Chikkanna", enc: "Nil" })),
      doc("id_proof", "Aadhaar - purchaser", idText({ last4: "9033", name: "Manjunath C", father: "Chikkanna", village: "Hosahalli", taluk: "Hoskote" }))
    ],
    intake: { checks: { identity: true, survey: true, complete: true }, notes: "", doneAt: ago(now, 7), doneBy: gao.name },
    history: [hist(now, 9, gao, "created", "intake"), hist(now, 9, gao, "doc_added", "intake", "sale_deed"), hist(now, 9, gao, "doc_added", "intake", "rtc"), hist(now, 8, gao, "doc_added", "intake", "ec"), hist(now, 8, gao, "doc_added", "intake", "id_proof"), hist(now, 7, gao, "step_done", "intake")]
  }));
  const s3 = { name: "Gangamma W/o Late Narayanappa", village: "Byrathi", taluk: "Hoskote", sy: "78/4", hobli: "Sulibele", extent: "1 Acre 20 Guntas", refNo: "BD-2026-1187", dod: "03-07-2026", issued: "21-07-2026" };
  applications.push(base(3, "inheritance", 12, { name: "Narasimha N", phone: "9741234567", relation: "Son of the deceased" }, { name: "Gangamma W/o Narayanappa" }, { surveyNo: s3.sy, village: s3.village, hobli: s3.hobli, taluk: s3.taluk, extent: s3.extent }, { refNo: s3.refNo, date: ago(now, 120) }, {
    documents: [
      doc("death_certificate", "Death certificate BD-2026-1187", deathText(s3)),
      doc("rtc", "RTC 2026", rtcText({ ...s3, owner: "Gangamma W/o Narayanappa", crop: "Maize" })),
      doc("id_proof", "Aadhaar - Narasimha", idText({ last4: "7710", name: "Narasimha N", father: "Narayanappa", village: "Byrathi", taluk: "Hoskote" }))
    ],
    history: [hist(now, 12, gao, "created", "intake"), hist(now, 12, gao, "doc_added", "intake", "death_certificate"), hist(now, 12, gao, "doc_added", "intake", "rtc"), hist(now, 11, gao, "doc_added", "intake", "id_proof")]
  }));
  const s4 = { name: "Late Basavaiah S/o Doddaiah", village: "Anugondanahalli", taluk: "Hoskote", sy: "23/1", hobli: "Nandagudi", extent: "3 Acres", refNo: "BD-2026-0902", dod: "11-04-2026", issued: "02-05-2026", heirs: "1. Shivanna (son)\n2. Rathnamma (daughter)\n3. Puttaswamy (son)" };
  applications.push(base(4, "inheritance", 20, { name: "Shivanna B", phone: "9916543210", relation: "Son of the deceased" }, { name: "Basavaiah S/o Doddaiah" }, { surveyNo: s4.sy, village: s4.village, hobli: s4.hobli, taluk: s4.taluk, extent: s4.extent }, { refNo: s4.refNo, date: ago(now, 150) }, {
    step: 2,
    stepEnteredAt: ago(now, 6),
    documents: [
      doc("death_certificate", "Death certificate BD-2026-0902", deathText(s4)),
      doc("heir_certificate", "Legal heir certificate", heirText(s4)),
      doc("rtc", "RTC 2026", rtcText({ ...s4, owner: "Basavaiah S/o Doddaiah", crop: "Coconut" })),
      doc("id_proof", "Aadhaar - Shivanna", idText({ last4: "1189", name: "Shivanna B", father: "Basavaiah", village: "Anugondanahalli", taluk: "Hoskote" }))
    ],
    intake: { checks: { identity: true, survey: true, complete: true }, doneAt: ago(now, 17), doneBy: gao.name },
    verification: { reviewed: true, notes: "ಹೆಸರುಗಳು ಹೊಂದಿಕೆಯಾಗುತ್ತವೆ", doneAt: ago(now, 6), doneBy: gao.name },
    flags: [{ severity: "medium", field: "ವಾರಸುದಾರರು / Heirs", finding: "ಅರ್ಜಿದಾರರು ತಮ್ಮನ್ನು ಮಾತ್ರ ಉಲ್ಲೇಖಿಸಿದ್ದಾರೆ; ವಾರಸುದಾರರ ಪ್ರಮಾಣಪತ್ರದಲ್ಲಿ ಮೂವರು ಇದ್ದಾರೆ.", docs: ["heir_certificate"], resolved: true, officerNote: "ಎಲ್ಲಾ ಮೂವರ ಹೆಸರು ಪಹಣಿಯಲ್ಲಿ ಸೇರಿಸಲಾಗುವುದು" }],
    inspection: { items: [{ text: "ಜಮೀನು ಯಾರ ಸ್ವಾಧೀನದಲ್ಲಿದೆ ಎಂದು ಖಚಿತಪಡಿಸಿ", done: true, note: "ಮೂವರೂ ಹಾಜರಿದ್ದರು", fromAi: true }, { text: "ಪಹಣಿಯ ಬೆಳೆ ಮತ್ತು ನಿಜವಾದ ಬೆಳೆ ಹೋಲಿಸಿ", done: false, note: "", fromAi: true }, { text: "ನೆರೆಹೊರೆಯವರ ಹೇಳಿಕೆ ಪಡೆಯಿರಿ", done: false, note: "", fromAi: true }], visitedAt: ago(now, 1), possession: "disputed", objection: true, notes: "ಪುಟ್ಟಸ್ವಾಮಿ ಅವರು ಪಾಲಿನ ಬಗ್ಗೆ ಆಕ್ಷೇಪಣೆ ಹೇಳಿದರು" },
    history: [hist(now, 20, gao, "created", "intake"), hist(now, 20, gao, "doc_added", "intake", "death_certificate"), hist(now, 19, gao, "doc_added", "intake", "heir_certificate"), hist(now, 19, gao, "doc_added", "intake", "rtc"), hist(now, 19, gao, "doc_added", "intake", "id_proof"), hist(now, 17, gao, "step_done", "intake"), hist(now, 7, gao, "ai_crosscheck", "verification", "1", true), hist(now, 7, gao, "flag_resolved", "verification", "ವಾರಸುದಾರರು"), hist(now, 6, gao, "step_done", "verification"), hist(now, 1, gao, "ai_checklist", "inspection", "3", true)]
  }));
  const s5 = { seller: "Venkatesh Reddy S/o Appaiah Reddy", buyer: "Anitha R W/o Prakash", sy: "9/3", village: "Thippasandra", hobli: "Jadigenahalli", taluk: "Hoskote", extent: "20 Guntas", date: "05-09-2026", refNo: "HSK-1-03877-2026-27", amount: "9,80,000" };
  applications.push(base(5, "sale", 25, { name: "Anitha R", phone: "9845001122", relation: "Purchaser" }, { name: "Venkatesh Reddy" }, { surveyNo: s5.sy, village: s5.village, hobli: s5.hobli, taluk: s5.taluk, extent: s5.extent }, { refNo: s5.refNo, date: ago(now, 27) }, {
    step: 3,
    stepEnteredAt: ago(now, 2),
    documents: [
      doc("sale_deed", "Sale deed HSK-1-03877", deedText(s5)),
      doc("rtc", "RTC 2026", rtcText({ ...s5, owner: "Venkatesh Reddy S/o Appaiah Reddy", crop: "Vegetables" })),
      doc("ec", "EC Form 15", ecText({ ...s5, owner: "Venkatesh Reddy S/o Appaiah Reddy", enc: "Nil" })),
      doc("id_proof", "Aadhaar - purchaser", idText({ last4: "3302", name: "Anitha R", father: "Prakash", village: "Thippasandra", taluk: "Hoskote" }))
    ],
    intake: { checks: { identity: true, survey: true, complete: true }, doneAt: ago(now, 22), doneBy: gao.name },
    verification: { reviewed: true, notes: "", doneAt: ago(now, 14), doneBy: ri.name },
    consistent: ["ಸರ್ವೆ ನಂಬರ್ 9/3 ಎಲ್ಲಾ ದಾಖಲೆಗಳಲ್ಲಿ ಒಂದೇ ಇದೆ", "ಮಾರಾಟಗಾರರ ಹೆಸರು ಪಹಣಿಯೊಂದಿಗೆ ಹೊಂದಿಕೆಯಾಗುತ್ತದೆ", "ವಿಸ್ತೀರ್ಣ 20 ಗುಂಟೆ ಎಲ್ಲಾ ದಾಖಲೆಗಳಲ್ಲಿ ಒಂದೇ ಇದೆ"],
    inspection: { items: [{ text: "ಖರೀದಿದಾರರ ಸ್ವಾಧೀನ ಖಚಿತಪಡಿಸಿ", done: true, note: "ಬೇಲಿ ಹಾಕಲಾಗಿದೆ", fromAi: true }, { text: "ಗಡಿ ಗುರುತುಗಳನ್ನು ಪರಿಶೀಲಿಸಿ", done: true, note: "", fromAi: true }, { text: "ಬೆಳೆ ಪಹಣಿಯೊಂದಿಗೆ ಹೋಲಿಸಿ", done: true, note: "ತರಕಾರಿ ಬೆಳೆ ಇದೆ", fromAi: true }], visitedAt: ago(now, 3), location: { lat: 13.0702, lng: 77.7983 }, possession: "with_applicant", objection: false, notes: "ಯಾವುದೇ ತಕರಾರು ಇಲ್ಲ", doneAt: ago(now, 2), doneBy: ri.name },
    ai: { flagsAt: ago(now, 15) },
    history: [hist(now, 25, gao, "created", "intake"), hist(now, 25, gao, "doc_added", "intake", "sale_deed"), hist(now, 24, gao, "doc_added", "intake", "rtc"), hist(now, 24, gao, "doc_added", "intake", "ec"), hist(now, 24, gao, "doc_added", "intake", "id_proof"), hist(now, 22, gao, "step_done", "intake"), hist(now, 15, ri, "ai_crosscheck", "verification", "0", true), hist(now, 14, ri, "step_done", "verification"), hist(now, 3, ri, "ai_checklist", "inspection", "3", true), hist(now, 2, ri, "step_done", "inspection")]
  }));
  const s6 = { seller: "Narayana Swamy S/o Munishamappa", buyer: "Divya S W/o Kiran Kumar", sy: "201/5", village: "Kadugodi", hobli: "Nandagudi", taluk: "Hoskote", extent: "1 Acre", date: "17-11-2026", refNo: "HSK-1-06544-2026-27", amount: "18,00,000" };
  applications.push(base(6, "sale", 1, { name: "Divya S", phone: "9731445566", relation: "Purchaser" }, { name: "Narayana Swamy" }, { surveyNo: s6.sy, village: s6.village, hobli: s6.hobli, taluk: s6.taluk, extent: s6.extent }, { refNo: s6.refNo, date: ago(now, 4) }, {
    documents: [
      doc("sale_deed", "Sale deed HSK-1-06544", deedText(s6)),
      doc("rtc", "RTC 2026", rtcText({ ...s6, owner: "Narayana Swamy S/o Munishamappa", crop: "Fallow" })),
      doc("ec", "EC Form 15", ecText({ ...s6, owner: "Narayana Swamy S/o Munishamappa", enc: "Nil" })),
      doc("id_proof", "Aadhaar - purchaser", idText({ last4: "6150", name: "Divya S", father: "Sathish", village: "Kadugodi", taluk: "Hoskote" }))
    ],
    history: [hist(now, 1, gao, "created", "intake"), hist(now, 1, gao, "doc_added", "intake", "sale_deed"), hist(now, 1, gao, "doc_added", "intake", "rtc"), hist(now, 1, gao, "doc_added", "intake", "ec"), hist(now, 1, gao, "doc_added", "intake", "id_proof")]
  }));
  const s7 = { seller: "Rajanna S/o Thimmaiah", buyer: "Harish R S/o Rajanna", sy: "56/2", village: "Chikkahosahalli", hobli: "Sulibele", taluk: "Hoskote", extent: "30 Guntas", date: "20-10-2026", refNo: "HSK-1-05790-2026-27", amount: "7,25,000" };
  applications.push(base(7, "sale", 28, { name: "Harish R", phone: "9902112233", relation: "Purchaser (son of seller)" }, { name: "Rajanna" }, { surveyNo: s7.sy, village: s7.village, hobli: s7.hobli, taluk: s7.taluk, extent: s7.extent }, { refNo: s7.refNo, date: ago(now, 30) }, {
    step: 2,
    stepEnteredAt: ago(now, 4),
    documents: [
      doc("sale_deed", "Sale deed HSK-1-05790", deedText(s7)),
      doc("rtc", "RTC 2026", rtcText({ ...s7, owner: "Rajanna S/o Thimmaiah", crop: "Ragi" })),
      doc("ec", "EC Form 15", ecText({ ...s7, owner: "Rajanna S/o Thimmaiah", enc: "Nil" })),
      doc("id_proof", "Aadhaar - purchaser", idText({ last4: "2204", name: "Harish R", father: "Rajanna", village: "Chikkahosahalli", taluk: "Hoskote" }))
    ],
    intake: { checks: { identity: true, survey: true, complete: true }, doneAt: ago(now, 20), doneBy: gao.name },
    verification: { reviewed: true, doneAt: ago(now, 4), doneBy: gao.name },
    history: [hist(now, 28, gao, "created", "intake"), hist(now, 28, gao, "doc_added", "intake", "sale_deed"), hist(now, 28, gao, "doc_added", "intake", "rtc"), hist(now, 27, gao, "doc_added", "intake", "ec"), hist(now, 27, gao, "doc_added", "intake", "id_proof"), hist(now, 20, gao, "step_done", "intake"), hist(now, 4, gao, "step_done", "verification")]
  }));
  const s8 = { name: "Late Thimmakka W/o Hanumanthappa", village: "Mandur", taluk: "Hoskote", sy: "310/2", hobli: "Nandagudi", extent: "1 Acre 5 Guntas", refNo: "BD-2026-0715", dod: "28-02-2026", issued: "14-03-2026" };
  applications.push(base(8, "inheritance", 14, { name: "Hanumantharaju H", phone: "9880776655", relation: "Son of the deceased" }, { name: "Thimmakka W/o Hanumanthappa" }, { surveyNo: s8.sy, village: s8.village, hobli: s8.hobli, taluk: s8.taluk, extent: s8.extent }, { refNo: s8.refNo, date: ago(now, 170) }, {
    status: "returned",
    stepEnteredAt: ago(now, 5),
    documents: [doc("death_certificate", "Death certificate BD-2026-0715", deathText(s8)), doc("rtc", "RTC 2026", rtcText({ ...s8, owner: "Thimmakka W/o Hanumanthappa", crop: "Ragi" })), doc("id_proof", "Aadhaar - Hanumantharaju", idText({ last4: "8841", name: "Hanumantharaju H", father: "Hanumanthappa", village: "Mandur", taluk: "Hoskote" }))],
    decision: { outcome: "return", reason: "ವಾರಸುದಾರರ ಪ್ರಮಾಣಪತ್ರ ಸಲ್ಲಿಸಿಲ್ಲ. ತಹಶೀಲ್ದಾರರಿಂದ ಪಡೆದ ವಾರಸುದಾರರ ಪ್ರಮಾಣಪತ್ರ ಮತ್ತು ಎಲ್ಲಾ ವಾರಸುದಾರರ ಗುರುತಿನ ಚೀಟಿ ತಂದು ಮತ್ತೆ ಸಲ್ಲಿಸಿ.", at: ago(now, 5), byId: gao.name, byName: gao.name, aiDraftUsed: true, aiDraftEdited: true },
    history: [hist(now, 14, gao, "created", "intake"), hist(now, 14, gao, "doc_added", "intake", "death_certificate"), hist(now, 14, gao, "doc_added", "intake", "rtc"), hist(now, 13, gao, "doc_added", "intake", "id_proof"), hist(now, 5, gao, "ai_reason", "intake", "return", true), hist(now, 5, gao, "returned", "intake", "ವಾರಸುದಾರರ ಪ್ರಮಾಣಪತ್ರ ಸಲ್ಲಿಸಿಲ್ಲ.", false, { aiDraftUsed: true, aiDraftEdited: true })]
  }));
  const s9 = { seller: "Papanna S/o Late Hucchaiah", buyer: "Shobha P W/o Gopal", sy: "88/1", village: "Hullahalli", hobli: "Jadigenahalli", taluk: "Hoskote", extent: "1 Acre 30 Guntas", date: "11-09-2026", refNo: "HSK-1-04001-2026-27", amount: "16,40,000" };
  applications.push(base(9, "sale", 33, { name: "Shobha P", phone: "9900334455", relation: "Purchaser" }, { name: "Papanna" }, { surveyNo: s9.sy, village: s9.village, hobli: s9.hobli, taluk: s9.taluk, extent: s9.extent }, { refNo: s9.refNo, date: ago(now, 38) }, {
    step: 3,
    status: "approved",
    documents: [doc("sale_deed", "Sale deed HSK-1-04001", deedText(s9)), doc("rtc", "RTC 2026", rtcText({ ...s9, owner: "Papanna S/o Hucchaiah", crop: "Ragi" })), doc("ec", "EC Form 15", ecText({ ...s9, owner: "Papanna S/o Hucchaiah", enc: "Nil" })), doc("id_proof", "Aadhaar - purchaser", idText({ last4: "5517", name: "Shobha P", father: "Gopal", village: "Hullahalli", taluk: "Hoskote" }))],
    intake: { checks: { identity: true, survey: true, complete: true }, doneAt: ago(now, 30), doneBy: gao.name },
    verification: { reviewed: true, doneAt: ago(now, 20), doneBy: ri.name },
    inspection: { items: [{ text: "ಸ್ವಾಧೀನ ಖಚಿತಪಡಿಸಿ", done: true, note: "", fromAi: false }], visitedAt: ago(now, 6), possession: "with_applicant", objection: false, notes: "", doneAt: ago(now, 5), doneBy: ri.name },
    decision: { outcome: "approve", reason: "ಎಲ್ಲಾ ದಾಖಲೆಗಳು ಹೊಂದಿಕೆಯಾಗಿವೆ, ಸ್ಥಳದಲ್ಲಿ ಖರೀದಿದಾರರ ಸ್ವಾಧೀನ ಖಚಿತವಾಗಿದೆ, ತಕರಾರು ಇಲ್ಲ.", at: ago(now, 3), byId: ri.name, byName: ri.name, aiDraftUsed: false, aiDraftEdited: false },
    history: [hist(now, 33, gao, "created", "intake"), hist(now, 30, gao, "step_done", "intake"), hist(now, 20, ri, "step_done", "verification"), hist(now, 5, ri, "step_done", "inspection"), hist(now, 3, ri, "approved", "decision", "ಎಲ್ಲಾ ದಾಖಲೆಗಳು ಹೊಂದಿಕೆಯಾಗಿವೆ.", false, { aiDraftUsed: false, aiDraftEdited: false })]
  }));
  const s10 = { name: "Late Kempegowda S/o Byregowda", village: "Avalahalli", taluk: "Hoskote", sy: "17/6", hobli: "Sulibele", extent: "2 Acres", refNo: "BD-2026-0455", dod: "09-01-2026", issued: "30-01-2026", heirs: "1. Mahadevi (wife)" };
  applications.push(base(10, "inheritance", 26, { name: "Chandrashekar K", phone: "9611889900", relation: "Claims to be son of the deceased" }, { name: "Kempegowda S/o Byregowda" }, { surveyNo: s10.sy, village: s10.village, hobli: s10.hobli, taluk: s10.taluk, extent: s10.extent }, { refNo: s10.refNo, date: ago(now, 200) }, {
    step: 2,
    status: "rejected",
    documents: [doc("death_certificate", "Death certificate BD-2026-0455", deathText(s10)), doc("heir_certificate", "Legal heir certificate", heirText(s10)), doc("rtc", "RTC 2026", rtcText({ ...s10, owner: "Kempegowda S/o Byregowda", crop: "Coconut" })), doc("id_proof", "Aadhaar - Chandrashekar", idText({ last4: "9921", name: "Chandrashekar K", father: "Kempegowda", village: "Avalahalli", taluk: "Hoskote" }))],
    intake: { checks: { identity: true, survey: true, complete: true }, doneAt: ago(now, 22), doneBy: gao.name },
    verification: { reviewed: true, doneAt: ago(now, 15), doneBy: gao.name },
    inspection: { items: [{ text: "ವಾರಸುದಾರರ ಹಾಜರಾತಿ ಖಚಿತಪಡಿಸಿ", done: true, note: "ಮಹಾದೇವಿ ಅವರು ಮಗನಿಲ್ಲವೆಂದು ಹೇಳಿದರು", fromAi: true }], visitedAt: ago(now, 8), possession: "disputed", objection: true, notes: "ಪತ್ನಿ ಮಹಾದೇವಿ ಅರ್ಜಿದಾರರ ಹಕ್ಕನ್ನು ವಿರೋಧಿಸಿದರು", doneAt: ago(now, 7), doneBy: ri.name },
    decision: { outcome: "reject", reason: "ವಾರಸುದಾರರ ಪ್ರಮಾಣಪತ್ರದಲ್ಲಿ ಅರ್ಜಿದಾರರ ಹೆಸರಿಲ್ಲ. ಸ್ಥಳ ಪರಿಶೀಲನೆಯಲ್ಲಿ ಮೃತರ ಪತ್ನಿ ಹಕ್ಕನ್ನು ವಿರೋಧಿಸಿದ್ದಾರೆ. ಸಿವಿಲ್ ನ್ಯಾಯಾಲಯದಿಂದ ಹಕ್ಕು ಸ್ಥಾಪಿಸಿದ ನಂತರ ಮತ್ತೆ ಸಲ್ಲಿಸಬಹುದು.", at: ago(now, 6), byId: ri.name, byName: ri.name, aiDraftUsed: true, aiDraftEdited: false },
    history: [hist(now, 26, gao, "created", "intake"), hist(now, 22, gao, "step_done", "intake"), hist(now, 15, gao, "step_done", "verification"), hist(now, 8, ri, "ai_checklist", "inspection", "5", true), hist(now, 7, ri, "step_done", "inspection"), hist(now, 6, ri, "ai_reason", "decision", "reject", true), hist(now, 6, ri, "rejected", "decision", "ವಾರಸುದಾರರ ಪ್ರಮಾಣಪತ್ರದಲ್ಲಿ ಅರ್ಜಿದಾರರ ಹೆಸರಿಲ್ಲ.", false, { aiDraftUsed: true, aiDraftEdited: false })]
  }));
  return { users: OFFICERS, applications };
}
