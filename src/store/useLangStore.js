"use client";
import { create } from "zustand";
import { translate } from "@/lib/i18n";
export const useLangStore = create((set) => ({
  lang: "kn",
  hydrate: () => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("km-lang") : null;
    if (saved === "en" || saved === "kn") set({ lang: saved });
  },
  setLang: (lang) => {
    window.localStorage.setItem("km-lang", lang);
    document.documentElement.lang = lang;
    set({ lang });
  }
}));
export function useT() {
  const lang = useLangStore((s) => s.lang);
  return { lang, t: (key, vars) => translate(lang, key, vars), te: (code) => (translate(lang, `err.${code}`) === `err.${code}` ? translate(lang, "errGeneric") : translate(lang, `err.${code}`)) };
}
