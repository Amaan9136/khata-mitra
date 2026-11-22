"use client";
import Link from "next/link";
import Logo from "@/components/brand/Logo";
import LangToggle from "@/components/ui/LangToggle";
import { useT } from "@/store/useLangStore";
export default function Footer() {
  const { t } = useT();
  return (
    <footer className="bg-[#031f1d] px-5 py-12 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
        <Logo size={34} withText textClassName="text-white" />
        <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-teal-100/70">
          <Link href="/login" className="hover:text-white!">{t("login")}</Link>
          <LangToggle dark />
        </nav>
        <p className="text-xs text-teal-100/50">© {new Date().getFullYear()} {t("footer.rights")}</p>
      </div>
    </footer>
  );
}
