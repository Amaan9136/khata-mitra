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
const t = (key, vars) => translate(useLangStore.getState().lang, key, vars);
const te = (code) => (t(`err.${code}`) === `err.${code}` ? t("errGeneric") : t(`err.${code}`));
export function useT() {
  const lang = useLangStore((s) => s.lang);
  return { lang, t, te };
}