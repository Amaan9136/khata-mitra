"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FiCheckCircle, FiXCircle, FiCornerUpLeft } from "react-icons/fi";
import AiButton from "./AiButton";
import { apiPost } from "@/lib/apiClient";
import { useT } from "@/store/useLangStore";
const META = { approve: ["btn-primary", FiCheckCircle], reject: ["btn-danger", FiXCircle], return: ["btn-warning", FiCornerUpLeft] };
export default function DecisionDialog({ app, outcome, ai, onClose, onDone }) {
  const { t, te } = useT();
  const [reason, setReason] = useState("");
  const [drafted, setDrafted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [cls, Icon] = META[outcome];
  const draft = async () => {
    const d = await ai.run("reason", { outcome });
    if (d?.reason) {
      setReason(d.reason);
      setDrafted(true);
    }
  };
  const confirm = async () => {
    setBusy(true);
    try {
      const d = await apiPost(`/api/applications/${app.id}/decision`, { outcome, reason });
      onDone(d.application);
    } catch (e) {
      toast.error(te(e.code));
      setBusy(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#031f1d]/70 p-3 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} onClick={(e) => e.stopPropagation()} className="card max-h-[92dvh] w-full max-w-lg overflow-y-auto p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-3"><span className={`flex h-12 w-12 items-center justify-center rounded-2xl text-white ${outcome === "approve" ? "bg-(--accent)" : outcome === "reject" ? "bg-(--danger)" : "bg-amber-500"}`}><Icon size={24} /></span><h2 className="m-0 font-display text-xl font-semibold">{t(`dec.confirm.${outcome}`)}</h2></div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2"><label className="label m-0">{outcome === "approve" ? t("dec.reasonOptional") : t("dec.reason")}</label><AiButton small busy={ai.busy === "reason"} onClick={draft}>{t("dec.draft")}</AiButton></div>
        <textarea className="input" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={1200} rows={5} autoFocus />
        {drafted && <p className="mt-2 text-sm font-semibold text-(--accent)">{t("dec.draftNote")}</p>}
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={busy}>{t("cancel")}</button>
          <button type="button" className={`btn ${cls}`} onClick={confirm} disabled={busy || (outcome !== "approve" && reason.trim().length < 10)}>{busy ? <span className="spinner spinner-sm" /> : <Icon size={18} />} {t("dec.yes")}</button>
        </div>
      </motion.div>
    </div>
  );
}
