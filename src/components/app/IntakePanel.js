"use client";
import { useState } from "react";
import { FiCheck, FiX } from "react-icons/fi";
import { useStepSave } from "./useStepSave";
import { REQUIRED_DOCS, INTAKE_CHECKS } from "@/lib/process";
import { useT } from "@/store/useLangStore";
export default function IntakePanel({ app, readOnly, onApp }) {
  const { t } = useT();
  const { save, busy } = useStepSave(app, onApp);
  const [checks, setChecks] = useState({ identity: false, survey: false, complete: false, ...(app.intake?.checks || {}) });
  const [notes, setNotes] = useState(app.intake?.notes || "");
  const missing = app.missing || [];
  const have = (k) => app.documents.some((d) => d.kind === k);
  const data = { checks: { ...checks, complete: checks.complete && missing.length === 0 }, notes };
  return (
    <div className="card p-5">
      <h2 className="font-display text-xl font-semibold">{t("intake.title")}</h2>
      <p className="mb-4 text-sm text-(--text2)">{t("intake.hint")}</p>
      <div className="mb-5">
        <div className="mb-2 text-sm font-semibold text-(--text2)">{t("requiredDocs")}</div>
        <div className="grid gap-2 sm:grid-cols-2">
          {REQUIRED_DOCS[app.mutationType].map((k) => (
            <div key={k} className={`flex min-h-12 items-center gap-3 rounded-xl px-3 ${have(k) ? "bg-(--success-bg) text-(--success)" : "bg-(--danger-bg) text-(--danger)"}`}>
              {have(k) ? <FiCheck /> : <FiX />}<span className="flex-1 text-sm font-semibold">{t(`doc.${k}`)}</span><span className="text-xs font-semibold">{have(k) ? t("docReceived") : t("docMissing")}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {INTAKE_CHECKS.map((k) => {
          const blocked = k === "complete" && missing.length > 0;
          return (
            <label key={k} className={`flex min-h-14 items-center gap-3 rounded-xl border border-(--border) bg-white/70 px-3 py-2 ${readOnly || blocked ? "opacity-70" : "cursor-pointer"}`}>
              <input type="checkbox" className="check" disabled={readOnly || blocked} checked={checks[k] && !blocked} onChange={(e) => setChecks({ ...checks, [k]: e.target.checked })} />
              <span className="text-base">{t(`check.${k}`)}</span>
            </label>
          );
        })}
        {missing.length > 0 && !readOnly && <p className="text-sm font-semibold text-(--warning)">{t("completeBlocked")}</p>}
      </div>
      <div className="form-group mt-4"><label className="label">{t("notes")}</label><textarea className="input" disabled={readOnly} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={600} /></div>
      {readOnly ? app.intake?.doneBy && <p className="text-sm text-(--text2)">{t("doneBy")}: {app.intake.doneBy}</p> : (
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn btn-secondary" disabled={!!busy} onClick={() => save("intake", data)}>{t("saveDraft")}</button>
          <button type="button" className="btn btn-primary" disabled={!!busy} onClick={() => save("intake", data, true)}>{t("next")}</button>
        </div>
      )}
    </div>
  );
}
