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
          // Structure
          "group inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium backdrop-blur-md",
          // Interactive cues — cursor, smooth bg animation, hover lift
          "cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          "border-border/60 bg-background/70",
          "hover:-translate-y-[1px] hover:border-primary/50",
          "hover:bg-gradient-to-br hover:from-primary/15 hover:via-background hover:to-accent/10",
          "hover:shadow-md hover:shadow-primary/20",
          // Open state — filled tint so it reads as the active menu trigger
          open && "border-primary/60 bg-gradient-to-br from-primary/20 via-background to-accent/15 shadow-md shadow-primary/20 -translate-y-[1px]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          isPending && "pointer-events-none opacity-60",
        )}
        aria-label="Change language"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Globe className="size-3.5 opacity-70 transition-transform duration-300 group-hover:rotate-12" />
        <span className="text-base leading-none">{localeFlag[current]}</span>
        {!compact && <span>{localeDisplayName[current]}</span>}
      </button>

      {open && (
        <div
          role="listbox"
          className={cn(
            "absolute top-full mt-2 w-44 z-[200] rounded-lg border border-border/60 bg-popover shadow-2xl",
            // Scroll internally if the viewport is extremely short (mobile PWA banner).
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
                "flex w-full items-center gap-2.5 px-3 py-2.5 text-sm cursor-pointer transition-all duration-200",
                "hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent hover:translate-x-0.5",
                current === l && "bg-gradient-to-r from-primary/15 to-transparent font-medium text-primary",
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
