"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Fixed-position shrinking navbar that truly merges with the hero.
 *
 * Positioned `fixed` at top so it floats over whatever section is below —
 * the first hero section renders from y=0, letting its mesh background
 * extend all the way to the top with the nav visually floating on top.
 *
 * • Top of page: fully transparent, no border/shadow/blur.
 * • After scrolling ~40px: solid blurred bg, border, shadow, smaller padding.
 * • Active nav link: distinct pill background + solid underline so the
 *   current page is always clear.
 *
 * Transitions: 500ms cubic-bezier(0.16,1,0.3,1) — spring feel.
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
}: {
  logo: ReactNode;
  links: Array<{ href: string; label: string }>;
  leftControls: ReactNode;
  themeToggle: ReactNode;
  loginHref: string;
  loginLabel: string;
  signupHref: string;
  signupLabel: string;
}) {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // "/" matches only exact root. Other links match prefix (so /pricing also
  // highlights for /pricing/lifetime, /pricing/growth etc).
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-30 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        scrolled
          ? "border-b border-border/50 bg-background/75 backdrop-blur-xl shadow-[0_10px_30px_-20px_rgba(124,92,255,0.2)]"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-4 md:px-8 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          scrolled ? "py-2.5" : "py-5",
        )}
      >
        <div
          className={cn(
            "transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
            scrolled ? "scale-90" : "scale-100",
          )}
        >
          {logo}
        </div>

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

        <div className="flex items-center gap-1.5">
          {leftControls}
          {themeToggle}

          <Link
            href={loginHref}
            className={cn(
              "group hidden sm:inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/60 px-4 py-1.5 text-sm font-medium backdrop-blur-md transition-all duration-300",
              "hover:border-primary/50 hover:bg-primary/10 hover:text-primary",
            )}
          >
            {loginLabel}
          </Link>

          <Link
            href={signupHref}
            className={cn(
              "group relative inline-flex items-center gap-1 overflow-hidden rounded-full bg-gradient-primary animate-gradient px-4 py-1.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-all duration-300",
              "hover:shadow-xl hover:shadow-primary/50 hover:scale-[1.03]",
            )}
          >
            <span className="relative z-10 flex items-center gap-1">
              {signupLabel}
              <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
            <span
              aria-hidden
              className="absolute inset-0 translate-x-[-120%] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[120%]"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
