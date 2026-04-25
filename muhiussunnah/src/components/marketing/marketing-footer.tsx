import Link from "next/link";
import { cookies } from "next/headers";
import { Mail, Phone, MapPin, ShieldCheck, Send } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { defaultLocale, isLocale, localeCookieName, type Locale } from "@/lib/i18n/config";
import { getMarketingCopy } from "@/lib/i18n/marketing";
import { Logo } from "./logo";
import { PaymentIcons } from "./payment-icons";

// Custom SVG social icons (lucide-react v1 removed brand icons)
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12z" />
    </svg>
  );
}
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

export async function MarketingFooter() {
  const jar = await cookies();
  const cookieLocale = jar.get(localeCookieName)?.value;
  const locale: Locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;
  const t = getMarketingCopy(locale);
  const tf = await getTranslations("footer");

  // Colorful by default — each icon keeps its brand color always visible
  const socials = [
    { icon: FacebookIcon, label: "Facebook", href: "#", bg: "bg-[#1877F2]", text: "text-white" },
    { icon: InstagramIcon, label: "Instagram", href: "#", bg: "bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5]", text: "text-white" },
    { icon: XIcon, label: "X (Twitter)", href: "#", bg: "bg-black", text: "text-white" },
    { icon: YouTubeIcon, label: "YouTube", href: "#", bg: "bg-[#FF0000]", text: "text-white" },
    { icon: WhatsAppIcon, label: "WhatsApp", href: "https://wa.me/8801767682381", bg: "bg-[#25D366]", text: "text-white" },
    { icon: Send, label: "Telegram", href: "#", bg: "bg-[#0088CC]", text: "text-white" },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-border/40 bg-gradient-to-b from-background via-muted/10 to-background">
      {/* Background mesh */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute top-0 start-1/4 size-96 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 end-1/4 size-96 rounded-full bg-accent/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 py-16 md:px-8 md:py-20">
        {/* Top grid — 4 cols */}
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr_1fr_1.4fr]">
          {/* Brand col */}
          <div>
            <Link href="/" className="inline-flex items-center">
              <Logo size="lg" />
            </Link>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-sm">
              {t.footer.tagline}
            </p>

            {/* Contact — clickable */}
            <div className="mt-6 space-y-2.5 text-sm">
              <a
                href="mailto:muhiussunnah2026@gmail.com"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition group"
              >
                <Mail className="size-4 text-primary group-hover:scale-110 transition-transform shrink-0" />
                <span className="group-hover:underline underline-offset-4 break-all">muhiussunnah2026@gmail.com</span>
              </a>
              <a
                href="mailto:infoabubakar786@gmail.com"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition group"
              >
                <Mail className="size-4 text-primary group-hover:scale-110 transition-transform shrink-0" />
                <span className="group-hover:underline underline-offset-4 break-all">infoabubakar786@gmail.com</span>
              </a>
              <a
                href="tel:+8801767682381"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition group"
                dir="ltr"
              >
                <Phone className="size-4 text-primary group-hover:scale-110 transition-transform shrink-0" />
                <span className="group-hover:underline underline-offset-4 whitespace-nowrap">+880 1767-682381</span>
              </a>
              <a
                href="tel:+8801743656066"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition group"
                dir="ltr"
              >
                <Phone className="size-4 text-primary group-hover:scale-110 transition-transform shrink-0" />
                <span className="group-hover:underline underline-offset-4 whitespace-nowrap">+880 1743-656066</span>
              </a>
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-primary font-semibold">Office 1</span>
                    <div>Rasulpur Shahi Mosque, Dhaka, Jatrabari</div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-primary font-semibold">Office 2</span>
                    <div>Hasnabad, Bashundara River View, Keraniganj</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Socials — always colorful */}
            <div className="mt-6">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">{t.extras.followUs}</p>
              <div className="flex gap-2">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.label}
                    className={`flex size-9 items-center justify-center rounded-full shadow-md transition-all duration-300 hover:scale-110 hover:-translate-y-0.5 hover:shadow-xl ${s.bg} ${s.text}`}
                  >
                    <s.icon className="size-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider">{t.footer.product}</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/features" className="hover:text-primary transition">{t.nav.features}</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition">{t.nav.pricing}</Link></li>
              <li><Link href="/support" className="hover:text-primary transition">{t.extras.supportLabel}</Link></li>
              <li><Link href="/refund-policy" className="hover:text-primary transition">{t.extras.refundLabel}</Link></li>
              <li><Link href="/register-school" className="hover:text-primary transition">{t.nav.signup}</Link></li>
            </ul>
          </div>

          {/* Company + Legal */}
          <div>
            <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider">{t.footer.company}</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition">{t.nav.about}</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition">{t.nav.contact}</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition">{t.footer.privacy}</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition">{t.footer.terms}</Link></li>
            </ul>
          </div>

          {/* Secure Payment */}
          <div>
            <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider">Secure Payment</h3>
            <div className="rounded-xl border border-success/30 bg-gradient-to-br from-success/10 to-success/5 p-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-success/20 text-success">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-success font-semibold">Guaranteed</div>
                  <div className="font-bold">Secure Payment</div>
                  <p className="text-xs text-muted-foreground mt-1">{tf("no_hidden_fees")}</p>
                </div>
              </div>
            </div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">{t.extras.weAccept}</p>
            <PaymentIcons />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <span>{t.footer.copyright}</span>
            <span className="text-muted-foreground/50">·</span>
            <span>
              Made with <span className="text-destructive">❤</span> by{" "}
              <a
                href="https://www.facebook.com/bandamustaqeem"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-primary hover:underline underline-offset-4"
              >
                Mustaqeem Billah
              </a>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-foreground transition">{t.footer.privacy}</Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-foreground transition">{t.footer.terms}</Link>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-success" />
              </span>
              {t.extras.allSystemsOperational}
            </span>
          </div>
        </div>

        {/* Powered by — centered, plain-text credit */}
        <div className="mt-4 pt-4 border-t border-border/30 text-center text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70">
          Powered by Growthency &amp; Anastechsolutions. All Rights Reserved by only Tazkiyah LTD.
        </div>
      </div>
    </footer>
  );
}
