import { cn } from "@/lib/utils";

/**
 * TextReveal — word-by-word fade-and-rise.
 *
 * Previously a "use client" component that re-triggered on scroll via
 * IntersectionObserver. Hydrating this + every <Reveal> wrapper pushed
 * Total Blocking Time to 420ms on desktop Lighthouse.
 *
 * Now a pure Server Component: each word gets a CSS `reveal-word-in`
 * animation with an inline stagger delay. Zero JS, identical look.
 */
export function TextReveal({
  text,
  className,
  delayStep = 60,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  delayStep?: number;
  as?: "span" | "h1" | "h2" | "h3" | "p";
}) {
  const words = text.split(/(\s+)/);

  return (
    <Tag className={className}>
      {words.map((w, i) => {
        if (/^\s+$/.test(w)) {
          return <span key={i}>{w}</span>;
        }
        return (
          <span
            key={i}
            className="reveal-word-in inline-block"
            style={{ animationDelay: `${(i / 2) * delayStep}ms` }}
          >
            {w}
          </span>
        );
      })}
    </Tag>
  );
}
