import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

/**
 * Premium admin input — upgraded from the default shadcn/base-ui look so
 * the backend matches the marketing site's aesthetic. Taller, rounder,
 * tinted card background, and a soft primary glow on focus.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-xl border border-border/70 bg-card/50 px-3.5 py-2 text-sm transition-all",
        "outline-none placeholder:text-muted-foreground/70",
        "hover:border-border hover:bg-card/70",
        "focus-visible:border-primary/60 focus-visible:bg-card focus-visible:ring-4 focus-visible:ring-primary/15 focus-visible:shadow-lg focus-visible:shadow-primary/10",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive/60 aria-invalid:ring-4 aria-invalid:ring-destructive/15",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        "dark:bg-input/30 dark:hover:bg-input/50 dark:focus-visible:bg-input/60",
        "dark:aria-invalid:border-destructive/50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
