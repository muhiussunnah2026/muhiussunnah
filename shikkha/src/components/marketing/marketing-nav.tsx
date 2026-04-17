import Link from "next/link";
import { cookies } from "next/headers";
import { defaultLocale, isLocale, localeCookieName, type Locale } from "@/lib/i18n/config";
import { getMarketingCopy } from "@/lib/i18n/marketing";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";
import { NavShell } from "./nav-shell";
import { Logo } from "./logo";

export async function MarketingNav() {
  const jar = await cookies();
  const cookieLocale = jar.get(localeCookieName)?.value;
  const locale: Locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;
  const t = getMarketingCopy(locale);

  return (
    <NavShell
      logo={
        <Link href="/" className="flex items-center">
          <Logo size="md" />
        </Link>
      }
      links={[
        { href: "/features", label: t.nav.features },
        { href: "/pricing", label: t.nav.pricing },
        { href: "/about", label: t.nav.about },
        { href: "/contact", label: t.nav.contact },
      ]}
      leftControls={<LanguageSwitcher current={locale} compact />}
      themeToggle={<ThemeToggle />}
      loginHref="/login"
      loginLabel={t.nav.login}
      signupHref="/register-school"
      signupLabel={t.nav.signup}
    />
  );
}
