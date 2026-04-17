"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Sticky shrinking navbar.
 *
 * • Top of page: transparent, taller, merges with hero.
 * • After scrolling ~40px: solid blurred background, shrinks vertically,
 *   adds shadow + border. All transitions spring-animated.
 *
 * Handles all RSC inputs as props so the server component wrapper can
 * stay async/locale-aware.
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        scrolled
          ? "border-b border-border/50 bg-background/80 backdrop-blur-xl shadow-[0_10px_30px_-20px_rgba(124,92,255,0.15)]"
          : "border-b border-transparent bg-transparent backdrop-blur-0",
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
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="relative rounded-md px-3 py-1.5 text-sm text-muted-foreground transition hover:text-foreground group"
            >
              {l.label}
              <span className="pointer-events-none absolute inset-x-3 bottom-0.5 h-[2px] origin-center scale-x-0 bg-gradient-primary transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          {leftControls}
          {themeToggle}

          {/* Premium login pill — outlined with hover fill */}
          <Link
            href={loginHref}
            className={cn(
              "group hidden sm:inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/60 px-4 py-1.5 text-sm font-medium backdrop-blur-md transition-all duration-300",
              "hover:border-primary/50 hover:bg-primary/10 hover:text-primary",
            )}
          >
            {loginLabel}
          </Link>

          {/* Premium CTA — gradient filled with shine */}
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
