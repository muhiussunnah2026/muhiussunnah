"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Globe, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { locales, localeDisplayName, localeFlag, type Locale } from "@/lib/i18n/config";
import { setLocaleAction } from "@/server/actions/locale";

export function LanguageSwitcher({ current, compact = false }: { current: Locale; compact?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside (document listener — works in RTL, doesn't trap pointer).
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const onPick = (locale: Locale) => {
    setOpen(false);
    if (locale === current) return;
    startTransition(async () => {
      await setLocaleAction(locale);
      // Force a full client refresh so html dir + fonts pick up the new locale
      // across the entire tree (navbar, dropdowns, etc.).
      router.refresh();
      // Belt-and-suspenders: hard reload after a micro-delay in case
      // Turbopack misses the layout revalidation for RTL flips.
      setTimeout(() => {
        if (typeof window !== "undefined") window.location.reload();
      }, 150);
    });
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-background/70 px-2.5 py-1.5 text-xs font-medium transition hover:border-primary/40 hover:bg-background",
          isPending && "pointer-events-none opacity-60",
        )}
        aria-label="Change language"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Globe className="size-3.5 opacity-70" />
        <span className="text-base leading-none">{localeFlag[current]}</span>
        {!compact && <span>{localeDisplayName[current]}</span>}
      </button>

      {open && (
        <div
          role="listbox"
          className={cn(
            // Open upward so the full list stays visible above mobile PWA prompts.
            "absolute bottom-full mb-2 w-44 z-[200] rounded-lg border border-border/60 bg-popover shadow-2xl",
            // Scroll internally if the viewport is extremely short.
            "max-h-[70vh] overflow-y-auto overscroll-contain",
            // Use physical properties with both LTR + RTL aware fallbacks
            "end-0 ltr:right-0 rtl:left-0",
          )}
        >
          {locales.map((l) => (
            <button
              key={l}
              type="button"
              role="option"
              aria-selected={current === l}
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
      )}
    </div>
  );
}
