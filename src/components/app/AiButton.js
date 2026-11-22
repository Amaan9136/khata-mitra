"use client";
import { FiCpu } from "react-icons/fi";
import { useT } from "@/store/useLangStore";
export default function AiButton({ busy, onClick, children, disabled, small = false }) {
  const { t } = useT();
  return (
    <button type="button" onClick={onClick} disabled={busy || disabled} className={`btn btn-secondary border-(--accent-glow)! text-(--accent-dark)! ${small ? "btn-sm" : ""}`}>
      {busy ? <span className="spinner spinner-sm spinner-dark" /> : <FiCpu size={16} />}
      {busy ? t("ai_running") : children}
    </button>
  );
}
export function AiBadge() {
  const { t } = useT();
  return <span className="badge badge-teal"><FiCpu size={12} /> {t("ai_badge")}</span>;
}
