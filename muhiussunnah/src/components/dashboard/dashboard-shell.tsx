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
 * A minimal dashboard shell used by all four dashboards. Left sidebar
 * navigation on desktop, collapsed on mobile. Detailed shadcn sidebar
 * + command palette lands in Phase 1.
 */
export function DashboardShell({ title, subtitle, nav, userLabel, children }: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur md:px-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-gradient-primary font-bold text-white">
              م
            </span>
            <span className="hidden text-sm font-semibold md:inline">Muhius Sunnah</span>
          </Link>
          <div className="hidden border-l border-border/60 pl-3 md:block">
            <p className="text-sm font-semibold leading-tight">{title}</p>
            {subtitle ? (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <LiveIndicator />
          {userLabel ? (
            <span className="hidden text-sm text-muted-foreground md:inline">
              {userLabel}
            </span>
          ) : null}
          <form action={signOutAction}>
            <Button type="submit" variant="ghost" size="sm" className="gap-2">
              <LogOut className="size-4" />
              <span className="hidden md:inline">লগআউট</span>
            </Button>
          </form>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="sticky top-[56px] hidden h-[calc(100vh-56px)] w-56 shrink-0 overflow-y-auto border-r border-border/60 bg-sidebar px-3 py-4 md:block">
          <nav className="flex flex-col gap-0.5">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-sidebar-foreground transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-4 md:p-6">
          {children}
          <div className="mt-10">
            <TrustBadge variant="footer" />
          </div>
        </main>
      </div>
    </div>
  );
}
