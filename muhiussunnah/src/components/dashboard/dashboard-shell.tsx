import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { TrustBadge } from "@/components/ui/trust-badge";
import { LiveIndicator } from "@/components/ui/live-indicator";
import { LanguageSwitcher } from "@/components/marketing/language-switcher";
import { ThemeToggle } from "@/components/marketing/theme-toggle";
import { defaultLocale, isLocale, localeCookieName, type Locale } from "@/lib/i18n/config";
import { SidebarProvider } from "./sidebar-state";
import { SidebarToggle } from "./sidebar-toggle";
import { SidebarShell } from "./sidebar-shell";
import { UserMenu } from "./user-menu";

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
  /** User's profile photo URL (from membership.photo_url). */
  userPhotoUrl?: string | null;
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
  userPhotoUrl,
  children,
}: Props) {
  const jar = await cookies();
  const cookieLocale = jar.get(localeCookieName)?.value;
  const locale: Locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;

  // Build the visible header lines.
  const visibleFields = (headerFields ?? []).filter(
    (f) => typeof f.value === "string" && f.value.trim().length > 0,
  );
  const primary = visibleFields.find((f) => f.emphasis !== "secondary");
  const secondary = visibleFields.filter((f) => f !== primary);

  // Partition secondary fields into semantic groups so the header reads
  // like a real letterhead:
  //   Line 1..N: alternate-language names (each on own line)
  //   Line N+1: Address (full width)
  //   Line N+2: Phone + Email (grouped)
  //   Line N+3: Website (last, centered)
  const nameKeys = new Set(["name_en", "name_ar"]);
  const nameLines = secondary.filter((f) => nameKeys.has(f.key));
  const addressField = secondary.find((f) => f.key === "address");
  const phoneField = secondary.find((f) => f.key === "phone");
  const emailField = secondary.find((f) => f.key === "email");
  const websiteField = secondary.find((f) => f.key === "website");

  return (
    <SidebarProvider>
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
        <div className="relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-4 py-3.5 md:px-6">
          {/* Left — hamburger toggle + institution logo */}
          <div className="flex items-center gap-3 justify-self-start">
            <SidebarToggle />
          <Link href="/" className="group/brand flex items-center gap-3">
            <span className="relative inline-flex size-16 items-center justify-center overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 via-background to-accent/15 shadow-lg shadow-primary/15 transition-all group-hover/brand:scale-105 group-hover/brand:shadow-primary/25">
              {/* Rotating gradient halo on hover */}
              <span
                className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-tr from-primary/0 via-primary/20 to-accent/0 opacity-0 transition-opacity duration-500 group-hover/brand:opacity-100"
                aria-hidden
              />
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt="Institution logo"
                  width={64}
                  height={64}
                  className="relative size-full object-contain"
                  unoptimized
                />
              ) : (
                <span className="relative text-3xl font-extrabold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
                  م
                </span>
              )}
            </span>
          </Link>
          </div>

          {/* Center — institution identity, letterhead-style stacking:
              [big name] / [name_en] / [name_ar] / [address] / [phone · email] / [website] */}
          <div className="min-w-0 text-center justify-self-center w-full">
            {visibleFields.length > 0 ? (
              <>
                {primary ? (
                  <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-extrabold tracking-tight leading-[1.15] bg-gradient-to-r from-foreground via-foreground to-primary/90 bg-clip-text text-transparent truncate">
                    {primary.value}
                  </h1>
                ) : null}

                {/* Alternate-language names — each on its own line, medium weight */}
                {nameLines.map((f) => (
                  <p
                    key={f.key}
                    className="mt-0.5 text-[11px] md:text-xs lg:text-sm font-semibold text-foreground/80 leading-snug truncate"
                    dir={f.key === "name_ar" ? "rtl" : undefined}
                  >
                    {f.value}
                  </p>
                ))}

                {/* Address — own line, full-width text */}
                {addressField ? (
                  <p className="mt-1 text-[11px] md:text-xs text-muted-foreground leading-snug break-words">
                    <span className="font-semibold text-foreground/70">Address:</span>{" "}
                    {addressField.value}
                  </p>
                ) : null}

                {/* Phone + Email on the same line */}
                {(phoneField || emailField) ? (
                  <p className="mt-0.5 text-[11px] md:text-xs text-muted-foreground leading-snug break-words">
                    {phoneField ? (
                      <>
                        <span className="font-semibold text-foreground/70">Phone:</span>{" "}
                        {phoneField.value}
                      </>
                    ) : null}
                    {phoneField && emailField ? (
                      <span className="mx-2 text-muted-foreground/40" aria-hidden>
                        ·
                      </span>
                    ) : null}
                    {emailField ? (
                      <>
                        <span className="font-semibold text-foreground/70">Email:</span>{" "}
                        <span className="break-all">{emailField.value}</span>
                      </>
                    ) : null}
                  </p>
                ) : null}

                {/* Website — last, centered on its own line */}
                {websiteField ? (
                  <p className="mt-0.5 text-[11px] md:text-xs text-muted-foreground leading-snug break-words">
                    <span className="font-semibold text-foreground/70">Website:</span>{" "}
                    <span className="break-all">{websiteField.value}</span>
                  </p>
                ) : null}
              </>
            ) : (
              <>
                <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-extrabold tracking-tight leading-[1.15] bg-gradient-to-r from-foreground via-foreground to-primary/90 bg-clip-text text-transparent truncate">
                  {title}
                </h1>
                {subtitle ? (
                  <p className="mt-1 text-xs md:text-sm text-muted-foreground leading-snug truncate">
                    {subtitle}
                  </p>
                ) : null}
              </>
            )}
          </div>

          {/* Right — theme + language + live indicator + user avatar menu */}
          <div className="flex items-center gap-1.5 justify-self-end">
            <div className="hidden md:inline-flex items-center gap-1.5">
              <LanguageSwitcher current={locale} compact />
              <ThemeToggle />
            </div>
            <LiveIndicator />
            <UserMenu
              name={typeof userLabel === "string" ? userLabel : null}
              photoUrl={userPhotoUrl}
            />
          </div>
        </div>
      </header>

      <div className="relative flex flex-1">
        <SidebarShell items={nav} />

        {/* Content */}
        <main className="relative min-w-0 flex-1 p-4 md:p-8">
          {children}
          <div className="mt-10">
            <TrustBadge variant="footer" />
          </div>
        </main>
      </div>
    </div>
    </SidebarProvider>
  );
}
