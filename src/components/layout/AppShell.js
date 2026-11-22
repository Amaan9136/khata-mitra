"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { FiHome, FiPlusCircle, FiLogOut } from "react-icons/fi";
import Logo from "@/components/brand/Logo";
import LangToggle from "@/components/ui/LangToggle";
import PageLoader from "@/components/ui/PageLoader";
import { useT } from "@/store/useLangStore";
const NAV = [{ href: "/dashboard", key: "navDashboard", icon: FiHome }, { href: "/applications/new", key: "navNew", icon: FiPlusCircle }];
const isActive = (path, href) => path === href || (href === "/dashboard" && path.startsWith("/applications") && path !== "/applications/new");
export default function AppShell({ title, children, back }) {
  const { t } = useT();
  const path = usePathname();
  const { data, status } = useSession({ required: true });
  if (status !== "authenticated") return <PageLoader />;
  const user = data.user;
  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-1 self-start border-r border-white/5 bg-linear-to-b from-[#052e2b] via-[#073b36] to-[#0a4a3d] px-3 py-5 md:flex">
        <Link href="/" className="mb-6 px-2"><Logo size={36} withText textClassName="text-white" /></Link>
        {NAV.map(({ href, key, icon: Icon }) => (
          <Link key={href} href={href} className="relative flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-white transition-colors hover:bg-white/10">
            {isActive(path, href) && <motion.span layoutId="side-active" className="absolute inset-0 rounded-xl bg-white/10 ring-1 ring-teal-300/30" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
            <Icon size={19} className="relative" /> <span className="relative">{t(key)}</span>
          </Link>
        ))}
        <div className="mt-auto rounded-2xl bg-white/5 p-3 text-sm text-teal-50">
          <div className="font-semibold">{user.name}</div>
          <div className="text-xs text-teal-100/70">{user.designation}</div>
          <div className="text-xs text-teal-100/50">{user.office}</div>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="mt-3 flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-xl px-2 text-sm text-teal-100 transition hover:bg-white/10"><FiLogOut /> {t("logout")}</button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-(--border) bg-white/75 px-4 py-3 backdrop-blur-xl sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/" className="flex md:hidden"><Logo size={32} /></Link>
            {back && <Link href={back} className="hidden text-sm font-semibold text-(--accent) sm:block">← {t("back")}</Link>}
            <h1 className="m-0 truncate font-display text-xl font-semibold text-(--text1)">{title}</h1>
          </div>
          <div className="flex items-center gap-2"><LangToggle /><button onClick={() => signOut({ callbackUrl: "/" })} aria-label={t("logout")} className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-(--border) bg-white/80 text-(--text2) md:hidden"><FiLogOut size={17} /></button></div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 p-4 pb-28 sm:p-6 md:pb-10">{children}</main>
      </div>
      <nav className="glass-dark fixed inset-x-3 bottom-3 z-40 flex rounded-2xl px-1.5 py-1.5 pb-[calc(6px+env(safe-area-inset-bottom))] shadow-[0_18px_40px_-12px_rgba(5,46,43,.6)] md:hidden">
        {NAV.map(({ href, key, icon: Icon }) => {
          const active = isActive(path, href);
          return (
            <Link key={href} href={href} className={`relative flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl text-xs font-semibold ${active ? "text-white" : "text-teal-100/60"}`}>
              {active && <motion.span layoutId="bottom-active" className="absolute inset-0 rounded-xl bg-white/12 ring-1 ring-teal-300/30" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <Icon size={20} className={`relative ${active ? "text-teal-300" : ""}`} /><span className="relative">{t(key)}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
