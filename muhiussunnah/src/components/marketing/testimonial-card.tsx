import { Star, Quote } from "lucide-react";

/* eslint-disable @next/next/no-img-element */

/**
 * TestimonialCard — elegant floating quote card for the marquee row.
 * Uses DiceBear Notionists to give each person a premium, consistent,
 * illustrated avatar (free CDN, no API key, instant SVG).
 */
export function TestimonialCard({
  quote,
  author,
  role,
  school,
  avatarSeed,
}: {
  quote: string;
  author: string;
  role: string;
  school: string;
  avatarSeed: string;
}) {
  const avatarUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(avatarSeed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&radius=50`;

  return (
    <div className="group relative w-[360px] md:w-[420px] shrink-0 overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-6 backdrop-blur-sm shadow-lg transition-all duration-500 hover:shadow-2xl hover:border-primary/40 hover:-translate-y-1">
      {/* subtle gradient on hover */}
      <div
        className="pointer-events-none absolute -end-12 -top-12 size-36 rounded-full bg-gradient-primary opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-25"
        aria-hidden
      />
      <div className="relative">
        <Quote className="absolute top-0 end-0 size-8 text-primary/20" />
        <div className="flex gap-0.5 mb-3 text-warning">
          {[0, 1, 2, 3, 4].map((s) => (
            <Star key={s} className="size-3.5 fill-current" />
          ))}
        </div>
        <p className="text-sm leading-relaxed mb-5 line-clamp-4 whitespace-normal">&ldquo;{quote}&rdquo;</p>
        <div className="flex items-center gap-3 pt-4 border-t border-border/40">
          <img
            src={avatarUrl}
            alt={author}
            width={44}
            height={44}
            className="size-11 shrink-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 shadow-md ring-2 ring-border/40"
            loading="lazy"
          />
          <div className="min-w-0">
            <div className="font-semibold text-sm truncate">{author}</div>
            <div className="text-xs text-muted-foreground truncate">{role} · {school}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
