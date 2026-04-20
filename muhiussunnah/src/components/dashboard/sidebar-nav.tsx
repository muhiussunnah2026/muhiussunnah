"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon?: ReactNode;
};

/**
 * Sidebar nav with active-page highlighting. A small client-only component
 * so we can read usePathname() without making the whole shell client-side.
 */
export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  /**
   * Pick exactly ONE "active" item — the one whose href best matches the
   * current pathname.
   *
   * Previous buggy logic used prefix-matching on every item, so visiting
   * /fees/payments lit up BOTH the "ফি" (/fees) and "পেমেন্ট" (/fees/
   * payments) sidebar items because /fees is a prefix of /fees/payments.
   *
   * Correct logic: among all items whose href either exactly equals the
   * pathname OR is a proper path-segment prefix of it, pick the one with
   * the longest href. That's always the most specific menu item and the
   * one we want highlighted.
   *
   * Exception: dashboard root URLs (/admin, /teacher, /portal) only
   * count as matches when the pathname equals them exactly — they must
   * never activate for any descendant page.
   */
  const rootHomes = new Set(["/admin", "/teacher", "/portal"]);
  let activeHref: string | null = null;
  if (pathname) {
    let bestLen = -1;
    for (const item of items) {
      const href = item.href;
      let matches: boolean;
      if (rootHomes.has(href)) {
        matches = pathname === href;
      } else {
        matches = pathname === href || pathname.startsWith(href + "/");
      }
      if (matches && href.length > bestLen) {
        bestLen = href.length;
        activeHref = href;
      }
    }
  }

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const active = item.href === activeHref;
        return (
          <Link
            key={item.href}
            href={item.href}
            // Force full prefetch on all sidebar links. By default Next 15+
            // prefetches only the loading boundary for dynamic routes; forcing
            // the full RSC payload means clicking a sidebar item after hover
            // is instant (no server round-trip). Cost: a bit more upfront
            // bandwidth when the sidebar is in view, which is negligible.
            prefetch={true}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group/nav relative flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-all",
              active
                ? "border-primary/40 bg-gradient-to-r from-primary/15 via-primary/10 to-transparent text-primary shadow-sm shadow-primary/10 font-semibold"
                : "border-transparent text-sidebar-foreground/80 hover:border-primary/30 hover:bg-primary/5 hover:text-primary hover:shadow-sm hover:shadow-primary/5",
            )}
          >
            {/* Active rail on the start edge */}
            {active ? (
              <span
                className="pointer-events-none absolute start-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-e-full bg-gradient-primary"
                aria-hidden
              />
            ) : null}
            <span
              className={cn(
                "flex size-5 items-center justify-center transition-colors [&_svg]:size-4",
                active ? "text-primary" : "text-muted-foreground group-hover/nav:text-primary",
              )}
            >
              {item.icon}
            </span>
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
