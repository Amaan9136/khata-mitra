"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { FiCheckCircle, FiXCircle, FiCornerUpLeft, FiPlay } from "react-icons/fi";
import { apiPost } from "@/lib/apiClient";
import { unresolvedHigh } from "@/lib/process";
import { useT } from "@/store/useLangStore";
import { fmtDate } from "@/lib/i18n";
const FINAL = { approved: ["bg-(--success-bg)", "text-(--success)", FiCheckCircle], rejected: ["bg-(--danger-bg)", "text-(--danger)", FiXCircle], returned: ["bg-(--warning-bg)", "text-(--warning)", FiCornerUpLeft] };
export default function DecisionPanel({ app, onApp, onDecide }) {
  const { t, te, lang } = useT();
  const [busy, setBusy] = useState(false);
  const ins = app.inspection || {};
  const dec = app.decision;
  const resume = async () => {
    setBusy(true);
    try {
      const d = await apiPost(`/api/applications/${app.id}/resume`, { note: t("dec.resumeNote") });
      onApp(d.application, true);
    } catch (e) {
      toast.error(te(e.code));
    } finally {
      setBusy(false);
    }
  };
  if (app.status !== "open") {
    const [bg, fg, Icon] = FINAL[app.status];
    return (
      <div className="card p-5">
        <div className={`mb-4 flex items-center gap-3 rounded-2xl p-4 ${bg} ${fg}`}><Icon size={26} /><div className="font-display text-lg font-semibold">{t(`dec.final.${app.status}`)}</div></div>
        {dec?.reason && <p className="mb-3 whitespace-pre-wrap text-base">{dec.reason}</p>}
        <p className="text-sm text-(--text2)">{t("dec.byAt", { name: dec?.byName, date: fmtDate(dec?.at, lang) })}</p>
        {dec?.aiDraftUsed && <p className="mt-1 text-sm font-semibold text-(--accent)">{t("dec.aiUsed")} · {dec.aiDraftEdited ? t("dec.aiEdited") : t("dec.aiAsIs")}</p>}
        {app.status === "returned" && <div className="mt-4"><p className="mb-3 text-sm text-(--text2)">{t("dec.clockPaused")}</p><button type="button" className="btn btn-primary" disabled={busy} onClick={resume}><FiPlay size={16} /> {t("dec.resume")}</button></div>}
      </div>
    );
  }
  const high = unresolvedHigh(app).length;
  return (
    <div className="card p-5">
      <h2 className="font-display text-xl font-semibold">{t("dec.title")}</h2>
      <p className="mb-4 text-sm text-(--text2)">{t("dec.hint")}</p>
      <div className="mb-5 rounded-2xl bg-(--bg3) p-4">
        <div className="mb-2 text-sm font-semibold text-(--text2)">{t("dec.summaryTitle")}</div>
        <ul className="space-y-1.5 text-sm">
          <li>{t("ver.title")}: {high > 0 ? <b className="text-(--danger)">{t("reason.flags", { n: high })}</b> : app.flags.length ? `${app.flags.filter((f) => f.resolved).length}/${app.flags.length} ${t("ver.resolve")}` : t("ver.noFlags")}</li>
          <li>{t("ins.possession")}: <b>{ins.possession ? t(`pos.${ins.possession}`) : "–"}</b></li>
          <li>{t("ins.objection")}: <b className={ins.objection ? "text-(--danger)" : ""}>{ins.objection ? "✓" : "✗"}</b></li>
          {ins.notes && <li>{ins.notes}</li>}
        </ul>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <button type="button" className="btn btn-primary h-16! text-base!" onClick={() => onDecide("approve")}><FiCheckCircle size={20} /> {t("dec.approve")}</button>
        <button type="button" className="btn btn-danger h-16! text-base!" onClick={() => onDecide("reject")}><FiXCircle size={20} /> {t("dec.reject")}</button>
        <button type="button" className="btn btn-warning h-16! text-base!" onClick={() => onDecide("return")}><FiCornerUpLeft size={20} /> {t("dec.return")}</button>
      </div>
    </div>
  );
}
