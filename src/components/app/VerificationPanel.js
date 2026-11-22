"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { FiAlertTriangle, FiCheck, FiInfo, FiRotateCcw } from "react-icons/fi";
import AiButton, { AiBadge } from "./AiButton";
import { useStepSave } from "./useStepSave";
import { apiPatch } from "@/lib/apiClient";
import { unresolvedHigh } from "@/lib/process";
import { useT } from "@/store/useLangStore";
const SEV = { high: ["badge-danger", FiAlertTriangle], medium: ["badge-warning", FiInfo], low: ["badge-neutral", FiInfo] };
function Flag({ app, flag, readOnly, onApp }) {
  const { t, te } = useT();
  const [note, setNote] = useState(flag.officerNote || "");
  const [busy, setBusy] = useState(false);
  const [cls, Icon] = SEV[flag.severity];
  const toggle = async (resolved) => {
    setBusy(true);
    try {
      const d = await apiPatch(`/api/applications/${app.id}/flags`, { flagId: flag.id, resolved, officerNote: note });
      onApp(d.application);
    } catch (e) {
      toast.error(te(e.code));
    } finally {
      setBusy(false);
    }
  };
  return (
    <li className={`rounded-2xl border p-4 ${flag.resolved ? "border-(--border) bg-white/60 opacity-80" : flag.severity === "high" ? "border-red-300 bg-red-50/70" : "border-(--border) bg-white/80"}`}>
      <div className="mb-2 flex flex-wrap items-center gap-2"><span className={`badge ${cls}`}><Icon size={13} /> {t(`sev.${flag.severity}`)}</span><span className="text-sm font-semibold">{flag.field}</span>{flag.resolved && <span className="badge badge-success"><FiCheck size={13} /> {t("ver.resolve")}</span>}</div>
      <p className="text-base">{flag.finding}</p>
      {flag.docs?.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{flag.docs.map((d) => <span key={d} className="badge badge-neutral text-xs!">{t(`doc.${d}`)}</span>)}</div>}
      {!readOnly && (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input className="input flex-1" placeholder={t("ver.note")} value={note} onChange={(e) => setNote(e.target.value)} disabled={flag.resolved} maxLength={300} />
          {flag.resolved ? <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => toggle(false)}><FiRotateCcw size={15} /> {t("ver.reopen")}</button> : <button type="button" className="btn btn-primary" disabled={busy} onClick={() => toggle(true)}><FiCheck size={16} /> {t("ver.resolve")}</button>}
        </div>
      )}
      {readOnly && flag.officerNote && <p className="mt-2 text-sm text-(--text2)">{flag.officerNote}</p>}
    </li>
  );
}
export default function VerificationPanel({ app, ai, readOnly, onApp }) {
  const { t } = useT();
  const { save, busy } = useStepSave(app, onApp);
  const [reviewed, setReviewed] = useState(!!app.verification?.reviewed);
  const [notes, setNotes] = useState(app.verification?.notes || "");
  const high = unresolvedHigh(app).length;
  const ran = !!app.ai?.flagsAt;
  const data = { reviewed, notes };
  return (
    <div className="card p-5">
      <div className="mb-1 flex flex-wrap items-center gap-3"><h2 className="font-display text-xl font-semibold">{t("ver.title")}</h2><AiBadge /></div>
      <p className="mb-4 text-sm text-(--text2)">{t("ver.hint")}</p>
      {!readOnly && <div className="mb-4"><AiButton busy={ai.busy === "crosscheck"} disabled={app.documents.length === 0} onClick={() => ai.run("crosscheck")}>{ran ? t("ver.rerun") : t("ver.run")}</AiButton></div>}
      {!ran && app.flags.length === 0 && <p className="mb-4 rounded-xl bg-(--bg3) px-3 py-3 text-sm text-(--text2)">{t("ver.notRun")}</p>}
      {ran && app.flags.length === 0 && <p className="mb-4 flex items-center gap-2 rounded-xl bg-(--success-bg) px-3 py-3 text-sm font-semibold text-(--success)"><FiCheck /> {t("ver.noFlags")}</p>}
      {app.flags.length > 0 && <ul className="mb-4 space-y-3">{app.flags.map((f) => <Flag key={f.id} app={app} flag={f} readOnly={readOnly} onApp={onApp} />)}</ul>}
      {app.consistent?.length > 0 && (
        <div className="mb-4 rounded-2xl bg-(--success-bg) p-4">
          <div className="mb-2 text-sm font-semibold text-(--success)">{t("ver.consistent")}</div>
          <ul className="space-y-1.5">{app.consistent.map((c) => <li key={c} className="flex items-start gap-2 text-sm text-(--text1)"><FiCheck className="mt-0.5 shrink-0 text-(--success)" /> {c}</li>)}</ul>
        </div>
      )}
      <label className={`flex min-h-14 items-center gap-3 rounded-xl border border-(--border) bg-white/70 px-3 py-2 ${readOnly ? "opacity-70" : "cursor-pointer"}`}><input type="checkbox" className="check" disabled={readOnly} checked={reviewed} onChange={(e) => setReviewed(e.target.checked)} /><span className="text-base">{t("ver.reviewed")}</span></label>
      <div className="form-group mt-4"><label className="label">{t("notes")}</label><textarea className="input" disabled={readOnly} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={600} /></div>
      {high > 0 && !readOnly && <p className="mb-3 text-sm font-semibold text-(--danger)">{t("ver.highBlock")}</p>}
      {readOnly ? app.verification?.doneBy && <p className="text-sm text-(--text2)">{t("doneBy")}: {app.verification.doneBy}</p> : (
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn btn-secondary" disabled={!!busy} onClick={() => save("verification", data)}>{t("saveDraft")}</button>
          <button type="button" className="btn btn-primary" disabled={!!busy || high > 0 || !reviewed} onClick={() => save("verification", data, true)}>{t("next")}</button>
        </div>
      )}
    </div>
  );
}
