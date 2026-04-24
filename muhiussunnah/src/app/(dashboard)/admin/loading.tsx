/**
 * Instant loading skeleton for the admin dashboard.
 *
 * /admin runs ~19 aggregate Supabase queries to build its metrics,
 * donut, and trend cards. Without a loading file, Next.js blocks the
 * browser on the full render — so every login / navigation to /admin
 * felt like a multi-second freeze on click.
 *
 * With this file Next streams the shell (sidebar + header + this
 * skeleton) the moment the request hits, then swaps in the real
 * content when the queries settle. Users see the dashboard outline
 * within 100-200ms instead of staring at a spinner or the old page.
 */
export default function AdminLoading() {
  const bar = (w: string) => (
    <div className={`h-3 rounded-md bg-muted/60 ${w}`} />
  );

  return (
    <>
      {/* Page header skeleton */}
      <div className="mb-6 flex flex-col gap-2">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-muted/60" />
        <div className="h-4 w-80 animate-pulse rounded-md bg-muted/40" />
      </div>

      {/* Period context strip skeleton */}
      <div className="mb-4 flex items-center gap-3 rounded-xl border border-border/60 bg-gradient-to-r from-primary/5 via-card to-accent/5 px-4 py-2.5">
        <div className="h-3 w-48 animate-pulse rounded-md bg-muted/50" />
        <div className="ms-auto h-8 w-36 animate-pulse rounded-md bg-muted/50" />
      </div>

      {/* Hero metric row — 4 cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              {bar("w-24")}
              <div className="size-8 animate-pulse rounded-lg bg-muted/60" />
            </div>
            <div className="h-8 w-20 animate-pulse rounded-md bg-muted/60" />
            {bar("w-32")}
          </div>
        ))}
      </div>

      {/* Class donut skeleton */}
      <div className="mt-8 h-80 animate-pulse rounded-xl border border-border/60 bg-card" />

      {/* Secondary sections */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-xl border border-border/60 bg-card"
          />
        ))}
      </div>
    </>
  );
}
