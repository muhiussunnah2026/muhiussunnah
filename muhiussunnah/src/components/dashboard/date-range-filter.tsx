"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Calendar, Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Preset = {
  key: string;
  label: string;
};

const PRESETS: Preset[] = [
  { key: "today", label: "আজ" },
  { key: "7d", label: "গত ৭ দিন" },
  { key: "30d", label: "গত ৩০ দিন" },
  { key: "this_month", label: "এই মাস" },
  { key: "last_month", label: "গত মাস" },
  { key: "365d", label: "গত ৩৬৫ দিন" },
  { key: "this_year", label: "এই বছর" },
  { key: "last_year", label: "গত বছর" },
  { key: "yoy", label: "এই বছর বনাম গত বছর" },
];

type Props = {
  currentRange: string;
  currentLabel: string;
  currentFrom: string;
  currentTo: string;
  prevLabel: string;
};

export function DateRangeFilter({
  currentRange,
  currentLabel,
  currentFrom,
  currentTo,
  prevLabel,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [showCustom, setShowCustom] = useState(currentRange === "custom");
  const [customFrom, setCustomFrom] = useState(currentFrom);
  const [customTo, setCustomTo] = useState(currentTo);

  function setRange(key: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", key);
    params.delete("from");
    params.delete("to");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
      setOpen(false);
    });
  }

  function applyCustom() {
    if (!customFrom || !customTo) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", "custom");
    params.set("from", customFrom);
    params.set("to", customTo);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
      setOpen(false);
      setShowCustom(false);
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={pending}
        className={cn(
          "flex items-center gap-2 rounded-xl border border-border/70 bg-card px-3.5 py-2 text-sm font-medium transition-all",
          "hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm",
          open && "border-primary/60 bg-primary/5 shadow-sm",
          pending && "opacity-60",
        )}
      >
        <Calendar className="size-4 text-primary" />
        <span className="flex flex-col items-start leading-tight">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            সময়সীমা
          </span>
          <span className="text-foreground">{currentLabel}</span>
        </span>
        <span className="mx-1 hidden text-xs text-muted-foreground sm:inline">
          vs {prevLabel}
        </span>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <>
          {/* Backdrop to close on click-outside */}
          <button
            type="button"
            aria-label="Close"
            onClick={() => {
              setOpen(false);
              setShowCustom(false);
            }}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div className="absolute end-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-border/70 bg-popover shadow-xl shadow-black/10">
            {!showCustom ? (
              <>
                <div className="border-b border-border/60 bg-muted/30 px-3 py-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                  সময়সীমা বাছাই করুন
                </div>
                <ul className="max-h-80 space-y-0.5 overflow-y-auto p-1.5">
                  {PRESETS.map((p) => {
                    const active = currentRange === p.key;
                    return (
                      <li key={p.key}>
                        <button
                          type="button"
                          onClick={() => setRange(p.key)}
                          className={cn(
                            "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                            active
                              ? "bg-primary/10 font-semibold text-primary"
                              : "text-foreground hover:bg-muted",
                          )}
                        >
                          <span>{p.label}</span>
                          {active ? <Check className="size-4" /> : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <div className="border-t border-border/60 p-2">
                  <button
                    type="button"
                    onClick={() => setShowCustom(true)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-primary"
                  >
                    <Calendar className="size-3.5" />
                    কাস্টম তারিখ পরিসর
                  </button>
                </div>
              </>
            ) : (
              <div className="p-3">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    কাস্টম পরিসর
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowCustom(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">থেকে</label>
                    <input
                      type="date"
                      value={customFrom}
                      onChange={(e) => setCustomFrom(e.target.value)}
                      max={customTo || undefined}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">পর্যন্ত</label>
                    <input
                      type="date"
                      value={customTo}
                      onChange={(e) => setCustomTo(e.target.value)}
                      min={customFrom || undefined}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={applyCustom}
                    disabled={!customFrom || !customTo || pending}
                    className="w-full rounded-lg bg-gradient-to-r from-primary to-accent px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-50"
                  >
                    প্রয়োগ করুন
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
