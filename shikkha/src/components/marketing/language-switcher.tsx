"use client";

import { useState, useTransition } from "react";
import { Globe, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { locales, localeDisplayName, localeFlag, type Locale } from "@/lib/i18n/config";
import { setLocaleAction } from "@/server/actions/locale";

export function LanguageSwitcher({ current, compact = false }: { current: Locale; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const onPick = (locale: Locale) => {
    setOpen(false);
    startTransition(async () => {
      await setLocaleAction(locale);
    });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-background/70 px-2.5 py-1.5 text-xs font-medium transition hover:border-primary/40 hover:bg-background",
          isPending && "opacity-50",
        )}
        aria-label="Change language"
      >
        <Globe className="size-3.5 opacity-70" />
        <span className="text-base leading-none">{localeFlag[current]}</span>
        {!compact && <span>{localeDisplayName[current]}</span>}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute end-0 mt-2 w-44 z-50 rounded-lg border border-border/60 bg-popover shadow-lg overflow-hidden">
            {locales.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => onPick(l)}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-2.5 text-sm transition hover:bg-muted",
                  current === l && "bg-muted/50",
                )}
              >
                <span className="text-lg leading-none">{localeFlag[l]}</span>
                <span className="flex-1 text-start">{localeDisplayName[l]}</span>
                {current === l && <Check className="size-3.5 text-primary" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
