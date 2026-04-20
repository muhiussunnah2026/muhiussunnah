"use client";

import { useEffect, useRef, useState } from "react";

/**
 * AnimatedCounter — counts 0 → target with easing, starts when element
 * enters the viewport. Supports optional prefix/suffix and Bangla digits.
 */
export function AnimatedCounter({
  value,
  suffix = "",
  prefix = "",
  duration = 2200,
  bangla = true,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  bangla?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  // Default to the final value so SSR ships the correct number for SEO
  // and LCP. Below-fold animation is cosmetic — it fires only when the
  // element scrolls into view, and if the user never scrolls there they
  // see the final value anyway.
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let animationRaf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          io.disconnect();
          // Reset to 0 and animate up. The flash is invisible because
          // this only fires when the element scrolls into view.
          setDisplay(0);
          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
            setDisplay(Math.floor(value * eased));
            if (t < 1) animationRaf = requestAnimationFrame(tick);
            else setDisplay(value);
          };
          animationRaf = requestAnimationFrame(tick);
          break;
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(animationRaf);
    };
  }, [value, duration]);

  const formatted = display.toLocaleString("en-IN");
  const text = bangla
    ? formatted.replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)])
    : formatted;

  return (
    <span ref={ref}>
      {prefix}{text}{suffix}
    </span>
  );
}
