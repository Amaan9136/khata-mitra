"use client";
import Link from "next/link";
import { FiCheck, FiArrowRight } from "react-icons/fi";
import { SectionHead } from "./Reveal";
import Reveal from "./Reveal";
import { useT } from "@/store/useLangStore";
function Card({ title, items, dark }) {
  return (
    <div className={`relative h-full overflow-hidden rounded-3xl p-6 sm:p-8 ${dark ? "bg-linear-to-br from-[#052e2b] to-[#0f6857] text-white grid-lines" : "card card-hover"}`}>
      <h3 className="mb-6 font-display text-3xl font-semibold">{title}</h3>
      <ul className="space-y-4">
        {items.map((i) => (
          <li key={i} className="flex items-start gap-3">
            <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${dark ? "bg-lime-300 text-[#052e2b]" : "bg-(--accent-light) text-(--accent)"}`}><FiCheck size={14} /></span>
            <span className={dark ? "text-teal-50/85" : "text-(--text2)"}>{i}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
export default function Benefits() {
  const { t } = useT();
  return (
    <section id="benefits" className="relative scroll-mt-20 bg-(--bg) px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHead center eyebrow={t("ben.eyebrow")} title={t("ben.title")} />
        <div className="grid gap-5 md:grid-cols-2">
          <Reveal><Card title={t("ben.officers")} items={t("ben.officerItems")} /></Reveal>
          <Reveal delay={0.1}><Card dark title={t("ben.citizens")} items={t("ben.citizenItems")} /></Reveal>
        </div>
        <Reveal className="relative mt-16 overflow-hidden rounded-[2.5rem] bg-linear-to-br from-[#031f1d] via-[#052e2b] to-[#0f6857] px-5 py-14 text-center grid-lines sm:mt-24 sm:py-20">
          <div className="absolute left-1/2 top-0 h-64 w-96 -translate-x-1/2 rounded-full bg-lime-300/20 blur-3xl" />
          <h2 className="relative font-display text-3xl font-semibold text-white sm:text-5xl lg:text-6xl">{t("cta.title")}</h2>
          <p className="relative mx-auto mt-4 max-w-lg text-teal-50/80">{t("cta.sub")}</p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/login" className="btn btn-lime px-7! py-3.5! text-base!">{t("login")} <FiArrowRight /></Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
