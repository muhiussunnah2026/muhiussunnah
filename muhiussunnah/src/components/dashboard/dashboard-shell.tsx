import type { ReactNode } from "react";
import Link from "next/link";
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
  children: ReactNode;
};

/**
 * Premium admin shell. Shared by all four dashboards (admin / teacher /
 * portal / super-admin). Glassmorphic header, gradient brand mark,
 * sidebar with rounded pill nav items, airy content area. Function
 * unchanged — only the look.
 */
export function DashboardShell({ title, subtitle, nav, userLabel, children }: Props) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      {/* Aurora background wash — identical treatment to the marketing site */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-48 -start-48 size-[500px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -top-32 end-0 size-[400px] rounded-full bg-accent/10 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/70 backdrop-blur-xl shadow-sm shadow-primary/5">
        <div className="flex items-center justify-between gap-4 px-4 py-3.5 md:px-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="group/brand flex items-center gap-2.5">
              <span className="relative inline-flex size-9 items-center justify-center rounded-xl bg-gradient-primary animate-gradient font-bold text-white shadow-lg shadow-primary/30 transition-transform group-hover/brand:scale-105">
                م
              </span>
              <span className="hidden text-sm font-bold tracking-tight md:inline">
                Muhius <span className="text-primary">Sunnah</span>
              </span>
            </Link>
            <div className="hidden items-start gap-3 border-s border-border/60 ps-4 md:flex md:flex-col">
              <div className="flex flex-col leading-tight">
                <p className="text-sm font-semibold">{title}</p>
                {subtitle ? (
                  <p className="text-xs text-muted-foreground">{subtitle}</p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
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
        <aside className="sticky top-[65px] hidden h-[calc(100vh-65px)] w-60 shrink-0 overflow-y-auto border-e border-border/50 bg-sidebar/60 backdrop-blur-sm px-3 py-5 md:block">
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
