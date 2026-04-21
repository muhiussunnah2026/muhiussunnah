"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { WifiOff, CloudUpload } from "lucide-react";

export function OnlineStatus() {
  const t = useTranslations("pwa");
  const [online, setOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setOnline(navigator.onLine);

    const onOnline = () => {
      setOnline(true);
      setSyncing(true);
      setTimeout(() => setSyncing(false), 3000);
    };
    const onOffline = () => setOnline(false);

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  if (online && !syncing) return null;

  return (
    <div className="fixed bottom-4 start-4 z-50">
      {!online && (
        <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning-foreground dark:text-warning shadow-sm">
          <WifiOff className="size-4" />
          <span>{t("offline_banner")}</span>
        </div>
      )}
      {online && syncing && (
        <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-primary shadow-sm">
          <CloudUpload className="size-4 animate-pulse" />
          <span>{t("syncing_banner")}</span>
        </div>
      )}
    </div>
  );
}
