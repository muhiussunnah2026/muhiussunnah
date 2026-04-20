"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Variant = "fade-up" | "fade-in" | "slide-left" | "slide-right" | "scale-in" | "blur-in";

/**
 * Reveal — scroll-in animation wrapper that's friendly to Core Web Vitals.
 *
 * CRITICAL: we default `shown = true` so the SSR HTML paints fully
 * visible. Previously we defaulted to false + opacity-0, which made
 * the hero H1 (our LCP element) invisible until client-side hydration
 * finished — blowing LCP to 5+ seconds on mobile.
 *
 * On mount we check if the element is currently below the viewport.
 * If it is, we hide it and let the IntersectionObserver animate it in
 * when the user scrolls. Above-fold content never flashes because it
 * was already visible from SSR.
 */
export function Reveal({
  children,
  variant = "fade-up",
  delay = 0,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  variant?: Variant;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "article" | "header" | "h1" | "h2" | "h3" | "p" | "span";
  /** Kept for backward compatibility with existing call sites. Now a no-op
   *  — every Reveal is effectively "eager" on the server, which is what we
   *  actually want for Largest Contentful Paint. */
  eager?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // If the element is already in the viewport when we mount, leave it
    // visible. Otherwise hide it and animate in on scroll.
    const rect = el.getBoundingClientRect();
    const inView = rect.top < window.innerHeight - 80 && rect.bottom > 0;
    if (inView) return;

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
      { threshold: 0.15, rootMargin: "0px 0px -80px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const hiddenStyles: Record<Variant, string> = {
    "fade-up": "opacity-0 translate-y-10",
    "fade-in": "opacity-0",
    "slide-left": "opacity-0 -translate-x-10",
    "slide-right": "opacity-0 translate-x-10",
    "scale-in": "opacity-0 scale-95",
    "blur-in": "opacity-0 blur-lg",
  };

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={cn(
        "transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
        shown ? "opacity-100 translate-y-0 translate-x-0 scale-100 blur-0" : hiddenStyles[variant],
        className,
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
