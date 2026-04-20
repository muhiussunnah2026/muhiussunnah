/**
 * <PageHeader> — the universal top strip for every admin page.
 *
 * FRONTEND_UX_GUIDE §2 / §17 rule #1: every page MUST have a PageHeader
 * with title + value subtitle + optional impact chip. Styling upgraded
 * to match the marketing site's aesthetic — gradient title accent,
 * softer subtitle, rounded chips, no hard hr.
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ImpactChip = {
  icon?: ReactNode;
  label: ReactNode;
  tone?: "default" | "accent" | "success" | "warning";
};

type Props = {
  title: ReactNode;
  subtitle?: ReactNode;
  breadcrumbs?: ReactNode;
  impact?: ImpactChip[];
  actions?: ReactNode;
  className?: string;
};

const toneClasses: Record<NonNullable<ImpactChip["tone"]>, string> = {
  default: "bg-muted/70 text-foreground border-border/60",
  accent: "bg-primary/10 text-primary border-primary/30",
  success: "bg-success/10 text-success-foreground dark:text-success border-success/30",
  warning: "bg-warning/10 text-warning-foreground dark:text-warning border-warning/30",
};

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  impact,
  actions,
  className,
}: Props) {
  return (
    <header className={cn("relative flex flex-col gap-4 pb-6 mb-6", className)}>
      {/* Soft accent glow behind the title — twin orbs for a more dimensional feel */}
      <div
        className="pointer-events-none absolute -top-8 -start-4 size-40 rounded-full bg-primary/15 blur-3xl opacity-70"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-4 start-32 size-32 rounded-full bg-accent/10 blur-3xl opacity-60"
        aria-hidden
      />

      {breadcrumbs || actions ? (
        <div className="relative flex items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">{breadcrumbs}</div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}

      <div className="relative flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl bg-gradient-to-br from-foreground via-foreground to-primary/80 bg-clip-text text-transparent">
          {title}
        </h1>
        {subtitle ? (
          <p className="text-sm text-muted-foreground md:text-base leading-relaxed max-w-3xl">{subtitle}</p>
        ) : null}
      </div>

      {impact && impact.length > 0 ? (
        <div className="relative flex flex-wrap items-center gap-2">
          {impact.map((chip, i) => (
            <span
              key={i}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium shadow-sm backdrop-blur-sm transition-transform hover:-translate-y-0.5",
                toneClasses[chip.tone ?? "default"],
              )}
            >
              {chip.icon}
              {chip.label}
            </span>
          ))}
        </div>
      ) : null}

      {/* Gradient underline — accent colored to match brand */}
      <div
        className="relative h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent"
        aria-hidden
      />
    </header>
  );
}
