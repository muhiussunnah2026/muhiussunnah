"use client";

import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { useSidebar } from "./sidebar-state";
import { cn } from "@/lib/utils";
import { SidebarNavTree, type NavTree } from "./sidebar-nav-tree";

/**
 * Two-mode sidebar container:
 *   • md+ : classic sticky rail that collapses to icon-only (72px) or full (240px)
 *   • <md : full-height slide-in drawer with backdrop (mobileOpen state)
 *
 * Takes `items` directly so we can render the nav twice in two different
 * "expanded" modes — desktop respects the collapsed toggle, mobile drawer
 * always shows full labels.
 */
export function SidebarShell({ tree }: { tree: NavTree }) {
  const { collapsed, mobileOpen, closeMobile } = useSidebar();
  const t = useTranslations("sidebar");

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
        <SidebarNavTree tree={tree} expanded={!collapsed} />
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
          aria-label={t("close")}
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
          aria-label={t("nav_menu")}
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-muted-foreground">{t("menu")}</span>
            <button
              type="button"
              onClick={closeMobile}
              className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label={t("close")}
            >
              <X className="size-4" />
            </button>
          </div>
          <div
            className="pointer-events-none absolute end-0 inset-y-0 w-px bg-gradient-to-b from-primary/20 via-primary/40 to-accent/20"
            aria-hidden
          />
          <SidebarNavTree tree={tree} expanded={true} />
          <SidebarFooter expanded={true} />
        </aside>
      </div>
    </>
  );
}

function SidebarFooter({ expanded }: { expanded: boolean }) {
  const t = useTranslations("sidebar");
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
            {t("powered_by")}{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-semibold">
              Muhius Sunnah
            </span>
          </span>
        ) : null}
      </div>
    </div>
  );
}
