"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiCheckCircle, FiZap } from "react-icons/fi";
import Logo from "@/components/brand/Logo";
import LangToggle from "@/components/ui/LangToggle";
import { useT } from "@/store/useLangStore";
const DEMO = [["Suresh Gowda · Revenue Inspector", "ri@khatamitra.in"], ["Kavitha M · Grama Administrative Officer", "gao@khatamitra.in"]];
const DEMO_PASSWORD = "Khata@2026";
function Form() {
  const { t } = useT();
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e, creds) => {
    e?.preventDefault();
    const c = creds || { email, password };
    setError("");
    setBusy(true);
    const res = await signIn("credentials", { ...c, redirect: false });
    setBusy(false);
    if (res?.error || !res?.ok) return setError(t("auth.invalid"));
    router.push(params.get("callbackUrl")?.startsWith("/") ? params.get("callbackUrl") : "/dashboard");
  };
  return (
    <form onSubmit={submit}>
      <h1 className="m-0 mb-1 text-2xl font-semibold">{t("auth.title")}</h1>
      <p className="mb-6 text-sm text-(--text2)">{t("auth.sub")}</p>
      {error && <div className="mb-4 rounded-xl bg-(--danger-bg) px-3 py-3 text-sm text-(--danger)">{error}</div>}
      <div className="form-group">
        <label className="label" htmlFor="email">{t("auth.email")}</label>
        <div className="relative"><FiMail size={16} className="absolute left-3.5 top-4 text-(--text3)" /><input id="email" className="input pl-10!" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /></div>
      </div>
      <div className="form-group">
        <label className="label" htmlFor="password">{t("auth.password")}</label>
        <div className="relative"><FiLock size={16} className="absolute left-3.5 top-4 text-(--text3)" /><input id="password" className="input pl-10!" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required /></div>
      </div>
      <button className="btn btn-primary mt-2 w-full" type="submit" disabled={busy}>{busy ? t("auth.submitting") : t("auth.submit")}</button>
      <div className="mt-6 border-t border-(--border) pt-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-(--text2)"><FiZap size={15} className="text-(--accent)" /> {t("auth.demoHint")}</div>
        <div className="space-y-2">
          {DEMO.map(([label, mail]) => (
            <button key={mail} type="button" disabled={busy} onClick={() => { setEmail(mail); setPassword(DEMO_PASSWORD); submit(null, { email: mail, password: DEMO_PASSWORD }); }} className="btn btn-secondary w-full justify-start! text-left text-sm!">{label}</button>
          ))}
        </div>
      </div>
    </form>
  );
}
export default function LoginPage() {
  const { t } = useT();
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden overflow-hidden bg-linear-to-br from-[#052e2b] via-[#073b36] to-[#0f6857] p-12 text-white grid-lines lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -left-20 top-1/3 h-96 w-96 animate-drift rounded-full bg-teal-400/25 blur-3xl" />
        <div className="absolute -bottom-24 right-0 h-96 w-96 animate-drift rounded-full bg-lime-300/15 blur-3xl [animation-delay:-6s]" />
        <Link href="/" className="relative z-10 w-fit"><Logo size={40} withText textClassName="text-white" /></Link>
        <div className="relative z-10 max-w-md">
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="font-display text-5xl font-semibold">{t("landing.words").slice(0, 4).join(" ")} <span className="text-gradient">{t("landing.words")[4]}</span></motion.h2>
          <ul className="mt-8 space-y-3">
            {t("auth.points").map((p, i) => <motion.li key={p} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.12 }} className="flex items-center gap-3 text-teal-50/85"><FiCheckCircle className="text-lime-300" /> {p}</motion.li>)}
          </ul>
        </div>
        <p className="relative z-10 text-xs text-teal-100/50">© {new Date().getFullYear()} {t("footer.rights")}</p>
      </div>
      <div className="relative flex items-center justify-center overflow-hidden p-5 sm:p-8">
        <div className="absolute -top-24 -right-16 h-72 w-72 animate-drift rounded-full bg-teal-300/25 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-72 w-72 animate-drift rounded-full bg-lime-200/30 blur-3xl [animation-delay:-5s]" />
        <div className="absolute right-4 top-4 z-10"><LangToggle /></div>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="relative w-full max-w-md">
          <div className="mb-6 flex justify-center lg:hidden"><Link href="/"><Logo size={38} withText textClassName="text-(--accent-dark)" /></Link></div>
          <div className="card p-6 shadow-(--shadow-lg) sm:p-8"><Suspense fallback={null}><Form /></Suspense></div>
        </motion.div>
      </div>
    </div>
  );
}
