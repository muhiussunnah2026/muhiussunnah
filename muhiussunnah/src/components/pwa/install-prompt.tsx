"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "shikkha-pwa-dismissed";

export function InstallPrompt() {
  const t = useTranslations("pwa");
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!visible || !event) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-background/95 p-4 shadow-hover backdrop-blur md:inset-x-auto md:right-6 md:max-w-sm">
      <div className="flex-1">
        <p className="text-sm font-semibold">{t("install_title")}</p>
        <p className="text-xs text-muted-foreground">
          {t("install_body")}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          className="bg-gradient-primary text-white"
          onClick={async () => {
            await event.prompt();
            const result = await event.userChoice;
            if (result.outcome === "accepted") {
              localStorage.setItem(DISMISS_KEY, "installed");
            }
            setVisible(false);
          }}
        >
          <Download className="me-1 size-3.5" />
          {t("install_cta")}
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label="Close"
          onClick={() => {
            localStorage.setItem(DISMISS_KEY, "dismissed");
            setVisible(false);
          }}
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}
