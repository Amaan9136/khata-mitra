"use client";
import { FiAlertCircle, FiClock, FiFileText, FiAlertTriangle, FiUsers, FiPause } from "react-icons/fi";
import { useT } from "@/store/useLangStore";
const META = { overdue: ["badge-danger", FiAlertCircle], due_soon: ["badge-warning", FiClock], missing_docs: ["badge-warning", FiFileText], flags: ["badge-danger", FiAlertTriangle], objection: ["badge-danger", FiUsers], idle: ["badge-neutral", FiPause] };
export default function ReasonChips({ reasons = [] }) {
  const { t } = useT();
  return (
    <div className="flex flex-wrap gap-2">
      {reasons.map((r) => {
        const [cls, Icon] = META[r.code] || ["badge-neutral", FiClock];
        return <span key={r.code} className={`badge ${cls}`}><Icon size={13} /> {t(r.code === "due_soon" && r.n === 0 ? "reason.due_today" : `reason.${r.code}`, { n: r.n })}</span>;
      })}
    </div>
  );
}
