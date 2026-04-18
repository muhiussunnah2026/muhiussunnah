"use client";

import { useRef, type ReactNode, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

/**
 * Magnetic — wraps children to create a button that gently follows the
 * cursor within a radius. Used on primary CTAs for an "alive" feel.
 */
export function Magnetic({
  children,
  strength = 0.35,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate3d(${x * strength}px, ${y * strength}px, 0)`;
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "translate3d(0, 0, 0)";
  };

  return (
    <div
      className={cn("inline-block transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform", className)}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      ref={ref}
    >
      {children}
    </div>
  );
}
