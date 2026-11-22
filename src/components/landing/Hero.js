"use client";
import { Fragment, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { FiArrowRight, FiPlay } from "react-icons/fi";
import { useT } from "@/store/useLangStore";
const Scene3D = dynamic(() => import("./Scene3D"), { ssr: false, loading: () => null });
export default function Hero() {
  const { t, lang } = useT();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const sceneY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const words = t("landing.words");
  return (
    <section ref={ref} className="relative flex min-h-dvh flex-col overflow-hidden bg-linear-to-b from-[#031f1d] via-[#052e2b] to-[#0a4a3d] grid-lines">
      <div className="absolute -left-32 top-10 h-120 w-120 animate-drift rounded-full bg-teal-400/20 blur-3xl" />
      <div className="absolute -right-24 bottom-0 h-112 w-md animate-drift rounded-full bg-lime-300/15 blur-3xl [animation-delay:-7s]" />
      <motion.div style={{ y: sceneY, opacity: fade }} className="relative order-2 h-80 w-full [mask-image:linear-gradient(to_bottom,transparent,#000_14%,#000_86%,transparent)] sm:h-105 lg:absolute lg:left-[40%] lg:right-0 lg:top-0 lg:h-dvh lg:w-auto lg:[mask-image:linear-gradient(to_right,transparent,#000_30%)]">
        <Scene3D />
      </motion.div>
      <motion.div style={{ y, opacity: fade }} className="relative z-10 mx-auto flex w-full max-w-[76rem] flex-col justify-center px-5 pb-4 pt-28 sm:px-8 lg:pointer-events-none lg:min-h-dvh lg:pb-20 lg:pt-28">
        <h1 key={lang} className="max-w-3xl font-display text-5xl font-semibold text-white sm:text-6xl lg:max-w-none lg:whitespace-nowrap lg:text-[clamp(2.5rem,4.1vw,4.25rem)]">
          {words.map((w, i) => (
            <Fragment key={i}>
              <motion.span initial={{ opacity: 0, y: 40, rotateX: -50 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ delay: 0.3 + i * 0.12, duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className={`mr-3 inline-block ${i === 4 ? "text-gradient" : ""}`}>{w}</motion.span>
              {(i === 1 || i === 3) && <br />}
            </Fragment>
          ))}
        </h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.7 }} className="mt-6 max-w-xl text-base leading-relaxed text-teal-50/85 sm:text-lg">{t("landing.sub")}</motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.15, duration: 0.7 }} className="pointer-events-auto mt-9 flex flex-wrap gap-3">
          <Link href="/login" className="btn btn-lime px-7! py-3.5! text-base!">{t("landing.cta1")} <FiArrowRight /></Link>
          <a href="#how" className="btn btn-ghost-light px-7! py-3.5! text-base!"><FiPlay size={14} /> {t("landing.cta2")}</a>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-white/10 pt-6 sm:mt-12">
          {t("landing.stats").map(([a, b]) => (
            <div key={b}>
              <div className="font-display text-2xl font-semibold text-white sm:text-3xl">{a}</div>
              <div className="mt-1 text-xs text-teal-100/80">{b}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>
      <motion.a href="#how" aria-label="Scroll" style={{ opacity: fade }} animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute bottom-6 left-1/2 hidden h-10 w-6 -translate-x-1/2 justify-center rounded-full border border-teal-200/40 pt-2 lg:flex">
        <span className="h-2 w-1 rounded-full bg-teal-200" />
      </motion.a>
    </section>
  );
}
