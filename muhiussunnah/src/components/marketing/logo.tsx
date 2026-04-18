import { cn } from "@/lib/utils";

/**
 * Muhius Sunnah brand logo — stylized "MS" monogram with Islamic-
 * geometric crescent motif inside a gradient rounded square.
 *
 * Usage:
 *   <Logo />                                   // icon + wordmark
 *   <Logo variant="icon" />                    // icon only
 *   <Logo variant="wordmark" />                // wordmark only
 *   <Logo size="lg" />                         // bigger
 */

type Props = {
  variant?: "full" | "icon" | "wordmark";
  size?: "sm" | "md" | "lg";
  className?: string;
  mono?: boolean; // force single color (for dark backgrounds)
};

const sizeMap = {
  sm: { mark: "size-7", text: "text-base" },
  md: { mark: "size-9", text: "text-lg" },
  lg: { mark: "size-12", text: "text-2xl" },
};

export function Logo({ variant = "full", size = "md", className, mono = false }: Props) {
  const s = sizeMap[size];

  const mark = (
    <span
      className={cn(
        "relative inline-flex items-center justify-center rounded-xl shadow-lg shadow-primary/20 overflow-hidden",
        mono ? "bg-foreground" : "bg-gradient-primary animate-gradient",
        s.mark,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 40 40" className="absolute inset-0 size-full">
        <defs>
          <linearGradient id="logo-shine" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0.3" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" fill="url(#logo-shine)" />
        {/* Subtle geometric pattern lines */}
        <circle cx="30" cy="10" r="14" fill="none" stroke="white" strokeOpacity="0.15" strokeWidth="0.5" />
        <circle cx="10" cy="30" r="14" fill="none" stroke="white" strokeOpacity="0.15" strokeWidth="0.5" />
      </svg>
      {/* "M" / book-page letterform — premium serif */}
      <span className="relative z-10 text-white font-bold" style={{ fontFamily: "'Hind Siliguri', system-ui", fontSize: size === "lg" ? "1.4rem" : size === "sm" ? "0.9rem" : "1.1rem" }}>
        م
      </span>
      {/* Highlight sheen */}
      <span className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" aria-hidden />
    </span>
  );

  const wordmark = (
    <span className={cn("leading-none font-semibold tracking-tight", s.text)}>
      Muhius <span className="font-black">Sunnah</span>
    </span>
  );

  if (variant === "icon") return <span className={className}>{mark}</span>;
  if (variant === "wordmark") return <span className={className}>{wordmark}</span>;

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {mark}
      {wordmark}
    </span>
  );
}
