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
  success: "ring-1 ring-success/30",
  warning: "ring-1 ring-warning/30",
  danger: "ring-1 ring-destructive/30",
  accent: "ring-1 ring-primary/30",
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
      <CardContent className="flex flex-col gap-2 p-5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-muted-foreground">{label}</p>
          {icon ? <div className="text-muted-foreground">{icon}</div> : null}
        </div>
        <div className="flex items-baseline gap-1">
          {valuePrefix}
          <span className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {typeof value === "number" || typeof value === "string" ? (
              <BanglaDigit value={value} locale={locale} />
            ) : (
              value
            )}
          </span>
          {valueSuffix}
        </div>
        {trendPct !== undefined && trendPct !== null ? (
          <div className={cn("flex items-center gap-1 text-xs font-medium", trendColor)}>
            <span>
              {trendPct > 0 ? "↗" : trendPct < 0 ? "↘" : "→"}
              {" "}
              {formatTrend(trendPct, locale)}
            </span>
            {trendLabel ? <span className="text-muted-foreground">· {trendLabel}</span> : null}
          </div>
        ) : null}
        {target ? (
          <p className="text-xs text-muted-foreground">🎯 {target}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
