/**
 * <EmptyState> — never "No data available".
 *
 * FRONTEND_UX_GUIDE §3.1 / §17 rule #2: every empty state teaches, sells,
 * and offers at least two CTAs. Styling upgraded to match the marketing
 * site — dashed ring replaced with a soft gradient frame, icon bubble
 * now uses the brand gradient, pro-tip panel reads like a callout.
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  icon?: ReactNode;
  title: ReactNode;
  body?: ReactNode;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  tertiaryAction?: ReactNode;
  proTip?: ReactNode;
  className?: string;
};

export function EmptyState({
  icon,
  title,
  body,
  primaryAction,
  secondaryAction,
  tertiaryAction,
  proTip,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card via-card to-primary/5 shadow-sm",
        className,
      )}
    >
      {/* Decorative background blobs */}
      <div
        className="pointer-events-none absolute -top-16 -end-16 size-56 rounded-full bg-primary/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-16 -start-16 size-56 rounded-full bg-accent/10 blur-3xl"
        aria-hidden
      />

      <div className="relative flex flex-col items-center gap-5 p-8 text-center md:p-14">
        {icon ? (
          <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-primary animate-gradient text-white shadow-xl shadow-primary/30">
            {icon}
          </div>
        ) : null}
        <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
          {title}
        </h2>
        {body ? (
          <p className="max-w-xl text-sm text-muted-foreground leading-relaxed md:text-base">
            {body}
          </p>
        ) : null}
        {(primaryAction || secondaryAction || tertiaryAction) && (
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2.5">
            {primaryAction}
            {secondaryAction}
            {tertiaryAction}
          </div>
        )}
        {proTip ? (
          <div className="mt-4 max-w-md rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-muted-foreground shadow-sm">
            <span className="me-2">💡</span>
            {proTip}
          </div>
        ) : null}
      </div>
    </div>
  );
}
