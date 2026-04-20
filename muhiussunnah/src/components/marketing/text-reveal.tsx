"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * TextReveal — splits text into words and animates them in with a stagger
 * when the element enters the viewport. Each word rises from below with
 * a blur-to-sharp fade.
 */
export function TextReveal({
  text,
  className,
  delayStep = 60,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  delayStep?: number;
  as?: "span" | "h1" | "h2" | "h3" | "p";
}) {
  const ref = useRef<HTMLElement>(null);
  // Default visible so SSR renders the hero text fully opaque — otherwise
  // the words sit at opacity-0 until hydration and Google measures LCP
  // as 4+ seconds even though the HTML arrived in milliseconds.
  const [shown, setShown] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const inView = rect.top < window.innerHeight - 40 && rect.bottom > 0;
    if (inView) return; // above-fold → stay visible, no animation needed

    setShown(false);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const words = text.split(/(\s+)/);

  const content: ReactNode = words.map((w, i) => {
    if (/^\s+$/.test(w)) return <span key={i}>{w}</span>;
    return (
      <span
        key={i}
        className={cn(
          "inline-block transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
          shown ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-6 blur-[6px]",
        )}
        style={{ transitionDelay: `${(i / 2) * delayStep}ms` }}
      >
        {w}
      </span>
    );
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <Tag ref={ref as any} className={className}>{content}</Tag>;
}
