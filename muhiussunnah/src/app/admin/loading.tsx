/**
 * Admin dashboard loading state.
 *
 * Shown instantly by Next.js App Router the moment a user clicks a
 * sidebar link — before the RSC for the target page finishes fetching.
 *
 * Design intent:
 *   • A clearly-visible centered spinner + label so users know the page
 *     IS loading (users don't always recognize shimmer skeletons as a
 *     loading state — "sada dekhacche" is a common complaint).
 *   • A faint skeleton grid behind the spinner so the page doesn't feel
 *     empty on slower connections where the spinner alone looks lonely.
 *   • Zero client JS, zero data fetching — pure server-rendered CSS.
 */
export default function AdminLoading() {
  return (
    <div className="relative min-h-[60vh]">
      {/* Faint skeleton backdrop — low-opacity so the spinner stands out */}
      <div className="p-6 md:p-8 space-y-6 opacity-40 animate-pulse">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="h-7 w-64 rounded-md bg-muted" />
            <div className="h-4 w-96 rounded bg-muted/70" />
          </div>
          <div className="h-10 w-32 rounded-lg bg-muted shrink-0" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-border/60 bg-card/50 p-4 space-y-2"
            >
              <div className="h-3 w-20 rounded bg-muted/70" />
              <div className="h-7 w-24 rounded bg-muted" />
              <div className="h-3 w-32 rounded bg-muted/60" />
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-border/60 bg-card/50 overflow-hidden">
          <div className="border-b border-border/40 p-4 h-14" />
          <div className="divide-y divide-border/30">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-4 flex items-center gap-4">
                <div className="size-9 rounded-full bg-muted shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 rounded bg-muted/80" />
                  <div className="h-3 w-1/2 rounded bg-muted/60" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Centered spinner + label (floats on top of the skeleton) */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-md px-8 py-6 shadow-2xl shadow-primary/10">
          {/* Dual-ring gradient spinner — CSS-only, hardware-accelerated */}
          <div className="relative size-12">
            <div
              className="absolute inset-0 rounded-full border-[3px] border-primary/25 border-t-primary animate-spin"
              style={{ animationDuration: "0.9s" }}
            />
            <div
              className="absolute inset-1.5 rounded-full border-[2px] border-accent/25 border-b-accent animate-spin"
              style={{
                animationDuration: "1.4s",
                animationDirection: "reverse",
              }}
            />
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <div className="text-sm font-semibold text-foreground">
              লোড হচ্ছে…
            </div>
            <div className="text-xs text-muted-foreground">
              একটু অপেক্ষা করুন
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
