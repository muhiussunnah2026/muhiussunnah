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
      {/* Soft accent glow behind the title */}
      <div
        className="pointer-events-none absolute -top-8 -start-4 size-40 rounded-full bg-primary/10 blur-3xl opacity-70"
        aria-hidden
      />

      {breadcrumbs || actions ? (
        <div className="relative flex items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">{breadcrumbs}</div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}

      <div className="relative flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl lg:text-4xl">
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
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium shadow-sm backdrop-blur-sm",
                toneClasses[chip.tone ?? "default"],
              )}
            >
              {chip.icon}
              {chip.label}
            </span>
          ))}
        </div>
      ) : null}

      {/* Gradient underline instead of hard separator */}
      <div className="relative h-px bg-gradient-to-r from-border/0 via-border/70 to-border/0" aria-hidden />
    </header>
  );
}
