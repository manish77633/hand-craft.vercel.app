"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Sprout } from "lucide-react";

export function SiteEffects() {
  const [showSplash, setShowSplash] = useState(true);
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const sections = Array.from(document.querySelectorAll<HTMLElement>("main section"));
    sections.forEach((section, index) => {
      section.dataset.scrollReveal = "pending";
      section.style.setProperty("--reveal-delay", `${Math.min(index % 3, 2) * 70}ms`);
    });
    root.classList.add("motion-ready");

    if (!("IntersectionObserver" in window)) {
      sections.forEach(section => { section.dataset.scrollReveal = "visible"; });
    }
    const observer = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).dataset.scrollReveal = "visible";
          observer?.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -35px 0px" }) : null;
    sections.forEach((section) => observer?.observe(section));

    return () => observer?.disconnect();
  }, [pathname]);

  useEffect(() => {
    if (!showSplash) return;
    const timer = window.setTimeout(() => setShowSplash(false), reduceMotion ? 250 : 1650);
    return () => window.clearTimeout(timer);
  }, [showSplash, reduceMotion]);

  return <AnimatePresence>
    {showSplash && <motion.div className="brand-splash" role="status" aria-label="MeeraHini is getting ready" initial={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: reduceMotion ? 0 : .55, ease: "easeInOut" } }}>
      <motion.div className="brand-splash-mark" initial={reduceMotion ? false : { opacity: 0, scale: .65, rotate: -18 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: reduceMotion ? 0 : .7, type: "spring", stiffness: 110, damping: 13 }}>
        <Sprout size={31} strokeWidth={1.25} />
      </motion.div>
      <motion.p className="brand-splash-name" initial={reduceMotion ? false : { opacity: 0, y: 14, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ delay: reduceMotion ? 0 : .2, duration: .6 }}>MeeraHini</motion.p>
      <motion.p className="brand-splash-tag" initial={{ opacity: 0 }} animate={{ opacity: .7 }} transition={{ delay: reduceMotion ? 0 : .4 }}>Handmade with heart</motion.p>
      <div className="brand-splash-track"><motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: reduceMotion ? .15 : 1.2, delay: .2, ease: [.65, 0, .35, 1] }} /></div>
    </motion.div>}
  </AnimatePresence>;
}
