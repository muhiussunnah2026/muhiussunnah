import Link from "next/link";
import { cookies } from "next/headers";
import { Globe, Send, Video, Mail } from "lucide-react";
import { defaultLocale, isLocale, localeCookieName, type Locale } from "@/lib/i18n/config";
import { getMarketingCopy } from "@/lib/i18n/marketing";

export async function MarketingFooter() {
  const jar = await cookies();
  const cookieLocale = jar.get(localeCookieName)?.value;
  const locale: Locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;
  const t = getMarketingCopy(locale);

  return (
    <footer className="border-t border-border/40 bg-muted/20 mt-20">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 md:px-8 md:py-16">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-3">
              <span className="inline-flex size-9 items-center justify-center rounded-xl bg-gradient-primary font-bold text-white">শ</span>
              <span className="text-lg font-bold">Shikkha</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm">{t.footer.tagline}</p>
            <div className="mt-4 flex gap-3">
              <a href="#" className="text-muted-foreground hover:text-primary transition" aria-label="Website"><Globe className="size-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-primary transition" aria-label="Telegram"><Send className="size-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-primary transition" aria-label="Video"><Video className="size-5" /></a>
              <a href="mailto:hello@shikkha.app" className="text-muted-foreground hover:text-primary transition" aria-label="Email"><Mail className="size-5" /></a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">{t.footer.product}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/features" className="hover:text-foreground transition">{t.nav.features}</Link></li>
              <li><Link href="/pricing" className="hover:text-foreground transition">{t.nav.pricing}</Link></li>
              <li><Link href="/login" className="hover:text-foreground transition">{t.nav.login}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">{t.footer.company} · {t.footer.legal}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-foreground transition">{t.nav.about}</Link></li>
              <li><Link href="/contact" className="hover:text-foreground transition">{t.nav.contact}</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground transition">{t.footer.privacy}</Link></li>
              <li><Link href="/terms" className="hover:text-foreground transition">{t.footer.terms}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/40 text-center text-xs text-muted-foreground">
          {t.footer.copyright}
        </div>
      </div>
    </footer>
  );
}
