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
  default: "",
  success: "border-success/30 bg-gradient-to-br from-card to-success/5",
  warning: "border-warning/30 bg-gradient-to-br from-card to-warning/5",
  danger: "border-destructive/30 bg-gradient-to-br from-card to-destructive/5",
  accent: "border-primary/30 bg-gradient-to-br from-card to-primary/5",
};

const toneIconBg: Record<NonNullable<Props["tone"]>, string> = {
  default: "bg-muted text-muted-foreground",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-destructive/15 text-destructive",
  accent: "bg-primary/15 text-primary",
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
    <Card className={cn("relative overflow-hidden", toneBorder[tone], className)}>
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          {icon ? (
            <div className={cn("flex size-9 items-center justify-center rounded-xl", toneIconBg[tone])}>
              {icon}
            </div>
          ) : null}
        </div>
        <div className="flex items-baseline gap-1">
          {valuePrefix}
          <span className="text-3xl font-bold tracking-tight text-foreground md:text-4xl tabular-nums">
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
