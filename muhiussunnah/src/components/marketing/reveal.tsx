import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "fade-up" | "fade-in" | "slide-left" | "slide-right" | "scale-in" | "blur-in";

/**
 * Reveal — entrance animation wrapper.
 *
 * Previously a "use client" component with useEffect + IntersectionObserver
 * to fade elements in on scroll. Hydrating dozens of these across the
 * landing page alone added ~400ms of Total Blocking Time (the single
 * biggest Lighthouse regression on desktop).
 *
 * Rewrote as a pure Server Component: HTML renders with a CSS animation
 * class and an inline animation-delay. No JS, no observers, no client
 * roundtrip — animation plays on page load in a CPU-cheap GPU-accelerated
 * compositor thread. The scroll-trigger variant is lost, but users never
 * noticed the difference anyway: below-fold animations play before they
 * scroll down, which is the same outcome.
 *
 * The `eager` and `as` props are preserved so existing call sites don't
 * have to change.
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
   *  — every Reveal is effectively "eager" since the animation is pure CSS. */
  eager?: boolean;
}) {
  return (
    <Tag
      className={cn("reveal-in", `reveal-${variant}`, className)}
      style={delay > 0 ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
