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

  const isActive = (href: string): boolean => {
    if (!pathname) return false;
    // Dashboard index (/school/xxx/admin) — match exactly, otherwise every
    // sub-page would also "activate" the dashboard link.
    const segments = href.split("/").filter(Boolean);
    const isRoot = segments.length === 3 && segments[2] === "admin";
    if (isRoot) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
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
