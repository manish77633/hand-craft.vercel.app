"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BrandLogo } from "./brand-logo";

export function SiteEffects() {
  const [showSplash, setShowSplash] = useState(true);
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/admin") || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const cards = ".product-card, .motion-reel-card, .experience-card, .about-value-card, .contact-topic-card";
    const selector = `main h1, main h2, main h3, main p, main ${cards.split(", ").join(", main ")}, main .grid > a, footer h2, footer p`;
    const registered = new Set<HTMLElement>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).dataset.scrollReveal = "visible";
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: "0px 0px 40px 0px" });
    const register = () => {
      document.querySelectorAll<HTMLElement>(selector).forEach(element => {
        if (registered.has(element) || element.closest(".home-hero, details, [role=dialog]") || element.parentElement?.closest(cards)) return;
        registered.add(element);
        // Above-the-fold content stays immediately readable (and preserves LCP).
        if (element.getBoundingClientRect().top < window.innerHeight) return;
        element.dataset.scrollReveal = "pending";
        observer.observe(element);
      });
    };
    register();
    const updates = new MutationObserver(register);
    const main = document.querySelector("main");
    if (main) updates.observe(main, { childList: true, subtree: true });
    return () => {
      observer.disconnect(); updates.disconnect();
      registered.forEach(element => { delete element.dataset.scrollReveal; });
    };
  }, [pathname]);

  useEffect(() => {
    if (!showSplash) return;
    const timer = window.setTimeout(() => setShowSplash(false), reduceMotion ? 250 : 1650);
    return () => window.clearTimeout(timer);
  }, [showSplash, reduceMotion]);

  return <AnimatePresence>
    {showSplash && <motion.div className="brand-splash" role="status" aria-label="Ammaai is getting ready" initial={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: reduceMotion ? 0 : .55, ease: "easeInOut" } }}>
      <motion.div className="brand-splash-name" initial={reduceMotion ? false : { opacity: 0, y: 14, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ delay: reduceMotion ? 0 : .2, duration: .6 }}><BrandLogo tone="dark" /></motion.div>
      <motion.p className="brand-splash-tag" initial={{ opacity: 0 }} animate={{ opacity: .7 }} transition={{ delay: reduceMotion ? 0 : .4 }}>Handmade with heart</motion.p>
      <div className="brand-splash-track"><motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: reduceMotion ? .15 : 1.2, delay: .2, ease: [.65, 0, .35, 1] }} /></div>
    </motion.div>}
  </AnimatePresence>;
}
