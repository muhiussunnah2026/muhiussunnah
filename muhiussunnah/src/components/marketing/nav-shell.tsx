"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Fixed-position shrinking navbar with mobile hamburger.
 *
 * Desktop (md+): logo | nav links | controls (lang, theme, login, signup)
 *
 * Mobile (< md): logo | hamburger button. Tapping hamburger opens a
 * full-screen glassy drawer with:
 *   - All nav links (stacked, big tap targets)
 *   - Language switcher + theme toggle inline
 *   - Login + signup CTAs
 *
 * Scroll behaviour: same for both sizes — top = transparent, scrolled =
 * solid blur with shadow. Drawer locks body scroll while open.
 */
export function NavShell({
  logo,
  links,
  leftControls,
  themeToggle,
  loginHref,
  loginLabel,
  signupHref,
  signupLabel,
  showSignupCta = true,
  isSignedIn = false,
}: {
  logo: ReactNode;
  links: Array<{ href: string; label: string }>;
  leftControls: ReactNode;
  themeToggle: ReactNode;
  loginHref: string;
  loginLabel: string;
  signupHref: string;
  signupLabel: string;
  /** Hide the separate signup CTA (used when the signed-in user already has a dashboard link). */
  showSignupCta?: boolean;
  /** True when a user is signed in — used to style the primary CTA as a dashboard badge. */
  isSignedIn?: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  // Close on Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-30 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          scrolled || mobileOpen
            ? "border-b border-border/50 bg-background/80 backdrop-blur-xl shadow-[0_10px_30px_-20px_rgba(124,92,255,0.2)]"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <div
          className={cn(
            "mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 md:px-8 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
            scrolled ? "py-2.5" : "py-3 md:py-5",
          )}
        >
          {/* Logo */}
          <div
            className={cn(
              "transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
              scrolled ? "scale-90" : "scale-100",
            )}
          >
            {logo}
          </div>

          {/* Desktop nav links */}
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => {
              const active = isActive(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative rounded-full px-3.5 py-1.5 text-sm transition-all duration-300 group",
                    active
                      ? "text-primary font-semibold bg-primary/10 border border-primary/30 shadow-sm"
                      : "text-muted-foreground hover:text-foreground border border-transparent",
                  )}
                >
                  {l.label}
                  <span
                    className={cn(
                      "pointer-events-none absolute inset-x-3 bottom-0.5 h-[2px] origin-center bg-gradient-primary transition-transform duration-300",
                      active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Desktop controls (hidden on mobile) */}
          <div className="hidden md:flex items-center gap-1.5">
            {leftControls}
            {themeToggle}
            {!isSignedIn && (
              <Link
                href={loginHref}
                className={cn(
                  "group hidden sm:inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/60 px-4 py-1.5 text-sm font-medium backdrop-blur-md transition-all duration-300",
                  "hover:border-primary/50 hover:bg-primary/10 hover:text-primary",
                )}
              >
                {loginLabel}
              </Link>
            )}
            {(showSignupCta || isSignedIn) && (
              <Link
                href={isSignedIn ? loginHref : signupHref}
                className={cn(
                  "group relative inline-flex items-center gap-1 overflow-hidden rounded-full bg-gradient-primary animate-gradient px-4 py-1.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-all duration-300",
                  "hover:shadow-xl hover:shadow-primary/50 hover:scale-[1.03]",
                )}
              >
                <span className="relative z-10 flex items-center gap-1">
                  {isSignedIn ? loginLabel : signupLabel}
                  <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
                <span
                  aria-hidden
                  className="absolute inset-0 translate-x-[-120%] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[120%]"
                />
              </Link>
            )}
          </div>

          {/* Mobile: hamburger only */}
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className={cn(
              "md:hidden group inline-flex size-10 items-center justify-center rounded-full border backdrop-blur-md text-foreground",
              "cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
              "border-border/60 bg-background/70",
              "active:scale-95 hover:-translate-y-[1px] hover:border-primary/50",
              "hover:bg-gradient-to-br hover:from-primary/15 hover:via-background hover:to-accent/10",
              "hover:shadow-md hover:shadow-primary/20",
              mobileOpen && "border-primary/60 bg-gradient-to-br from-primary/20 via-background to-accent/15 shadow-md shadow-primary/20",
              "[&>svg]:transition-transform [&>svg]:duration-300",
              mobileOpen ? "[&>svg]:rotate-90" : "group-hover:[&>svg]:scale-110",
            )}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-20 md:hidden transition-opacity duration-300",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
        onClick={() => setMobileOpen(false)}
      >
        {/* backdrop */}
        <div className="absolute inset-0 bg-background/60 backdrop-blur-md" aria-hidden />
      </div>

      <aside
        className={cn(
          "fixed top-[60px] inset-x-3 z-25 md:hidden rounded-2xl border border-border/60 bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          mobileOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-4 pointer-events-none",
        )}
        role="dialog"
        aria-label="Main menu"
        aria-hidden={!mobileOpen}
      >
        {/* Accent stripe */}
        <div className="h-1 bg-gradient-primary animate-gradient" aria-hidden />

        <div className="p-4 space-y-4">
          {/* Nav links */}
          <nav className="flex flex-col gap-1">
            {links.map((l) => {
              const active = isActive(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium",
                    "cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                    "active:scale-[0.98]",
                    active
                      ? "bg-gradient-to-r from-primary/20 via-primary/10 to-transparent text-primary border border-primary/30 shadow-sm"
                      : "text-foreground border border-transparent hover:border-primary/30 hover:bg-gradient-to-r hover:from-primary/10 hover:via-muted/50 hover:to-transparent hover:translate-x-1 hover:shadow-sm",
                  )}
                >
                  <span>{l.label}</span>
                  {active && <span className="size-2 rounded-full bg-primary" aria-hidden />}
                </Link>
              );
            })}
          </nav>

          {/* Divider */}
          <div className="h-px bg-border/60" aria-hidden />

          {/* Controls row */}
          <div className="flex items-center gap-2">
            <div className="flex-1">{leftControls}</div>
            {themeToggle}
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-2 pt-1">
            {!isSignedIn && (
              <Link
                href={loginHref}
                className="w-full text-center rounded-xl border border-border/60 bg-background px-4 py-3 text-sm font-medium transition hover:border-primary/50 hover:bg-primary/5"
              >
                {loginLabel}
              </Link>
            )}
            {(showSignupCta || isSignedIn) && (
              <Link
                href={isSignedIn ? loginHref : signupHref}
                className="group relative w-full text-center overflow-hidden rounded-xl bg-gradient-primary animate-gradient px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30"
              >
                <span className="relative z-10 inline-flex items-center justify-center gap-1">
                  {isSignedIn ? loginLabel : signupLabel}
                  <ArrowUpRight className="size-4" />
                </span>
                <span
                  aria-hidden
                  className="absolute inset-0 translate-x-[-120%] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[120%]"
                />
              </Link>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
