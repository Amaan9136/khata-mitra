"use client";
import { FiGlobe } from "react-icons/fi";
import { useLangStore, useT } from "@/store/useLangStore";
export default function LangToggle({ dark = false, className = "" }) {
  const { lang, t } = useT();
  const setLang = useLangStore((s) => s.setLang);
  return (
    <button type="button" onClick={() => setLang(lang === "kn" ? "en" : "kn")} className={`inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-semibold transition ${dark ? "border-white/25 bg-white/10 text-white hover:bg-white/20" : "border-(--border) bg-white/80 text-(--text1) hover:border-(--accent-glow)"} ${className}`}>
      <FiGlobe size={15} /> {t("langName")}
    </button>
  );
}
