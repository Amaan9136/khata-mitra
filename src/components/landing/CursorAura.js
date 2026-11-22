"use client";
import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
export default function CursorAura() {
  const x = useMotionValue(-300);
  const y = useMotionValue(-300);
  const sx = useSpring(x, { stiffness: 220, damping: 28 });
  const sy = useSpring(y, { stiffness: 220, damping: 28 });
  const [big, setBig] = useState(false);
  useEffect(() => {
    const fn = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setBig(e.target instanceof Element && !!e.target.closest("a,button,.card,.glass-dark"));
    };
    window.addEventListener("pointermove", fn, { passive: true });
    return () => window.removeEventListener("pointermove", fn);
  }, [x, y]);
  return <motion.div aria-hidden style={{ x: sx, y: sy }} animate={{ scale: big ? 1.7 : 1 }} className="pointer-events-none fixed left-0 top-0 z-40 -ml-24 -mt-24 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(190,242,100,.16),rgba(45,212,191,.08)_45%,transparent_70%)] [@media(hover:none)]:hidden" />;
}
