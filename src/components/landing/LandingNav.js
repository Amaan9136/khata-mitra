"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion, useScroll, useSpring } from "framer-motion";
import { FiMenu, FiX } from "react-icons/fi";
import Logo from "@/components/brand/Logo";
import LangToggle from "@/components/ui/LangToggle";
import { useT } from "@/store/useLangStore";
const LINKS = [["landing.nav.how", "#how"], ["landing.nav.ai", "#ai"], ["landing.nav.benefits", "#benefits"]];
export default function LandingNav() {
  const { t } = useT();
  const { status } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  const cta = status === "authenticated" ? <Link href="/dashboard" className="btn btn-lime">{t("openDashboard")}</Link> : <Link href="/login" className="btn btn-lime">{t("login")}</Link>;
  return (
    <motion.header initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6">
      <div className={`mx-auto flex max-w-6xl items-center justify-between rounded-full px-4 py-2.5 transition-all duration-300 ${scrolled || open ? "glass-dark bg-[#052e2b]/90! shadow-2xl shadow-black/20" : "bg-transparent"}`}>
        <Link href="/"><Logo size={34} withText textClassName="text-white" /></Link>
        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map(([l, h]) => <a key={h} href={h} className="rounded-full px-4 py-2 text-sm font-medium text-teal-50/75! transition hover:bg-white/10 hover:text-white!">{t(l)}</a>)}
        </nav>
        <div className="hidden items-center gap-2 md:flex"><LangToggle dark />{cta}</div>
        <button onClick={() => setOpen((o) => !o)} className="flex h-11 w-11 items-center justify-center rounded-full text-white md:hidden" aria-label="Menu">{open ? <FiX size={22} /> : <FiMenu size={22} />}</button>
      </div>
      {open && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="glass-dark mx-auto mt-2 max-w-6xl rounded-3xl bg-[#052e2b]/95! p-4 md:hidden">
          {LINKS.map(([l, h]) => <a key={h} href={h} onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3.5 text-base font-medium text-teal-50/85! hover:bg-white/10">{t(l)}</a>)}
          <div className="mt-3 flex gap-2"><LangToggle dark />{cta}</div>
        </motion.div>
      )}
      <motion.div style={{ scaleX: progress }} className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-linear-to-r from-teal-300 to-lime-300" />
    </motion.header>
  );
}
