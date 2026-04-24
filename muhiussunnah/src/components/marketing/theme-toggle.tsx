"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const current = mounted ? (resolvedTheme ?? theme ?? "dark") : "dark";
  const isDark = current === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        // Structure
        "group inline-flex size-9 items-center justify-center rounded-full border bg-background/70 backdrop-blur-md",
        // Interactive cues the user explicitly asked for: hand cursor
        // + smooth gradient-tinted bg animation + subtle lift on hover
        "cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "border-border/60 hover:-translate-y-[1px] hover:border-primary/50",
        "hover:bg-gradient-to-br hover:from-primary/15 hover:via-background hover:to-accent/10",
        "hover:shadow-md hover:shadow-primary/20",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        // The icon itself rotates slightly on hover for a playful beat
        "[&>svg]:transition-transform [&>svg]:duration-300 hover:[&>svg]:rotate-12",
        className,
      )}
      aria-label="Toggle theme"
      suppressHydrationWarning
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}
