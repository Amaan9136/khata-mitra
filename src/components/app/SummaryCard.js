"use client";
import { FiAlertTriangle } from "react-icons/fi";
import AiButton, { AiBadge } from "./AiButton";
import { useT } from "@/store/useLangStore";
export default function SummaryCard({ app, ai }) {
  const { t } = useT();
  const s = app.ai?.summary;
  return (
    <div className="card mb-5 p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3"><h2 className="font-display text-xl font-semibold">{t("summaryTitle")}</h2><AiBadge /></div>
        {app.status === "open" && <AiButton small busy={ai.busy === "summary"} onClick={() => ai.run("summary")}>{s?.text ? t("regenerate") : t("summaryBtn")}</AiButton>}
      </div>
      {s?.text ? (
        <>
          <p className="text-base leading-relaxed text-(--text1)">{s.text}</p>
          {s.attention?.length > 0 && (
            <ul className="mt-3 space-y-2">
              {s.attention.map((a) => <li key={a} className="flex items-start gap-2 rounded-xl bg-(--warning-bg) px-3 py-2.5 text-sm text-(--warning)"><FiAlertTriangle className="mt-0.5 shrink-0" /> {a}</li>)}
            </ul>
          )}
        </>
      ) : <p className="text-sm text-(--text3)">{t("ai_badge")}</p>}
    </div>
  );
}
