"use client";

import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

/**
 * Sidebar state — two separate dimensions:
 *   • `collapsed`  → desktop icon-rail mode (persists in localStorage)
 *   • `mobileOpen` → mobile drawer overlay (does NOT persist; closes on nav)
 *
 * Shared between the hamburger button in the header, the sidebar shell,
 * and the mobile drawer backdrop.
 */
type SidebarState = {
  collapsed: boolean;
  mobileOpen: boolean;
  toggle: () => void;
  toggleMobile: () => void;
  closeMobile: () => void;
  setCollapsed: (v: boolean) => void;
};

const SidebarCtx = createContext<SidebarState | null>(null);

const STORAGE_KEY = "dashboard:sidebar-collapsed";

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsedState] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "1") setCollapsedState(true);
    } catch {
      /* storage disabled */
    }
  }, []);

  // Auto-close the mobile drawer whenever the route changes. Without
  // this, tapping a nav item would leave the overlay stuck open on top
  // of the newly loaded page.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile drawer is open so the underlying
  // page doesn't scroll behind it.
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const setCollapsed = useCallback((v: boolean) => {
    setCollapsedState(v);
    try {
      localStorage.setItem(STORAGE_KEY, v ? "1" : "0");
    } catch {
      /* storage disabled */
    }
  }, []);

  const toggle = useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed, setCollapsed]);

  const toggleMobile = useCallback(() => setMobileOpen((v) => !v), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <SidebarCtx.Provider
      value={{ collapsed, mobileOpen, toggle, toggleMobile, closeMobile, setCollapsed }}
    >
      {children}
    </SidebarCtx.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarCtx);
  if (!ctx) throw new Error("useSidebar must be used inside <SidebarProvider>");
  return ctx;
}
