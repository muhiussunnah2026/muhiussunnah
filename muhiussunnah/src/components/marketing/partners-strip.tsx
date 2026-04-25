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
 * Cards are intentionally non-clickable per product: this block is a
 * trust / credibility signal, not a navigation hub.
 *
 * Logos are inline SVGs styled to mirror each partner's real mark
 * (Growthency = ascending bars, Anastechsolutions = triangular peaks,
 * Polli Hut = leaf monogram, Digitechub = tech node). When real logo
 * files arrive, swap the SVG component for next/image.
 */

function GrowthencyMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden>
      {/* Three ascending bars suggesting growth */}
      <rect x="14" y="40" width="8" height="14" rx="1.5" fill="currentColor" opacity="0.7" />
      <rect x="28" y="30" width="8" height="24" rx="1.5" fill="currentColor" opacity="0.85" />
      <rect x="42" y="18" width="8" height="36" rx="1.5" fill="currentColor" />
      {/* Trend line */}
      <path
        d="M14 38 L28 28 L42 16"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      />
    </svg>
  );
}

function AnastechMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden>
      {/* Stylised triangular A with inset cut */}
      <path
        d="M32 12 L52 50 L42 50 L32 30 L22 50 L12 50 Z"
        fill="currentColor"
      />
      <path d="M26 38 L38 38 L36 42 L28 42 Z" fill="white" opacity="0.9" />
    </svg>
  );
}

function PolliHutMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden>
      {/* Stylised leaf with stem */}
      <path
        d="M32 12 C 22 14, 14 24, 16 36 C 18 44, 28 50, 38 48 C 50 46, 52 32, 48 24 C 44 16, 38 12, 32 12 Z"
        fill="currentColor"
      />
      <path
        d="M28 26 C 32 26, 36 30, 36 36"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
      />
      {/* Stem */}
      <rect x="30" y="48" width="4" height="6" rx="2" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

function DigitechubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden>
      {/* Central node + radiating connectors — tech hub */}
      <circle cx="32" cy="32" r="6" fill="currentColor" />
      <circle cx="14" cy="14" r="3.5" fill="currentColor" opacity="0.8" />
      <circle cx="50" cy="14" r="3.5" fill="currentColor" opacity="0.8" />
      <circle cx="14" cy="50" r="3.5" fill="currentColor" opacity="0.8" />
      <circle cx="50" cy="50" r="3.5" fill="currentColor" opacity="0.8" />
      <path
        d="M14 14 L32 32 M50 14 L32 32 M14 50 L32 32 M50 50 L32 32"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

type Partner = {
  name: string;
  /** Tailwind gradient classes for the logo tile background. */
  gradient: string;
  /** Tagline shown under the name — keeps the card from feeling empty. */
  tagline: string;
  /** Inline SVG mark component. */
  Mark: React.ComponentType<{ className?: string }>;
};

const PARTNERS: Partner[] = [
  {
    name: "Growthency",
    gradient: "from-sky-500 via-blue-500 to-cyan-400",
    tagline: "Strategic engineering · growth partner",
    Mark: GrowthencyMark,
  },
  {
    name: "Anastechsolutions",
    gradient: "from-rose-500 via-red-500 to-orange-400",
    tagline: "Tech solutions · custom builds",
    Mark: AnastechMark,
  },
  {
    name: "পল্লীহাট · Polli Hut",
    gradient: "from-green-500 via-emerald-500 to-lime-400",
    tagline: "Community commerce · rural growth",
    Mark: PolliHutMark,
  },
  {
    name: "Digitechub",
    gradient: "from-violet-500 via-purple-500 to-fuchsia-400",
    tagline: "Digital services hub",
    Mark: DigitechubMark,
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

        {/* Partner cards — non-interactive trust signals */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PARTNERS.map((p) => (
            <div
              key={p.name}
              className="group relative h-full overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10"
            >
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
                  <p.Mark className="size-9" />
                </div>

                {/* Name */}
                <h3 className="mt-4 text-center text-base font-semibold">{p.name}</h3>

                {/* Tagline */}
                <p className="mt-1.5 text-center text-xs text-muted-foreground leading-relaxed">
                  {p.tagline}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Future-partners hint */}
        <p className="mt-10 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground/70">
          + আরো অংশীদার যুক্ত হবে শীঘ্রই · More partners joining soon
        </p>
      </div>
    </section>
  );
}
