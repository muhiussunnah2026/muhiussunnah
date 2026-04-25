import { Handshake } from "lucide-react";

/**
 * Partners strip — affiliate / promotion partners block.
 *
 * Sits above the pricing section on the landing page. Each card
 * highlights one partner with their brand color + logo mark + name.
 * The partner list is intentionally hard-coded for now so a) the
 * order is curated, and b) adding a new partner is a one-line edit
 * here (no DB / CMS overhead for a small list).
 *
 * Future-proof: when the list grows past ~6 entries, swap to a
 * marquee scroll like the existing "trusted by" strip.
 */

type Partner = {
  name: string;
  /** Two-letter monogram shown inside the logo tile when no SVG. */
  initials: string;
  /** Tailwind gradient classes for the logo tile background. */
  gradient: string;
  /** Tagline shown under the name — keeps the card from feeling empty. */
  tagline: string;
  href?: string;
};

const PARTNERS: Partner[] = [
  {
    name: "Growthency",
    initials: "GR",
    gradient: "from-sky-500 via-blue-500 to-cyan-400",
    tagline: "Strategic engineering · growth partner",
    href: "https://growthency.com",
  },
  {
    name: "Anastechsolutions",
    initials: "AT",
    gradient: "from-rose-500 via-red-500 to-orange-400",
    tagline: "Tech solutions · custom builds",
    href: "https://anastechsolutions.com",
  },
  {
    name: "পল্লীহাট · Polli Hut",
    initials: "পহ",
    gradient: "from-green-500 via-emerald-500 to-lime-400",
    tagline: "Community commerce · rural growth",
  },
  {
    name: "Digitechub",
    initials: "DH",
    gradient: "from-violet-500 via-purple-500 to-fuchsia-400",
    tagline: "Digital services hub",
  },
];

type Props = {
  /** Heading line — "সামনে এগিয়ে চলার সাথী" / "Our partners in progress". */
  title: string;
  /** Subtext describing the affiliate-partnership invitation. */
  subtitle: string;
  /** Eyebrow label above the title. */
  eyebrow: string;
};

export function PartnersStrip({ title, subtitle, eyebrow }: Props) {
  return (
    <section className="relative overflow-hidden py-20 md:py-24">
      {/* Decorative corner orbs */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -top-10 start-[10%] size-72 rounded-full bg-primary/10 blur-[110px]" />
        <div className="absolute bottom-0 end-[10%] size-72 rounded-full bg-accent/10 blur-[110px]" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 md:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary backdrop-blur-md">
            <Handshake className="size-3.5" />
            {eyebrow}
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            {title}
          </h2>
          <p className="mt-4 text-base text-muted-foreground md:text-lg">{subtitle}</p>
        </div>

        {/* Partner cards */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PARTNERS.map((p) => {
            const Card = (
              <div className="group relative h-full overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10">
                {/* Gradient sheen on hover */}
                <span
                  aria-hidden
                  className={`pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-gradient-to-br ${p.gradient}`}
                  style={{ filter: "blur(40px)", opacity: 0.08 }}
                />

                <div className="relative">
                  {/* Logo tile */}
                  <div
                    className={`mx-auto flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br ${p.gradient} text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}
                  >
                    <span className="text-lg font-bold tracking-tight">{p.initials}</span>
                  </div>

                  {/* Name */}
                  <h3 className="mt-4 text-center text-base font-semibold">{p.name}</h3>

                  {/* Tagline */}
                  <p className="mt-1.5 text-center text-xs text-muted-foreground leading-relaxed">
                    {p.tagline}
                  </p>
                </div>
              </div>
            );
            return p.href ? (
              <a key={p.name} href={p.href} target="_blank" rel="noreferrer" className="block">
                {Card}
              </a>
            ) : (
              <div key={p.name}>{Card}</div>
            );
          })}
        </div>

        {/* Future-partners hint */}
        <p className="mt-10 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground/70">
          + আরো অংশীদার যুক্ত হবে শীঘ্রই · More partners joining soon
        </p>
      </div>
    </section>
  );
}
