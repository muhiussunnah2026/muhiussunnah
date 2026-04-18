/**
 * <PageHeader> — the universal top strip for every page.
 *
 * FRONTEND_UX_GUIDE §2 / §17 rule #1: every page MUST have a PageHeader
 * with title + value subtitle + optional impact chip.
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

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
  default: "bg-muted/60 text-foreground",
  accent: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success-foreground dark:text-success",
  warning: "bg-warning/10 text-warning-foreground dark:text-warning",
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
    <header className={cn("flex flex-col gap-3 pb-6", className)}>
      {breadcrumbs || actions ? (
        <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">{breadcrumbs}</div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="text-sm text-muted-foreground md:text-base">{subtitle}</p>
        ) : null}
      </div>

      {impact && impact.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {impact.map((chip, i) => (
            <span
              key={i}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
                toneClasses[chip.tone ?? "default"],
              )}
            >
              {chip.icon}
              {chip.label}
            </span>
          ))}
        </div>
      ) : null}

      <Separator className="mt-2" />
    </header>
  );
}
