/**
 * <MetricCard> — hero number + trend + target context.
 *
 * FRONTEND_UX_GUIDE §3.3: numbers alone are boring; pair with trend +
 * goal/benchmark. Use on every dashboard.
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "./bangla-digit";
import { formatTrend } from "@/lib/utils/format";

type Props = {
  label: ReactNode;
  value: number | string | ReactNode;
  valuePrefix?: ReactNode;
  valueSuffix?: ReactNode;
  trendPct?: number | null;
  trendLabel?: ReactNode;
  target?: ReactNode;
  icon?: ReactNode;
  locale?: "bn" | "en" | "ar";
  tone?: "default" | "success" | "warning" | "danger" | "accent";
  className?: string;
};

const toneBorder: Record<NonNullable<Props["tone"]>, string> = {
  default: "border-border/60 bg-gradient-to-br from-card via-card to-primary/[0.03]",
  success: "border-success/30 bg-gradient-to-br from-card via-card to-success/10",
  warning: "border-warning/30 bg-gradient-to-br from-card via-card to-warning/10",
  danger: "border-destructive/30 bg-gradient-to-br from-card via-card to-destructive/10",
  accent: "border-primary/30 bg-gradient-to-br from-card via-card to-primary/10",
};

const toneIconBg: Record<NonNullable<Props["tone"]>, string> = {
  default: "bg-gradient-to-br from-primary/15 to-accent/15 text-primary",
  success: "bg-gradient-to-br from-success/25 to-success/10 text-success shadow-sm shadow-success/20",
  warning: "bg-gradient-to-br from-warning/25 to-warning/10 text-warning shadow-sm shadow-warning/20",
  danger: "bg-gradient-to-br from-destructive/25 to-destructive/10 text-destructive shadow-sm shadow-destructive/20",
  accent: "bg-gradient-to-br from-primary/25 to-accent/15 text-primary shadow-sm shadow-primary/20",
};

const toneGlow: Record<NonNullable<Props["tone"]>, string> = {
  default: "from-primary/20 to-accent/20",
  success: "from-success/30 to-success/10",
  warning: "from-warning/30 to-warning/10",
  danger: "from-destructive/30 to-destructive/10",
  accent: "from-primary/30 to-accent/20",
};

export function MetricCard({
  label,
  value,
  valuePrefix,
  valueSuffix,
  trendPct,
  trendLabel,
  target,
  icon,
  locale = "bn",
  tone = "default",
  className,
}: Props) {
  const trendColor =
    trendPct === undefined || trendPct === null
      ? ""
      : trendPct > 0
        ? "text-success"
        : trendPct < 0
          ? "text-destructive"
          : "text-muted-foreground";

  return (
    <Card
      className={cn(
        "group/metric relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/10",
        toneBorder[tone],
        className,
      )}
    >
      {/* Corner glow — lights up on hover */}
      <div
        className={cn(
          "pointer-events-none absolute -top-10 -end-10 size-32 rounded-full bg-gradient-to-br opacity-0 blur-2xl transition-opacity duration-500 group-hover/metric:opacity-100",
          toneGlow[tone],
        )}
        aria-hidden
      />
      <CardContent className="relative flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          {icon ? (
            <div
              className={cn(
                "flex size-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover/metric:scale-110 group-hover/metric:rotate-3",
                toneIconBg[tone],
              )}
            >
              {icon}
            </div>
          ) : null}
        </div>
        <div className="flex items-baseline gap-1">
          {valuePrefix}
          <span
            className={cn(
              "text-3xl font-bold tracking-tight tabular-nums md:text-4xl",
              tone === "accent"
                ? "bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient"
                : "text-foreground",
            )}
          >
            {typeof value === "number" || typeof value === "string" ? (
              <BanglaDigit value={value} locale={locale} />
            ) : (
              value
            )}
          </span>
          {valueSuffix}
        </div>
        {trendPct !== undefined && trendPct !== null ? (
          <div className={cn("flex items-center gap-1 text-xs font-semibold", trendColor)}>
            <span>
              {trendPct > 0 ? "↗" : trendPct < 0 ? "↘" : "→"}
              {" "}
              {formatTrend(trendPct, locale)}
            </span>
            {trendLabel ? <span className="font-normal text-muted-foreground">· {trendLabel}</span> : null}
          </div>
        ) : null}
        {target ? (
          <p className="text-xs text-muted-foreground">🎯 {target}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
