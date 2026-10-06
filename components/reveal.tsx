"use client";

import { motion, useReducedMotion } from "motion/react";

export function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion();
  return <motion.div className={className} initial={false} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-70px" }} transition={{ duration: reduceMotion ? 0 : .55, ease: [.22, 1, .36, 1] }}>{children}</motion.div>;
}
