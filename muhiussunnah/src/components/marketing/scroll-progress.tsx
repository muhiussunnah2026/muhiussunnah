"use client";

import { useEffect, useRef } from "react";

/** Thin gradient progress bar at the top that tracks page scroll 0–100%. */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = ref.current;
    if (!bar) return;
    let rafId = 0;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const doc = document.documentElement;
        const max = (doc.scrollHeight - window.innerHeight) || 1;
        const pct = Math.min(100, Math.max(0, (window.scrollY / max) * 100));
        bar.style.transform = `scaleX(${pct / 100})`;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px] origin-left bg-gradient-to-r from-primary via-accent to-secondary"
      ref={ref}
      style={{ transform: "scaleX(0)", willChange: "transform" }}
    />
  );
}
