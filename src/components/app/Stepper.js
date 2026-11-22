"use client";
import { FiCheck } from "react-icons/fi";
import { STEPS } from "@/lib/process";
import { useT } from "@/store/useLangStore";
export default function Stepper({ app, view, onView }) {
  const { t } = useT();
  const done = app.status === "open" ? app.step : 4;
  return (
    <div className="card mb-5 flex items-stretch gap-1 overflow-x-auto p-2">
      {STEPS.map((s, i) => {
        const complete = i < done;
        const active = i === view;
        const reachable = i <= app.step;
        return (
          <button key={s} type="button" disabled={!reachable} onClick={() => onView(i)} className={`flex min-h-16 min-w-27 flex-1 cursor-pointer items-center gap-3 rounded-xl px-3 text-left transition disabled:cursor-default ${active ? "bg-(--accent-light) ring-1 ring-(--accent-glow)" : "hover:bg-(--bg3) disabled:hover:bg-transparent"}`}>
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${complete ? "bg-(--accent) text-white" : i === app.step && app.status === "open" ? "text-white" : "bg-(--bg3) text-(--text3)"}`} style={i === app.step && app.status === "open" && !complete ? { background: "var(--gradient)" } : undefined}>{complete ? <FiCheck size={17} /> : i + 1}</span>
            <span className={`text-sm font-semibold leading-tight ${reachable ? "text-(--text1)" : "text-(--text3)"}`}>{t(`step.${s}`)}</span>
          </button>
        );
      })}
    </div>
  );
}
