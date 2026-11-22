"use client";
import { useT } from "@/store/useLangStore";
export default function Logo({ size = 32, withText = false, className = "", textClassName = "" }) {
  const { t } = useT();
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label={t("brand")}>
        <defs>
          <linearGradient id="km-g1" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2dd4bf" />
            <stop offset="1" stopColor="#0f6857" />
          </linearGradient>
          <linearGradient id="km-g2" x1="64" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse">
            <stop stopColor="#a3e635" />
            <stop offset="1" stopColor="#14b8a6" />
          </linearGradient>
        </defs>
        <rect x="6" y="6" width="22" height="22" rx="5" fill="url(#km-g1)" />
        <rect x="36" y="6" width="22" height="22" rx="5" fill="url(#km-g1)" opacity=".55" />
        <rect x="6" y="36" width="22" height="22" rx="5" fill="url(#km-g1)" opacity=".55" />
        <rect x="36" y="36" width="22" height="22" rx="11" fill="url(#km-g2)" />
        <path d="M42.5 47.5l4 4 7-8" stroke="#052e2b" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {withText && <span className={`font-display text-xl font-bold tracking-tight ${textClassName}`}>{t("brand")}</span>}
    </span>
  );
}
