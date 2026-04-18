"use client";

import { useEffect } from "react";
import { toast } from "sonner";

/**
 * Registers the service worker at /sw.js on the client.
 * Mounted once in the root layout.
 *
 * - Production-only; in development unregister to avoid stale cached assets.
 * - Listens for `online` event and asks SW to replay the queued offline mutations.
 * - Shows a toast when offline mutations are successfully flushed.
 */
export function RegisterServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => r.unregister());
      });
      return;
    }

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.warn("SW registration failed:", err);
      });

    // Replay queue when coming back online
    const onOnline = () => {
      navigator.serviceWorker.controller?.postMessage({ type: "REPLAY_QUEUE" });
    };
    window.addEventListener("online", onOnline);

    // Listen for sync completion messages
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === "SYNC_COMPLETE" && e.data.count > 0) {
        toast.success(`${e.data.count}টি অফলাইন রেকর্ড সিঙ্ক হয়েছে`);
      }
    };
    navigator.serviceWorker.addEventListener("message", onMessage);

    return () => {
      window.removeEventListener("online", onOnline);
      navigator.serviceWorker.removeEventListener("message", onMessage);
    };
  }, []);

  return null;
}
