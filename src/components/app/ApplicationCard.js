"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiMapPin, FiUser, FiChevronRight } from "react-icons/fi";
import ReasonChips from "./ReasonChips";
import StatusBadge from "./StatusBadge";
import { useT } from "@/store/useLangStore";
import { fmtDate } from "@/lib/i18n";
const bar = (s) => (s >= 60 ? "bg-(--danger)" : s >= 30 ? "bg-amber-500" : "bg-(--accent-glow)");
export default function ApplicationCard({ app, index = 0 }) {
  const { t, lang } = useT();
  const open = app.status === "open";
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index, 8) * 0.04 }}>
      <Link href={`/applications/${app.id}`} className="card relative flex min-h-28 items-stretch gap-4 overflow-hidden p-4 pl-6 sm:p-5 sm:pl-7">
        <span className={`absolute inset-y-0 left-0 w-2 ${open ? bar(app.priority.score) : app.status === "approved" ? "bg-(--success)" : app.status === "rejected" ? "bg-(--danger)" : "bg-amber-500"}`} />
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-semibold text-(--accent)">{app.applicationNo}</span>
            <span className="badge badge-neutral">{t(`type.${app.mutationType}`)}</span>
            {!open && <StatusBadge status={app.status} />}
          </div>
          <div className="flex items-center gap-2 text-base font-semibold text-(--text1)"><FiUser className="shrink-0 text-(--text3)" size={15} /><span className="truncate">{app.applicant?.name}</span></div>
          <div className="mt-0.5 flex items-center gap-2 text-sm text-(--text2)"><FiMapPin className="shrink-0 text-(--text3)" size={14} /><span className="truncate">{t("surveyNo")} {app.property?.surveyNo} · {app.property?.village}, {app.property?.taluk}</span></div>
          {open ? (
            <>
              <div className="mt-3 flex items-center gap-1.5">
                {[0, 1, 2, 3].map((i) => <span key={i} className={`h-1.5 w-8 rounded-full ${i < app.step ? "bg-(--accent)" : i === app.step ? "bg-(--accent-glow)" : "bg-(--bg3)"}`} />)}
                <span className="ml-2 text-xs font-semibold text-(--text2)">{t(`step.${["intake", "verification", "inspection", "decision"][app.step]}`)}</span>
              </div>
              {app.priority.reasons.length > 0 && <div className="mt-3"><ReasonChips reasons={app.priority.reasons} /></div>}
            </>
          ) : (
            <div className="mt-2 text-sm text-(--text2)">{fmtDate(app.decision?.at, lang)}{app.decision?.reason ? ` · ${app.decision.reason.slice(0, 90)}${app.decision.reason.length > 90 ? "…" : ""}` : ""}</div>
          )}
        </div>
        <div className="hidden shrink-0 flex-col items-end justify-between sm:flex">
          <span className="text-xs text-(--text3)">{t("due")}: {fmtDate(app.dueAt, lang)}</span>
          <FiChevronRight className="text-(--text3)" size={20} />
        </div>
      </Link>
    </motion.div>
  );
}
