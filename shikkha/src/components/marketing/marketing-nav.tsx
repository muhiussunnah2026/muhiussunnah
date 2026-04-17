import Link from "next/link";
import { cookies } from "next/headers";
import { buttonVariants } from "@/components/ui/button";
import { defaultLocale, isLocale, localeCookieName, type Locale } from "@/lib/i18n/config";
import { getMarketingCopy } from "@/lib/i18n/marketing";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";

export async function MarketingNav() {
  const jar = await cookies();
  const cookieLocale = jar.get(localeCookieName)?.value;
  const locale: Locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;
  const t = getMarketingCopy(locale);

  return (
    <header className="sticky top-0 z-30 border-b border-border/40 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-4 py-3 md:px-8 md:py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="relative inline-flex size-9 items-center justify-center rounded-xl bg-gradient-primary animate-gradient font-bold text-white shadow-md">
            <span className="relative z-10 text-lg">শ</span>
            <span className="absolute inset-0 rounded-xl bg-white/20 blur-md" aria-hidden />
          </span>
          <span className="text-lg font-bold tracking-tight">Shikkha</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/features" className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground">
            {t.nav.features}
          </Link>
          <Link href="/pricing" className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground">
            {t.nav.pricing}
          </Link>
          <Link href="/about" className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground">
            {t.nav.about}
          </Link>
          <Link href="/contact" className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground">
            {t.nav.contact}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher current={locale} compact />
          <ThemeToggle />
          <Link
            href="/login"
            className={buttonVariants({ variant: "ghost", size: "sm" }) + " hidden sm:inline-flex"}
          >
            {t.nav.login}
          </Link>
          <Link
            href="/register-school"
            className={buttonVariants({ size: "sm" }) + " bg-gradient-primary text-white hover:opacity-90 shadow-md"}
          >
            {t.nav.signup}
          </Link>
        </div>
      </div>
    </header>
  );
}
