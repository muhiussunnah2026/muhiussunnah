"use client";

/**
 * <LiveIndicator> — realtime/live status dot with last-sync hint.
 *
 * FRONTEND_UX_GUIDE §17 rule #17: always-visible realtime status. Pair
 * with Supabase Realtime subscriptions once wired in Phase 1/6.
 */

import { cn } from "@/lib/utils";

type Props = {
  connected?: boolean;
  label?: string;
  className?: string;
};

export function LiveIndicator({ connected = true, label, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-xs font-medium",
        connected ? "text-success" : "text-muted-foreground",
        className,
      )}
      aria-live="polite"
    >
      <span className="relative flex size-2">
        <span
          className={cn(
            "absolute inline-flex size-full rounded-full opacity-75",
            connected && "animate-ping bg-success",
          )}
        />
        <span
          className={cn(
            "relative inline-flex size-2 rounded-full",
            connected ? "bg-success" : "bg-muted-foreground",
          )}
        />
      </span>
      {label ?? (connected ? "লাইভ" : "সংযোগ বিচ্ছিন্ন")}
    </span>
  );
}
