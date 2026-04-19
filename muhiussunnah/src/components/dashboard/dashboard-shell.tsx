import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrustBadge } from "@/components/ui/trust-badge";
import { LiveIndicator } from "@/components/ui/live-indicator";
import { signOutAction } from "@/server/actions/auth";

type NavItem = {
  href: string;
  label: string;
  icon?: ReactNode;
};

type Props = {
  title: ReactNode;
  subtitle?: ReactNode;
  nav: NavItem[];
  userLabel?: ReactNode;
  /** Optional institution logo URL (from settings). Falls back to the م mark. */
  logoUrl?: string | null;
  children: ReactNode;
};

/**
 * Premium admin shell. The institution name is now the hero of the header —
 * big, centered, with the institution logo on the left. The Muhius Sunnah
 * wordmark lives only in the sidebar as a small watermark, as requested.
 */
export function DashboardShell({ title, subtitle, nav, userLabel, logoUrl, children }: Props) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      {/* Aurora background wash */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-48 -start-48 size-[500px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -top-32 end-0 size-[400px] rounded-full bg-accent/10 blur-[120px]" />
      </div>

      {/* Header — institution identity is the hero */}
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/75 backdrop-blur-xl shadow-sm shadow-primary/5">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3.5 md:px-6">
          {/* Left — institution logo */}
          <Link href="/" className="group/brand flex items-center gap-3">
            <span className="relative inline-flex size-12 items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/10 to-accent/10 shadow-lg shadow-primary/10 transition-transform group-hover/brand:scale-105">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt="Institution logo"
                  width={48}
                  height={48}
                  className="size-full object-contain"
                  unoptimized
                />
              ) : (
                <span className="text-2xl font-extrabold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
                  م
                </span>
              )}
            </span>
          </Link>

          {/* Center — institution name (big, centered) */}
          <div className="min-w-0 text-center">
            <h1 className="truncate text-lg font-extrabold tracking-tight leading-tight md:text-2xl lg:text-3xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="truncate text-xs md:text-sm text-muted-foreground leading-tight">{subtitle}</p>
            ) : null}
          </div>

          {/* Right — live indicator + user + logout */}
          <div className="flex items-center gap-2 justify-end">
            <LiveIndicator />
            {userLabel ? (
              <span className="hidden rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs font-medium text-foreground/80 backdrop-blur md:inline">
                {userLabel}
              </span>
            ) : null}
            <form action={signOutAction}>
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="gap-2 hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive"
              >
                <LogOut className="size-4" />
                <span className="hidden md:inline">লগআউট</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="relative flex flex-1">
        {/* Sidebar */}
        <aside className="sticky top-[74px] hidden h-[calc(100vh-74px)] w-60 shrink-0 flex-col overflow-y-auto border-e border-border/50 bg-sidebar/60 backdrop-blur-sm px-3 py-5 md:flex">
          <nav className="flex flex-col gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group/nav relative flex items-center gap-2.5 rounded-xl border border-transparent px-3.5 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary hover:shadow-sm hover:shadow-primary/5"
              >
                <span className="flex size-5 items-center justify-center text-muted-foreground transition-colors group-hover/nav:text-primary [&_svg]:size-4">
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Muhius Sunnah wordmark — small sidebar footer watermark */}
          <div className="mt-auto pt-4 border-t border-border/50 flex items-center gap-2 px-1 text-xs text-muted-foreground/70">
            <span className="inline-flex size-5 items-center justify-center rounded-md bg-gradient-primary text-white font-bold text-[10px]">
              م
            </span>
            <span className="font-medium">
              Powered by <span className="text-foreground/80">Muhius Sunnah</span>
            </span>
          </div>
        </aside>

        {/* Content */}
        <main className="relative flex-1 p-5 md:p-8">
          {children}
          <div className="mt-10">
            <TrustBadge variant="footer" />
          </div>
        </main>
      </div>
    </div>
  );
}
