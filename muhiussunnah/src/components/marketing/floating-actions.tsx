"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

const WHATSAPP_NUMBER = "8801767682381";
const WHATSAPP_MSG = encodeURIComponent(
  "Hello Muhius Sunnah team — আমি আপনাদের সফটওয়্যার সম্পর্কে জানতে চাই।",
);

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

/**
 * FloatingActions — two fixed buttons:
 *   • Bottom-start (left in LTR, right in RTL): WhatsApp chat in brand green.
 *   • Bottom-end (right in LTR, left in RTL): Scroll-to-top with circular
 *     progress ring that fills as the user scrolls the page. Raised above
 *     the PWA install prompt so it never collides with it.
 */
export function FloatingActions() {
  const [showTop, setShowTop] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      const pct = scrollable > 0 ? Math.min(1, Math.max(0, scrollTop / scrollable)) : 0;
      setProgress(pct);
      setShowTop(scrollTop > 300);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Progress ring geometry
  const size = 52;          // px — outer SVG box
  const stroke = 3;         // ring thickness
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <>
      {/* WhatsApp — start/left side */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="group fixed bottom-24 start-6 z-[60] flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl shadow-[#25D366]/40 transition-all duration-300 hover:scale-110 hover:shadow-[#25D366]/60"
      >
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-40" aria-hidden />
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-glow-pulse opacity-60" aria-hidden />
        <WhatsAppGlyph className="relative z-10 size-7" />

        {/* Tooltip */}
        <span className="pointer-events-none absolute start-full ms-3 whitespace-nowrap rounded-lg bg-foreground text-background px-3 py-1.5 text-xs font-medium opacity-0 shadow-xl transition-opacity duration-300 group-hover:opacity-100">
          💬 Chat on WhatsApp
        </span>
      </a>

      {/* Scroll to top — end/right side, raised above PWA install prompt */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label={`Scroll to top (${Math.round(progress * 100)}% read)`}
        className={`group fixed bottom-24 end-6 z-[60] flex size-[52px] items-center justify-center rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-110 ${
          showTop ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        {/* Progress track */}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="absolute inset-0 -rotate-90 text-border/60"
          aria-hidden
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={stroke}
            fill="none"
          />
        </svg>
        {/* Progress fill */}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="absolute inset-0 -rotate-90 text-primary"
          aria-hidden
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 120ms linear" }}
          />
        </svg>

        {/* Inner button pill */}
        <span className="relative flex size-10 items-center justify-center rounded-full bg-gradient-primary animate-gradient text-white shadow-xl shadow-primary/40 group-hover:shadow-primary/60 transition-shadow">
          <ArrowUp className="size-5 transition-transform group-hover:-translate-y-0.5" />
        </span>
      </button>
    </>
  );
}
