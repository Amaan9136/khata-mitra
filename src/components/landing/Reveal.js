"use client";
import { motion } from "framer-motion";
export default function Reveal({ children, delay = 0, y = 32, className = "" }) {
  return (
    <motion.div initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }} className={className}>
      {children}
    </motion.div>
  );
}
export function SectionHead({ eyebrow, title, sub, dark = false, center = false }) {
  return (
    <Reveal className={`mb-10 max-w-2xl sm:mb-12 ${center ? "mx-auto text-center" : ""}`}>
      <div className={`mb-3 text-xs font-bold uppercase tracking-[0.2em] ${dark ? "text-lime-300" : "text-(--accent)"}`}>{eyebrow}</div>
      <h2 className={`font-display text-3xl font-semibold leading-tight text-balance sm:text-5xl ${dark ? "text-white" : "text-(--text1)"}`}>{title}</h2>
      {sub && <p className={`mt-4 text-base leading-relaxed text-pretty sm:text-lg ${dark ? "text-teal-50/80" : "text-(--text2)"}`}>{sub}</p>}
    </Reveal>
  );
}
