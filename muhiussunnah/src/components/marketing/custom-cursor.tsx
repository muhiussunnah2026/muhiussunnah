"use client";

import { useEffect, useRef } from "react";

/**
 * Premium cursor trail — decorative layer that trails the native cursor.
 *
 * IMPORTANT: Native cursor stays visible (no `cursor: none`). This is just
 * an aesthetic accent. If the trail fails for any reason, users still have
 * their native cursor for usability.
 *
 * Technique:
 *   - Single trailing ring (~30px) in primary color with soft glow.
 *   - Lerps toward mouse at 0.18/frame for elastic feel.
 *   - Scales 1.8x on hover over interactive elements.
 *   - Hidden on touch devices.
 */
export function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(hover: none)").matches) return;

    const ring = ringRef.current;
    if (!ring) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let rafId = 0;
    let ringScale = 1;
    let targetScale = 1;
    let shown = false;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!shown) {
        ring.style.opacity = "1";
        shown = true;
      }
    };

    const tick = () => {
      ringX += (mouseX - ringX) * 0.2;
      ringY += (mouseY - ringY) * 0.2;
      ringScale += (targetScale - ringScale) * 0.2;
      ring.style.transform = `translate3d(${ringX - 18}px, ${ringY - 18}px, 0) scale(${ringScale})`;
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      const interactive = target.closest('a, button, [role="button"], input, textarea, select, [data-cursor="lg"]');
      if (interactive) {
        targetScale = 1.8;
        ring.classList.add("cursor-active");
      } else {
        targetScale = 1;
        ring.classList.remove("cursor-active");
      }
    };

    const onLeave = () => {
      ring.style.opacity = "0";
      shown = false;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    document.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={ringRef}
      aria-hidden
      className="pointer-events-none fixed start-0 top-0 z-[9999] size-9 rounded-full border-2 border-primary/70 opacity-0 shadow-[0_0_20px_rgba(124,92,255,0.4)] transition-[opacity,border-color,background-color] duration-300"
      style={{ willChange: "transform" }}
    />
  );
}
