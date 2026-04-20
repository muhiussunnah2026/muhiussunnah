"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Thin top progress bar that shows during client-side navigation.
 *
 * Why not loading.tsx: loading.tsx BLANKS the page content on every
 * click, which makes snappy 300-500ms navigations feel like jarring
 * flickers. This component keeps the previous page visible (Next.js
 * router default when no loading.tsx exists) while giving subtle
 * visual confirmation that the click registered.
 *
 * Behavior:
 *   - Intercepts all same-origin <a> / <Link> clicks.
 *   - Shows a gradient progress bar that animates to ~85% over ~600ms.
 *   - When pathname or searchParams change (navigation completed), it
 *     fills to 100% and fades out.
 *
 * Styling: uses project tokens (primary / accent). Hardware-accelerated
 * CSS transforms; no JS animation loop so it costs ~0 TBT.
 */
export function NavProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<number | null>(null);
  const lastKeyRef = useRef<string>("");

  const key = `${pathname}?${searchParams}`;

  // Start on link click
  useEffect(() => {
    function isInternalHref(href: string): boolean {
      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return false;
        // Ignore same-URL clicks (anchor refresh) and in-page hashes
        if (url.pathname === window.location.pathname && url.search === window.location.search) return false;
        return true;
      } catch {
        return false;
      }
    }

    function onClick(e: MouseEvent) {
      // Skip if modifier key or non-primary button — user wants new tab etc.
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (!isInternalHref(href)) return;

      start();
    }

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  // Complete when navigation lands
  useEffect(() => {
    if (!visible) {
      lastKeyRef.current = key;
      return;
    }
    if (lastKeyRef.current !== key) {
      lastKeyRef.current = key;
      complete();
    }
  }, [key, visible]);

  function start() {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setVisible(true);
    setProgress(0);
    // Two frames to ensure the initial 0 state paints before animating
    requestAnimationFrame(() => requestAnimationFrame(() => setProgress(85)));
  }

  function complete() {
    setProgress(100);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 240);
  }

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-[2.5px]"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 200ms ease",
      }}
    >
      <div
        className="h-full origin-left bg-gradient-to-r from-primary via-accent to-primary"
        style={{
          transform: `scaleX(${progress / 100})`,
          transition: progress === 0
            ? "none"
            : progress === 100
              ? "transform 220ms ease-out"
              : "transform 600ms cubic-bezier(0.16, 1, 0.3, 1)",
          boxShadow: "0 0 10px rgba(124, 92, 255, 0.5)",
        }}
      />
    </div>
  );
}
