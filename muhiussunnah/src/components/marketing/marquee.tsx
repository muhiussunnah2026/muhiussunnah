import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Marquee — infinite horizontal scroll. Renders children twice for seamless
 * loop, with mask-edge fade. Speed is the CSS animation-duration.
 */
export function Marquee({
  children,
  reverse = false,
  speed = "40s",
  className,
}: {
  children: ReactNode;
  reverse?: boolean;
  speed?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden",
        "[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]",
        className,
      )}
    >
      <div
        className={cn(
          "flex gap-8 whitespace-nowrap",
          reverse ? "animate-marquee-rev" : "animate-marquee",
        )}
        style={{ animationDuration: speed }}
      >
        <div className="flex shrink-0 items-center gap-8">{children}</div>
        <div aria-hidden className="flex shrink-0 items-center gap-8">{children}</div>
      </div>
    </div>
  );
}
