/**
 * <EmptyState> — never "No data available".
 *
 * FRONTEND_UX_GUIDE §3.1 / §17 rule #2: every empty state teaches, sells,
 * and offers at least two CTAs.
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

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
    <Card className={cn("border-dashed bg-card/50", className)}>
      <CardContent className="flex flex-col items-center gap-4 p-8 text-center md:p-12">
        {icon ? (
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            {icon}
          </div>
        ) : null}
        <h2 className="text-xl font-semibold text-foreground md:text-2xl">
          {title}
        </h2>
        {body ? (
          <p className="max-w-lg text-sm text-muted-foreground md:text-base">
            {body}
          </p>
        ) : null}
        {(primaryAction || secondaryAction || tertiaryAction) && (
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            {primaryAction}
            {secondaryAction}
            {tertiaryAction}
          </div>
        )}
        {proTip ? (
          <div className="mt-4 max-w-md rounded-lg border border-dashed border-primary/30 bg-primary/5 p-3 text-sm text-muted-foreground">
            <span className="mr-2">💡</span>
            {proTip}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
