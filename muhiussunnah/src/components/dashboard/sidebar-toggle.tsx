"use client";

import { Menu } from "lucide-react";
import { useSidebar } from "./sidebar-state";

/**
 * Hamburger button in the header — visible at every breakpoint.
 *
 * • Desktop (md+): toggles icon-rail mode (60px ↔ 240px).
 * • Mobile: opens a full-height slide-in drawer overlay (managed by the
 *   sidebar shell's mobile variant).
 */
export function SidebarToggle() {
  const { collapsed, mobileOpen, toggle, toggleMobile } = useSidebar();

  function handleClick() {
    // md+ is 768px. Below that we always use the drawer.
    if (typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches) {
      toggle();
    } else {
      toggleMobile();
    }
  }

  const expanded = mobileOpen || !collapsed;

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={expanded ? "সাইডবার বন্ধ করুন" : "সাইডবার খুলুন"}
      aria-expanded={expanded}
      className="inline-flex size-10 items-center justify-center rounded-xl border border-border/60 bg-card/60 text-muted-foreground shadow-sm transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary hover:shadow-md hover:shadow-primary/10 active:scale-95"
    >
      <Menu className="size-5" />
    </button>
  );
}
