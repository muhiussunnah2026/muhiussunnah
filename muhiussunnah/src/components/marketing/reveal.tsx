"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Variant = "fade-up" | "fade-in" | "slide-left" | "slide-right" | "scale-in" | "blur-in";

/**
 * Reveal — IntersectionObserver-driven scroll animation wrapper.
 *
 * The child enters from a transformed/faded state and animates to its
 * natural state once it intersects the viewport (40% visible).
 */
export function Reveal({
  children,
  variant = "fade-up",
  delay = 0,
  className,
  as: Tag = "div",
  eager = false,
}: {
  children: ReactNode;
  variant?: Variant;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "article" | "header" | "h1" | "h2" | "h3" | "p" | "span";
  /** When true, animate on mount regardless of viewport intersection. Useful for
   *  hero content that sits below the fold on short mobile viewports where the
   *  IntersectionObserver would otherwise never fire until the user scrolls. */
  eager?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (eager) {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el || shown) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -80px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shown, eager]);

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
