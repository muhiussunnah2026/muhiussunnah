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
      {/* Subtle static gradient wash — cheaper than the double-blur aurora
          we used earlier. Heavy blur() on huge elements hits the GPU on
          every scroll/navigation and is the single biggest cost for low-end
          devices. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-primary/5 via-accent/5 to-transparent"
        aria-hidden
      />

      {/* Header — institution identity is the hero. Lightweight
          backdrop-blur-sm is plenty visually; backdrop-blur-xl was a
          noticeable scroll-cost on phones.

          Layout: 3 equal-width columns so the center content truly lives
          in the geometric middle regardless of how much lives on the two
          sides. Side columns justify to their edges. */}
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/90 backdrop-blur-sm shadow-sm shadow-primary/5">
        <div className="grid grid-cols-3 items-center gap-4 px-4 py-3.5 md:px-6">
          {/* Left — institution logo */}
          <Link href="/" className="group/brand flex items-center gap-3 justify-self-start">
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

          {/* Center — composed institution identity */}
          <div className="min-w-0 text-center justify-self-center w-full">
            {visibleFields.length > 0 ? (
              <>
                {primary ? (
                  <h1 className="truncate text-lg font-extrabold tracking-tight leading-tight md:text-2xl lg:text-3xl">
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
                <h1 className="truncate text-lg font-extrabold tracking-tight leading-tight md:text-2xl lg:text-3xl">
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
        {/* Sidebar */}
        <aside className="sticky top-[74px] hidden h-[calc(100vh-74px)] w-60 shrink-0 flex-col overflow-y-auto border-e border-border/50 bg-sidebar/60 backdrop-blur-sm px-3 py-5 md:flex">
          <SidebarNav items={nav} />

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
