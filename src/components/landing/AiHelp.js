"use client";
import { FiFileText, FiGitMerge, FiClipboard, FiEdit3, FiShield } from "react-icons/fi";
import { SectionHead } from "./Reveal";
import Reveal from "./Reveal";
import { useT } from "@/store/useLangStore";
const ICONS = [FiFileText, FiGitMerge, FiClipboard, FiEdit3];
export default function AiHelp() {
  const { t } = useT();
  return (
    <section id="ai" className="relative scroll-mt-20 overflow-hidden bg-linear-to-b from-[#031f1d] via-[#052e2b] to-[#0a4a3d] px-5 py-20 grid-lines sm:px-8 sm:py-28">
      <div className="absolute -right-24 top-10 h-96 w-96 animate-drift rounded-full bg-teal-400/20 blur-3xl" />
      <div className="relative mx-auto max-w-6xl">
        <SectionHead dark center eyebrow={t("ai.eyebrow")} title={t("ai.title")} sub={t("ai.sub")} />
        <div className="grid gap-4 sm:grid-cols-2">
          {t("ai.items").map(([title, desc], i) => {
            const Icon = ICONS[i];
            return (
              <Reveal key={title} delay={i * 0.08} y={24}>
                <div className="glass-dark flex h-full items-start gap-4 rounded-3xl p-6 transition">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-lime-300 text-[#052e2b]"><Icon size={22} /></span>
                  <div><h3 className="mb-1 font-display text-xl font-semibold text-white">{title}</h3><p className="text-teal-50/80">{desc}</p></div>
                </div>
              </Reveal>
            );
          })}
        </div>
        <Reveal delay={0.2} className="mx-auto mt-8 flex max-w-2xl items-center justify-center gap-3 rounded-full bg-lime-300 px-6 py-4 text-center font-semibold text-[#052e2b]">
          <FiShield className="shrink-0" size={20} /> {t("ai.promise")}
        </Reveal>
      </div>
    </section>
  );
}
