"use client";
import { FiFilePlus, FiCpu, FiCheckCircle, FiCornerUpLeft, FiXCircle, FiPlay, FiFlag, FiFileText } from "react-icons/fi";
import { useT } from "@/store/useLangStore";
import { fmtDateTime } from "@/lib/i18n";
const ICON = { created: FiFileText, doc_added: FiFilePlus, step_done: FiCheckCircle, approved: FiCheckCircle, rejected: FiXCircle, returned: FiCornerUpLeft, resumed: FiPlay, flag_resolved: FiFlag, flag_reopened: FiFlag };
const TONE = { approved: "bg-(--success) text-white", rejected: "bg-(--danger) text-white", returned: "bg-amber-500 text-white" };
export default function Timeline({ history }) {
  const { t, lang } = useT();
  const items = [...history].reverse();
  const note = (h) => {
    if (!h.note) return "";
    if (h.action === "doc_added" || h.action === "ai_extract") { const [k, ...rest] = h.note.split(" · "); return [t(`doc.${k}`), ...rest].join(" · "); }
    if (h.action === "ai_reason") return t(`dec.${h.note}`);
    if (h.action === "ai_crosscheck") return t("hist.found", { n: h.note });
    if (h.action === "ai_checklist") return t("hist.items", { n: h.note });
    return h.note;
  };
  return (
    <div className="card p-5">
      <h2 className="mb-4 font-display text-xl font-semibold">{t("hist.title")}</h2>
      <ol className="relative space-y-5 border-l-2 border-(--border) pl-6">
        {items.map((h) => {
          const Icon = h.ai ? FiCpu : ICON[h.action] || FiCheckCircle;
          return (
            <li key={h.id} className="relative">
              <span className={`absolute -left-9.5 top-0 flex h-7 w-7 items-center justify-center rounded-full ring-4 ring-white ${TONE[h.action] || (h.ai ? "bg-(--accent-light) text-(--accent)" : "bg-(--bg3) text-(--text2)")}`}><Icon size={14} /></span>
              <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-(--text1)">
                {t(`hist.${h.action}`)}
                {h.ai && <span className="badge badge-teal py-0! text-[11px]!">AI</span>}
                {h.step && <span className="badge badge-neutral py-0! text-[11px]!">{t(`step.${h.step}`)}</span>}
              </div>
              <div className="text-xs text-(--text3)">{h.actorName} · {fmtDateTime(h.at, lang)}</div>
              {note(h) && <div className="mt-1 text-sm text-(--text2) wrap-break-word">{note(h)}</div>}
              {h.meta?.aiDraftUsed && <div className="mt-1 text-xs font-semibold text-(--accent)">{t("dec.aiUsed")} · {h.meta.aiDraftEdited ? t("dec.aiEdited") : t("dec.aiAsIs")}</div>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}