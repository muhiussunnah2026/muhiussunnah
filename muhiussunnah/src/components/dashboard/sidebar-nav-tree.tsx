"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronDown, Pin, PinOff, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type NavItem = {
  href: string;
  label: string;
  icon?: ReactNode;
  /** Marked true for routes that incur per-use cost (Claude API,
   *  SMS gateway, WhatsApp). Surfaces as a small "৳" badge. */
  paid?: boolean;
};

export type NavGroup = {
  id: string;
  label: string;
  icon?: ReactNode;
  items: NavItem[];
};

export type NavTree = {
  top: NavItem[];
  groups: NavGroup[];
  bottom: NavItem[];
};

const STORAGE_KEY_GROUPS = "shikkha-sidebar-collapsed-groups";
const STORAGE_KEY_PINS = "shikkha-sidebar-pinned";

function loadSet(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return new Set(parsed);
  } catch {
    return new Set();
  }
}

function saveSet(key: string, set: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(Array.from(set)));
  } catch {
    // ignore
  }
}

/**
 * Categorised, collapsible, pin-aware sidebar nav body.
 *
 * Three sections, top to bottom:
 *   1. Pinned     — items the user pinned (persisted in localStorage)
 *   2. Top fixed  — always-visible essentials (Dashboard, Students, etc.)
 *   3. Groups     — collapsible categories (Academic, Finance, Messaging,
 *                   Operations, Madrasa, Insights), open state persisted
 *   4. Bottom fixed — Settings (always one click away)
 *
 * Pin: hover any item → pin icon appears on the right. Click toggles
 * pin state. Pinned items show in a "📌 Pinned" section at the top.
 *
 * Group state: chevron rotates, click toggles. Persists open/closed
 * preference per group across reloads.
 */
export function SidebarNavTree({
  tree,
  expanded,
}: {
  tree: NavTree;
  expanded: boolean;
}) {
  const t = useTranslations("sidebar");
  const pathname = usePathname();

  // -------------------- localStorage state --------------------
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [pinned, setPinned] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCollapsedGroups(loadSet(STORAGE_KEY_GROUPS));
    setPinned(loadSet(STORAGE_KEY_PINS));
    setHydrated(true);
  }, []);

  const toggleGroup = (id: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveSet(STORAGE_KEY_GROUPS, next);
      return next;
    });
  };

  const togglePin = (href: string) => {
    setPinned((prev) => {
      const next = new Set(prev);
      if (next.has(href)) next.delete(href);
      else next.add(href);
      saveSet(STORAGE_KEY_PINS, next);
      return next;
    });
  };

  // -------------------- derive active item --------------------
  const allItems = useMemo<NavItem[]>(() => {
    const acc: NavItem[] = [...tree.top];
    for (const g of tree.groups) acc.push(...g.items);
    acc.push(...tree.bottom);
    return acc;
  }, [tree]);

  const rootHomes = new Set(["/admin", "/teacher", "/portal"]);
  let activeHref: string | null = null;
  if (pathname) {
    let bestLen = -1;
    for (const item of allItems) {
      const matches = rootHomes.has(item.href)
        ? pathname === item.href
        : pathname === item.href || pathname.startsWith(item.href + "/");
      if (matches && item.href.length > bestLen) {
        bestLen = item.href.length;
        activeHref = item.href;
      }
    }
  }

  // -------------------- pinned bucket --------------------
  const pinnedItems = useMemo<NavItem[]>(() => {
    if (!hydrated || pinned.size === 0) return [];
    return allItems.filter((it) => pinned.has(it.href));
  }, [allItems, pinned, hydrated]);

  return (
    <nav className="flex flex-col gap-1">
      {/* Pinned section — only visible when user has pinned at least one item */}
      {hydrated && pinnedItems.length > 0 ? (
        <>
          {expanded ? (
            <div className="mt-1 mb-1 flex items-center gap-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/70">
              <Pin className="size-3" />
              {t("pinned")}
            </div>
          ) : null}
          {pinnedItems.map((item) => (
            <NavLink
              key={`pin-${item.href}`}
              item={item}
              active={item.href === activeHref}
              expanded={expanded}
              pinned={true}
              onTogglePin={() => togglePin(item.href)}
            />
          ))}
          <div className="my-2 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
        </>
      ) : null}

      {/* Top fixed items */}
      {tree.top.map((item) => (
        <NavLink
          key={item.href}
          item={item}
          active={item.href === activeHref}
          expanded={expanded}
          pinned={pinned.has(item.href)}
          onTogglePin={() => togglePin(item.href)}
        />
      ))}

      {/* Collapsible groups */}
      {tree.groups.map((group) => {
        const isCollapsed = collapsedGroups.has(group.id);
        const groupHasActive = group.items.some((it) => it.href === activeHref);
        return (
          <div key={group.id} className="mt-2">
            {expanded ? (
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className={cn(
                  "group/header flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors cursor-pointer",
                  groupHasActive
                    ? "text-primary"
                    : "text-muted-foreground/70 hover:text-foreground",
                )}
              >
                <span className="flex size-4 shrink-0 items-center justify-center text-current opacity-70">
                  {group.icon}
                </span>
                <span className="flex-1 text-start">{group.label}</span>
                <ChevronDown
                  className={cn(
                    "size-3.5 transition-transform duration-200",
                    isCollapsed ? "-rotate-90" : "rotate-0",
                  )}
                />
              </button>
            ) : (
              // When sidebar is collapsed (icon-only mode) show a thin
              // separator instead of the group header.
              <div
                className="my-1 mx-3 h-px bg-border/40"
                aria-hidden
                title={group.label}
              />
            )}

            {(!isCollapsed || !expanded) ? (
              <div className={cn("flex flex-col gap-1", expanded && "mt-1 ps-1")}>
                {group.items.map((item) => (
                  <NavLink
                    key={item.href}
                    item={item}
                    active={item.href === activeHref}
                    expanded={expanded}
                    pinned={pinned.has(item.href)}
                    onTogglePin={() => togglePin(item.href)}
                    indent={expanded}
                  />
                ))}
              </div>
            ) : null}
          </div>
        );
      })}

      {/* Bottom fixed items (Settings) */}
      {tree.bottom.length > 0 ? (
        <>
          <div className="my-2 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
          {tree.bottom.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={item.href === activeHref}
              expanded={expanded}
              pinned={pinned.has(item.href)}
              onTogglePin={() => togglePin(item.href)}
            />
          ))}
        </>
      ) : null}
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────────

