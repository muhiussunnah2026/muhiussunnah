import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Premium textarea — same visual system as <Input>: rounded-xl, tinted
 * card background, primary-tinted focus glow. Uses field-sizing-content
 * so it grows with the value.
 */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-20 w-full rounded-xl border border-border/70 bg-card/50 px-3.5 py-2.5 text-sm transition-all",
        "outline-none placeholder:text-muted-foreground/70",
        "hover:border-border hover:bg-card/70",
        "focus-visible:border-primary/60 focus-visible:bg-card focus-visible:ring-4 focus-visible:ring-primary/15 focus-visible:shadow-lg focus-visible:shadow-primary/10",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive/60 aria-invalid:ring-4 aria-invalid:ring-destructive/15",
        "dark:bg-input/30 dark:hover:bg-input/50 dark:focus-visible:bg-input/60",
        "dark:aria-invalid:border-destructive/50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
