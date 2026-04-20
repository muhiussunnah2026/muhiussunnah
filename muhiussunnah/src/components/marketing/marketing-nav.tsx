import Link from "next/link";
import { cookies } from "next/headers";
import { defaultLocale, isLocale, localeCookieName, type Locale } from "@/lib/i18n/config";
import { getMarketingCopy } from "@/lib/i18n/marketing";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";
import { NavShell } from "./nav-shell";
import { Logo } from "./logo";

/**
 * Resolve the best dashboard destination for a signed-in user, based on
 * their first active school_users membership + role. Returns null when
 * the user has no membership (e.g. super admin, brand-new state).
 */
async function resolveDashboardHref(userId: string): Promise<string | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = supabaseAdmin() as any;
    const { data } = await admin
      .from("school_users")
      .select("role, schools(slug)")
      .eq("user_id", userId)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();
    const slug = data?.schools?.slug as string | undefined;
    if (!slug) return null;
    const role = data?.role as string | undefined;
    if (role === "TEACHER") return `/teacher`;
    if (role === "STUDENT" || role === "GUARDIAN") return `/portal`;
    return `/admin`;
  } catch {
    return null;
  }
}

export async function MarketingNav() {
  const jar = await cookies();
  const cookieLocale = jar.get(localeCookieName)?.value;
  const locale: Locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;
  const t = getMarketingCopy(locale);

  // Detect signed-in user so we can replace Login/Sign-up with a Dashboard
  // link. The proxy redirects logged-in users away from /login and
  // /register-school anyway, so exposing those links creates a dead-end.
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let dashboardHref: string | null = null;
  if (user) {
    dashboardHref = (await resolveDashboardHref(user.id)) ?? "/";
  }

  return (
    <NavShell
      logo={
        <Link href="/" className="flex items-center">
          <Logo size="md" />
        </Link>
      }
      links={[
        { href: "/", label: t.nav.home },
        { href: "/features", label: t.nav.features },
        { href: "/pricing", label: t.nav.pricing },
        { href: "/about", label: t.nav.about },
        { href: "/contact", label: t.nav.contact },
      ]}
      leftControls={<LanguageSwitcher current={locale} compact />}
      themeToggle={<ThemeToggle />}
      loginHref={dashboardHref ?? "/login"}
      loginLabel={dashboardHref ? t.nav.dashboard : t.nav.login}
      signupHref={dashboardHref ?? "/register-school"}
      signupLabel={dashboardHref ? t.nav.dashboard : t.nav.signup}
      showSignupCta={!dashboardHref}
      isSignedIn={!!user}
    />
  );
}
