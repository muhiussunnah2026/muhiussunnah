import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrustBadge } from "@/components/ui/trust-badge";
import { LiveIndicator } from "@/components/ui/live-indicator";
import { LanguageSwitcher } from "@/components/marketing/language-switcher";
import { ThemeToggle } from "@/components/marketing/theme-toggle";
import { defaultLocale, isLocale, localeCookieName, type Locale } from "@/lib/i18n/config";
import { SidebarNav } from "./sidebar-nav";
import { signOutAction } from "@/server/actions/auth";

type NavItem = {
  href: string;
  label: string;
  icon?: ReactNode;
};

/**
 * One composable line of header text. Admins choose which fields appear
 * (via settings) — we render the ones that have content, separated by
 * a subtle middle-dot.
 */
export type HeaderField = {
  key: string;
  value: string | null | undefined;
  emphasis?: "primary" | "secondary";
};

type Props = {
  /** @deprecated use headerFields instead. Kept for back-compat. */
  title?: ReactNode;
  subtitle?: ReactNode;
  /** Multi-part header composition. If omitted falls back to title/subtitle. */
  headerFields?: HeaderField[];
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
export async function DashboardShell({
  title,
  subtitle,
  headerFields,
  nav,
  userLabel,
  logoUrl,
  children,
}: Props) {
  const jar = await cookies();
  const cookieLocale = jar.get(localeCookieName)?.value;
  const locale: Locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;

  // Build the visible header lines. Each field gets its own row so
  // address/phone/website don't turn into one cramped string.
  const visibleFields = (headerFields ?? []).filter(
    (f) => typeof f.value === "string" && f.value.trim().length > 0,
  );
  const primary = visibleFields.find((f) => f.emphasis !== "secondary");
  const secondary = visibleFields.filter((f) => f !== primary);

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      {/* Ambient gradient wash behind the whole dashboard — gives a "branded"
          feel without costing GPU on scroll (no animation, no blur on big
          surfaces). A second soft orb at bottom completes the composition. */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 h-72 bg-gradient-to-b from-primary/[0.06] via-accent/[0.04] to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed -bottom-40 -end-40 size-96 rounded-full bg-accent/[0.05] blur-3xl"
        aria-hidden
      />

      {/* Header — institution identity is the hero. Ambient gradient glow
          behind center content, gradient underline (not a flat border),
          glass-morphism backdrop. */}
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-md shadow-sm shadow-primary/[0.06]">
        {/* Aurora glow behind center content */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-full bg-gradient-to-b from-primary/[0.04] via-accent/[0.02] to-transparent"
          aria-hidden
        />
        {/* Gradient underline — more premium than a flat border */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
          aria-hidden
        />
        <div className="relative grid grid-cols-3 items-center gap-4 px-4 py-3.5 md:px-6">
          {/* Left — institution logo with animated gradient ring */}
          <Link href="/" className="group/brand flex items-center gap-3 justify-self-start">
            <span className="relative inline-flex size-12 items-center justify-center overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 via-background to-accent/15 shadow-lg shadow-primary/15 transition-all group-hover/brand:scale-105 group-hover/brand:shadow-primary/25">
              {/* Rotating gradient halo on hover */}
              <span
                className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-tr from-primary/0 via-primary/20 to-accent/0 opacity-0 transition-opacity duration-500 group-hover/brand:opacity-100"
                aria-hidden
              />
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt="Institution logo"
                  width={48}
                  height={48}
                  className="relative size-full object-contain"
                  unoptimized
                />
              ) : (
                <span className="relative text-2xl font-extrabold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
                  م
                </span>
              )}
            </span>
          </Link>

          {/* Center — institution identity with gradient accent */}
          <div className="min-w-0 text-center justify-self-center w-full">
            {visibleFields.length > 0 ? (
              <>
                {primary ? (
                  <h1 className="truncate text-lg font-extrabold tracking-tight leading-tight md:text-2xl lg:text-3xl bg-gradient-to-r from-foreground via-foreground to-primary/90 bg-clip-text text-transparent">
                    {primary.value}
                  </h1>
                ) : null}
                {secondary.length > 0 ? (
                  <p className="truncate text-xs md:text-sm text-muted-foreground leading-snug mt-0.5">
                    {secondary.map((f) => f.value).join(" · ")}
                  </p>
                ) : null}
              </>
            ) : (
              <>
                <h1 className="truncate text-lg font-extrabold tracking-tight leading-tight md:text-2xl lg:text-3xl bg-gradient-to-r from-foreground via-foreground to-primary/90 bg-clip-text text-transparent">
                  {title}
                </h1>
                {subtitle ? (
                  <p className="truncate text-xs md:text-sm text-muted-foreground leading-tight">
                    {subtitle}
                  </p>
                ) : null}
              </>
            )}
          </div>

          {/* Right — theme + language + live indicator + user + logout */}
          <div className="flex items-center gap-1.5 justify-self-end">
            <div className="hidden md:inline-flex items-center gap-1.5">
              <LanguageSwitcher current={locale} compact />
              <ThemeToggle />
            </div>
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
        {/* Sidebar — glass panel with gradient accents top + bottom */}
        <aside className="relative sticky top-[74px] hidden h-[calc(100vh-74px)] w-60 shrink-0 flex-col overflow-y-auto bg-sidebar/70 backdrop-blur-md px-3 py-5 md:flex">
          {/* Left edge gradient border — subtle brand rail */}
          <div
            className="pointer-events-none absolute end-0 inset-y-0 w-px bg-gradient-to-b from-primary/20 via-primary/40 to-accent/20"
            aria-hidden
          />
          {/* Top-corner glow to match marketing aesthetic */}
          <div
            className="pointer-events-none absolute -top-8 -start-8 size-40 rounded-full bg-primary/10 blur-3xl"
            aria-hidden
          />

          <div className="relative">
            <SidebarNav items={nav} />
          </div>

          {/* Muhius Sunnah wordmark — premium gradient footer */}
          <div className="relative mt-auto pt-4">
            <div
              className="pointer-events-none mb-3 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
              aria-hidden
            />
            <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground/80">
              <span className="inline-flex size-6 items-center justify-center rounded-md bg-gradient-primary animate-gradient text-white font-bold text-[11px] shadow-sm shadow-primary/30">
                م
              </span>
              <span className="font-medium">
                Powered by{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-semibold">
                  Muhius Sunnah
                </span>
              </span>
            </div>
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
