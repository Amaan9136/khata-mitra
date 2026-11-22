"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheck, FiAlertTriangle, FiMapPin, FiFileText } from "react-icons/fi";
import { SectionHead } from "./Reveal";
import Reveal from "./Reveal";
import { useT } from "@/store/useLangStore";
function Mock({ step }) {
  const { t } = useT();
  const docs = ["doc.sale_deed", "doc.rtc", "doc.ec", "doc.id_proof"];
  return (
    <div className="space-y-2.5">
      {step === 0 && docs.map((d, i) => (
        <motion.div key={d} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.12 }} className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2.5 text-sm text-teal-50">
          <FiFileText className="text-teal-200" /> <span className="flex-1">{t(d)}</span><span className="flex h-6 w-6 items-center justify-center rounded-full bg-lime-300 text-[#052e2b]"><FiCheck size={14} /></span>
        </motion.div>
      ))}
      {step === 1 && (
        <>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-red-500/15 px-3 py-3 text-sm text-red-100 ring-1 ring-red-300/30"><div className="mb-1 flex items-center gap-2 font-semibold"><FiAlertTriangle /> {t("sev.high")}</div>{t("surveyNo")} 45/3 ≠ 45/2</motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-xl bg-white/10 px-3 py-3 text-sm text-teal-50"><div className="mb-1 flex items-center gap-2 font-semibold text-lime-300"><FiCheck /> {t("ver.consistent")}</div>{t("extent")} · {t("seller.sale")}</motion.div>
        </>
      )}
      {step === 2 && ["pos.with_applicant", "ins.objection", "ins.location"].map((k, i) => (
        <motion.div key={k} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.12 }} className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-3 text-sm text-teal-50">
          <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${i === 0 ? "bg-lime-300 text-[#052e2b]" : "border border-white/30"}`}>{i === 0 && <FiCheck size={15} />}</span>
          <span className="flex-1">{t(k)}</span>{i === 2 && <FiMapPin className="text-lime-300" />}
        </motion.div>
      ))}
      {step === 3 && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl bg-lime-300/90 px-3 py-2.5 text-sm font-semibold text-[#052e2b]">{t("how.ready")}</motion.div>
          <div className="grid grid-cols-3 gap-2 pt-1">
            {["dec.approve", "dec.reject", "dec.return"].map((k, i) => <motion.div key={k} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.1 }} className={`rounded-xl px-2 py-3 text-center text-xs font-semibold ${i === 0 ? "bg-lime-300 text-[#052e2b]" : "border border-white/25 text-teal-50"}`}>{t(k)}</motion.div>)}
          </div>
        </>
      )}
    </div>
  );
}
export default function HowItWorks() {
  const { t } = useT();
  const [step, setStep] = useState(0);
  const [hold, setHold] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => { setHold(0); setStep((s) => (s + 1) % 4); }, hold ? 4000 : 3000);
    return () => clearTimeout(id);
  }, [step, hold]);
  return (
    <section id="how" className="relative scroll-mt-20 bg-(--bg) px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <div>
          <SectionHead eyebrow={t("how.eyebrow")} title={t("how.title")} sub={t("how.sub")} />
          <div className="space-y-3">
            {t("how.steps").map(([title, desc], i) => (
              <Reveal key={title} delay={i * 0.08} y={20}>
                <button onClick={() => { setStep(i); setHold(Date.now()); }} className={`card flex min-h-24 w-full cursor-pointer items-center gap-4 p-4 text-left ${step === i ? "border-(--accent-glow) shadow-(--shadow-lg)" : ""}`}>
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${step === i ? "text-white" : "bg-(--bg3) text-(--text2)"}`} style={step === i ? { background: "var(--gradient)" } : undefined}>{step > i ? <FiCheck /> : i + 1}</span>
                  <span><span className="block font-semibold text-(--text1)">{title}</span><span className="text-sm text-(--text2)">{desc}</span></span>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
        <Reveal className="relative mx-auto w-full max-w-md">
          <div className="absolute inset-0 rounded-[2.5rem] bg-linear-to-br from-[#052e2b] to-[#0f6857] shadow-2xl shadow-teal-900/30 grid-lines" />
          <div className="relative p-6 sm:p-8">
            <div className="mb-5 flex items-center justify-between">
              <span className="font-mono text-sm text-lime-300">{t("how.tag")}</span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-teal-100">{t("type.sale")}</span>
            </div>
            <div className="mb-6 flex items-center gap-2">
              {[0, 1, 2, 3].map((i) => <span key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/15"><motion.span className="block h-full bg-lime-300" animate={{ width: i <= step ? "100%" : "0%" }} transition={{ duration: 0.5 }} /></span>)}
            </div>
            <div className="mb-4 font-display text-xl font-semibold text-white">{t(`step.${["intake", "verification", "inspection", "decision"][step]}`)}</div>
            <div className="min-h-56"><AnimatePresence mode="wait"><motion.div key={step} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Mock step={step} /></motion.div></AnimatePresence></div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