function NavLink({
  item,
  active,
  expanded,
  pinned,
  onTogglePin,
  indent = false,
}: {
  item: NavItem;
  active: boolean;
  expanded: boolean;
  pinned: boolean;
  onTogglePin: () => void;
  indent?: boolean;
}) {
  return (
    <div
      className={cn(
        "group/nav-row relative",
        indent && expanded ? "ps-2" : "",
      )}
    >
      <Link
        href={item.href}
        prefetch={true}
        aria-current={active ? "page" : undefined}
        className={cn(
          "relative flex items-center rounded-xl border text-sm font-medium transition-all duration-200",
          expanded
            ? "gap-3 px-3.5 py-2.5 pe-9" // pe-9 leaves room for the pin button
            : "justify-center size-12 mx-auto",
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
            active ? "text-primary" : "text-muted-foreground group-hover/nav-row:text-primary",
          )}
        >
          {item.icon}
        </span>
        {expanded ? (
          <>
            <span className="truncate flex-1">{item.label}</span>
            {item.paid ? (
              <span
                title="Premium · per-use billing"
                className="inline-flex size-4 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-[9px] font-bold text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/30"
              >
                ৳
              </span>
            ) : null}
          </>
        ) : null}
      </Link>

      {/* Pin / unpin button — only shown when expanded.
          Hidden until row hover OR when already pinned. */}
      {expanded ? (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onTogglePin();
          }}
          aria-label={pinned ? "Unpin" : "Pin to top"}
          className={cn(
            "absolute end-2 top-1/2 -translate-y-1/2 inline-flex size-6 items-center justify-center rounded-md cursor-pointer transition-all duration-200",
            pinned
              ? "text-primary opacity-100"
              : "text-muted-foreground opacity-0 group-hover/nav-row:opacity-100 hover:text-primary hover:bg-primary/10",
          )}
        >
          {pinned ? <PinOff className="size-3.5" /> : <Pin className="size-3.5" />}
        </button>
      ) : null}
    </div>
  );
}

// Helper export — accepts a flat NavItem[] (used by /super-admin) and
// wraps it as a single tree with everything in `top`. Lets the shell
// stay one component for both grouped + flat sidebars.
export function flatToTree(items: NavItem[]): NavTree {
  return { top: items, groups: [], bottom: [] };
}

// Re-export sparkles so the layout doesn't import a stray icon.
export { Sparkles as SparklesIcon };
