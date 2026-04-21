"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

export function RegisterServiceWorker() {
  const t = useTranslations("pwa");
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

    const onOnline = () => {
      navigator.serviceWorker.controller?.postMessage({ type: "REPLAY_QUEUE" });
    };
    window.addEventListener("online", onOnline);

    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === "SYNC_COMPLETE" && e.data.count > 0) {
        toast.success(t("sync_toast", { count: e.data.count }));
      }
    };
    navigator.serviceWorker.addEventListener("message", onMessage);

    return () => {
      window.removeEventListener("online", onOnline);
      navigator.serviceWorker.removeEventListener("message", onMessage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
