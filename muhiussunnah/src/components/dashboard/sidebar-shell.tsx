"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { useSidebar } from "./sidebar-state";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon?: ReactNode;
};

/**
 * Two-mode sidebar container:
 *   • md+ : classic sticky rail that collapses to icon-only (72px) or full (240px)
 *   • <md : full-height slide-in drawer with backdrop (mobileOpen state)
 *
 * Takes `items` directly so we can render the nav twice in two different
 * "expanded" modes — desktop respects the collapsed toggle, mobile drawer
 * always shows full labels.
 */
export function SidebarShell({ items }: { items: NavItem[] }) {
  const { collapsed, mobileOpen, closeMobile } = useSidebar();

  return (
    <>
      {/* Desktop sidebar — sticky rail, hidden on mobile */}
      <aside
        data-collapsed={collapsed ? "true" : "false"}
        className={cn(
          "relative sticky top-[74px] hidden h-[calc(100vh-74px)] shrink-0 flex-col overflow-y-auto bg-sidebar/70 backdrop-blur-md md:flex transition-[width,padding] duration-300 ease-in-out",
          collapsed ? "w-[72px] px-2 py-5" : "w-60 px-3 py-5",
        )}
      >
        <div
          className="pointer-events-none absolute end-0 inset-y-0 w-px bg-gradient-to-b from-primary/20 via-primary/40 to-accent/20"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -top-8 -start-8 size-40 rounded-full bg-primary/10 blur-3xl"
          aria-hidden
        />
        <SidebarNavBody items={items} expanded={!collapsed} />
        <SidebarFooter expanded={!collapsed} />
      </aside>

      {/* Mobile drawer — slide-in overlay, shown only below md */}
      <div
        className={cn(
          "fixed inset-0 z-50 md:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          aria-label="সাইডবার বন্ধ করুন"
          onClick={closeMobile}
          className={cn(
            "absolute inset-0 bg-foreground/40 backdrop-blur-sm transition-opacity duration-300",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
        />
        <aside
          className={cn(
            "absolute start-0 top-0 h-full w-[78vw] max-w-[300px] overflow-y-auto bg-background shadow-2xl shadow-black/20 transition-transform duration-300 ease-out",
            "flex flex-col px-3 py-4",
            mobileOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full",
          )}
          role="dialog"
          aria-modal="true"
          aria-label="নেভিগেশন মেনু"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-muted-foreground">মেনু</span>
            <button
              type="button"
              onClick={closeMobile}
              className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label="বন্ধ করুন"
            >
              <X className="size-4" />
            </button>
          </div>
          <div
            className="pointer-events-none absolute end-0 inset-y-0 w-px bg-gradient-to-b from-primary/20 via-primary/40 to-accent/20"
            aria-hidden
          />
          <SidebarNavBody items={items} expanded={true} />
          <SidebarFooter expanded={true} />
        </aside>
      </div>
    </>
  );
}

/**
 * The nav items themselves. Extracted so the shell can render it twice
 * (once for desktop, once for mobile drawer) with different `expanded`
 * states — desktop respects the collapse toggle; mobile is always full.
 */
function SidebarNavBody({ items, expanded }: { items: NavItem[]; expanded: boolean }) {
  const pathname = usePathname();

  const rootHomes = new Set(["/admin", "/teacher", "/portal"]);
  let activeHref: string | null = null;
  if (pathname) {
    let bestLen = -1;
    for (const item of items) {
      const href = item.href;
      const matches = rootHomes.has(href)
        ? pathname === href
        : pathname === href || pathname.startsWith(href + "/");
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
            prefetch={true}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group/nav relative flex items-center rounded-xl border text-sm font-medium transition-all duration-200",
              expanded ? "gap-3 px-3.5 py-2.5" : "justify-center size-12 mx-auto",
              active
                ? "border-primary/40 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent text-primary shadow-md shadow-primary/15 font-semibold"
                : "border-transparent text-sidebar-foreground/80 hover:border-primary/30 hover:bg-primary/5 hover:text-primary hover:shadow-sm hover:shadow-primary/10",
              expanded && !active && "hover:translate-x-0.5",
            )}
            title={!expanded ? item.label : undefined}
          >
            {active && expanded ? (
              <>
                <span
                  className="pointer-events-none absolute start-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-e-full bg-gradient-primary animate-gradient shadow-[0_0_8px_rgba(124,92,255,0.6)]"
                  aria-hidden
                />
                <span
                  className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-transparent"
                  aria-hidden
                />
              </>
            ) : null}
            <span
              className={cn(
                "flex items-center justify-center transition-colors shrink-0 size-6 [&_svg]:size-5",
                active ? "text-primary" : "text-muted-foreground group-hover/nav:text-primary",
              )}
            >
              {item.icon}
            </span>
            {expanded ? <span className="truncate">{item.label}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter({ expanded }: { expanded: boolean }) {
  return (
    <div className="relative mt-auto pt-4">
      <div
        className="pointer-events-none mb-3 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
        aria-hidden
      />
      <div
        className={cn(
          "flex items-center gap-2 text-xs text-muted-foreground/80",
          expanded ? "px-1" : "justify-center",
        )}
      >
        <span className="inline-flex size-6 items-center justify-center rounded-md bg-gradient-primary animate-gradient text-white font-bold text-[11px] shadow-sm shadow-primary/30 shrink-0">
          م
        </span>
        {expanded ? (
          <span className="font-medium">
            Powered by{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-semibold">
              Muhius Sunnah
            </span>
          </span>
        ) : null}
      </div>
    </div>
  );
}
