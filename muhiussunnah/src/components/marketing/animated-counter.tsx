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
  const [display, setDisplay] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || started) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setStarted(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // ease-out-expo
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setDisplay(Math.floor(value * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setDisplay(value);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, value, duration]);

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
