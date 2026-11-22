"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiMapPin, FiPlus, FiMessageSquare } from "react-icons/fi";
import AiButton, { AiBadge } from "./AiButton";
import { useStepSave } from "./useStepSave";
import { POSSESSION } from "@/lib/process";
import { useT } from "@/store/useLangStore";
const day = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");
export default function InspectionPanel({ app, ai, readOnly, onApp }) {
  const { t } = useT();
  const { save, busy } = useStepSave(app, onApp);
  const ins = app.inspection || {};
  const [items, setItems] = useState(ins.items || []);
  const [visitedAt, setVisitedAt] = useState(day(ins.visitedAt) || day(new Date()));
  const [location, setLocation] = useState(ins.location?.lat ? ins.location : null);
  const [possession, setPossession] = useState(ins.possession || "");
  const [objection, setObjection] = useState(!!ins.objection);
  const [notes, setNotes] = useState(ins.notes || "");
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState({});
  useEffect(() => setItems(app.inspection?.items || []), [app.ai?.checklistAt]);
  const data = { items, visitedAt, location, possession, objection, notes };
  const left = items.filter((i) => !i.done).length;
  const patch = (i, p) => setItems(items.map((x, n) => (n === i ? { ...x, ...p } : x)));
  const add = () => {
    if (!draft.trim()) return;
    setItems([...items, { text: draft.trim(), done: false, note: "" }]);
    setDraft("");
  };
  const runAi = async () => {
    if (!(await save("inspection", data, false, true))) return;
    ai.run("checklist");
  };
  const locate = () => navigator.geolocation?.getCurrentPosition((p) => setLocation({ lat: +p.coords.latitude.toFixed(6), lng: +p.coords.longitude.toFixed(6) }), () => toast.error(t("ins.locationFail")), { enableHighAccuracy: true, timeout: 12000 }) ?? toast.error(t("ins.locationFail"));
  return (
    <div className="card p-5">
      <div className="mb-1 flex flex-wrap items-center gap-3"><h2 className="font-display text-xl font-semibold">{t("ins.title")}</h2><AiBadge /></div>
      <p className="mb-4 text-sm text-(--text2)">{t("ins.hint")}</p>
      {!readOnly && <div className="mb-4"><AiButton busy={ai.busy === "checklist" || busy === "save"} onClick={runAi}>{app.ai?.checklistAt ? t("ins.aiAgain") : t("ins.ai")}</AiButton></div>}
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li key={it.id || `n${i}`} className="rounded-xl border border-(--border) bg-white/70 p-3">
            <div className="flex items-start gap-3">
              <input type="checkbox" className="check mt-0.5" disabled={readOnly} checked={it.done} onChange={(e) => patch(i, { done: e.target.checked })} />
              <span className={`flex-1 text-base ${it.done ? "text-(--text2) line-through decoration-(--text3)" : ""}`}>{it.text}</span>
              {it.fromAi && <span className="badge badge-teal text-[11px]!">AI</span>}
              {!readOnly && <button type="button" aria-label={t("ins.itemNote")} onClick={() => setOpen({ ...open, [i]: !open[i] })} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-(--text3) hover:bg-(--bg3)"><FiMessageSquare size={16} /></button>}
            </div>
            {(open[i] || (readOnly && it.note)) && <input className="input mt-2" disabled={readOnly} placeholder={t("ins.itemNote")} value={it.note || ""} onChange={(e) => patch(i, { note: e.target.value })} maxLength={300} />}
            {!open[i] && !readOnly && it.note && <p className="mt-1 pl-10 text-sm text-(--text2)">{it.note}</p>}
          </li>
        ))}
      </ul>
      {!readOnly && (
        <div className="mt-3 flex gap-2">
          <input className="input flex-1" placeholder={t("ins.itemPh")} value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())} maxLength={200} />
          <button type="button" className="btn btn-secondary" onClick={add} aria-label={t("ins.addItem")}><FiPlus size={18} /></button>
        </div>
      )}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div><label className="label">{t("ins.visit")}</label><input type="date" className="input" disabled={readOnly} value={visitedAt} onChange={(e) => setVisitedAt(e.target.value)} /></div>
        <div>
          <label className="label">{t("ins.location")}</label>
          {location ? <div className="flex min-h-12 items-center gap-2 rounded-xl bg-(--success-bg) px-3 text-sm font-semibold text-(--success)"><FiMapPin /> {location.lat}, {location.lng}</div> : null}
          {!readOnly && <button type="button" className={`btn btn-secondary w-full ${location ? "mt-2" : ""}`} onClick={locate}><FiMapPin size={16} /> {t("ins.capture")}</button>}
        </div>
      </div>
      <div className="mt-5">
        <div className="label">{t("ins.possession")}</div>
        <div className="grid gap-2 sm:grid-cols-3">
          {POSSESSION.map((p) => <button key={p} type="button" disabled={readOnly} onClick={() => setPossession(p)} className={`min-h-14 cursor-pointer rounded-xl border px-3 text-sm font-semibold transition ${possession === p ? "border-(--accent) bg-(--accent-light) text-(--accent-dark)" : "border-(--border) bg-white/70 text-(--text2)"} ${p === "disputed" && possession === p ? "border-(--danger)! bg-(--danger-bg)! text-(--danger)!" : ""}`}>{t(`pos.${p}`)}</button>)}
        </div>
      </div>
      <label className={`mt-4 flex min-h-14 items-center gap-3 rounded-xl border border-(--border) bg-white/70 px-3 py-2 ${readOnly ? "opacity-70" : "cursor-pointer"}`}><input type="checkbox" className="check" disabled={readOnly} checked={objection} onChange={(e) => setObjection(e.target.checked)} /><span className="text-base">{t("ins.objection")}</span></label>
      <div className="form-group mt-4"><label className="label">{t("ins.notes")}</label><textarea className="input" disabled={readOnly} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={1000} /></div>
      {readOnly ? ins.doneBy && <p className="text-sm text-(--text2)">{t("doneBy")}: {ins.doneBy}</p> : (
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="btn btn-secondary" disabled={!!busy} onClick={() => save("inspection", data)}>{t("saveDraft")}</button>
          <button type="button" className="btn btn-primary" disabled={!!busy || left > 0 || !items.length || !possession} onClick={() => save("inspection", data, true)}>{t("next")}</button>
          {left > 0 && <span className="text-sm font-semibold text-(--warning)">{t("ins.left", { n: left })}</span>}
        </div>
      )}
    </div>
  );
}
