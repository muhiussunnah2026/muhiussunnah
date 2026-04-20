/**
 * Admin dashboard loading skeleton.
 *
 * This file is the single biggest perceived-performance win in the whole
 * app. Next.js App Router wraps every child `page.tsx` in an implicit
 * <Suspense> whose fallback is this component — so the moment the user
 * clicks a sidebar link, the router replaces the old page with this
 * skeleton immediately (client-side navigation, no server round-trip).
 *
 * Without this file, the router blocks on the new page's server data
 * fetches and the browser appears frozen for 2–5 seconds. With it, the
 * shell + skeleton appear in ~50ms and real data streams in behind.
 *
 * Keep this component cheap: no data fetching, no heavy components, no
 * client JS. Pure server-rendered CSS.
 */
export default function AdminLoading() {
  return (
    <div className="p-6 md:p-8 space-y-6 animate-pulse">
      {/* Page title + primary action */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-64 rounded-md bg-muted" />
          <div className="h-4 w-96 rounded bg-muted/70" />
        </div>
        <div className="h-10 w-32 rounded-lg bg-muted shrink-0" />
      </div>

      {/* Metric strip */}
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

      {/* Content table */}
      <div className="rounded-2xl border border-border/60 bg-card/50 overflow-hidden">
        <div className="border-b border-border/40 p-4 flex items-center gap-3">
          <div className="h-8 w-40 rounded-md bg-muted" />
          <div className="ms-auto flex gap-2">
            <div className="h-8 w-24 rounded bg-muted" />
            <div className="h-8 w-8 rounded bg-muted" />
          </div>
        </div>
        <div className="divide-y divide-border/30">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="p-4 flex items-center gap-4">
              <div className="size-9 rounded-full bg-muted shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 rounded bg-muted/80" />
                <div className="h-3 w-1/2 rounded bg-muted/60" />
              </div>
              <div className="h-6 w-16 rounded-full bg-muted/70 hidden sm:block" />
              <div className="h-6 w-20 rounded bg-muted/70 hidden md:block" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
