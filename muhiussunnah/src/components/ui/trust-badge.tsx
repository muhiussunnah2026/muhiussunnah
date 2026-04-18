/**
 * <TrustBadge> — "Data secure · Daily backup · 200+ institutions" chip.
 *
 * FRONTEND_UX_GUIDE §9: visible on every logged-in page to reinforce safety.
 */

import { Lock, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  variant?: "footer" | "inline";
  className?: string;
};

export function TrustBadge({ variant = "inline", className }: Props) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 text-xs text-muted-foreground",
        variant === "footer" && "border-t border-border/60 px-4 py-3",
        className,
      )}
    >
      <span className="inline-flex items-center gap-1.5">
        <Lock className="size-3.5" aria-hidden />
        ডেটা নিরাপদ · SSL encryption
      </span>
      <span className="inline-flex items-center gap-1.5">
        <ShieldCheck className="size-3.5" aria-hidden />
        দৈনিক backup
      </span>
    </div>
  );
}
