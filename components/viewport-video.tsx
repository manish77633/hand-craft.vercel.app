"use client";

import { useEffect, useRef, useState } from "react";

export function ViewportVideo({ src, poster, className, autoPlay = true }: {
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    if (!("IntersectionObserver" in window)) {
      const timer = globalThis.setTimeout(() => { setLoaded(true); setActive(true); }, 0);
      return () => globalThis.clearTimeout(timer);
    }
    const observer = new IntersectionObserver(([entry]) => {
      setActive(entry.isIntersecting);
      if (entry.isIntersecting) setLoaded(true);
      if (!entry.isIntersecting) videoRef.current?.pause();
    }, { rootMargin: "180px 0px", threshold: 0.08 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (active && autoPlay && !saveData && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) void videoRef.current?.play().catch(() => undefined);
  }, [active, autoPlay]);

  return <div ref={containerRef} className={className}>
    <video ref={videoRef} src={loaded ? src : undefined} poster={poster} muted playsInline loop={autoPlay} preload="none" aria-hidden="true" />
  </div>;
}
