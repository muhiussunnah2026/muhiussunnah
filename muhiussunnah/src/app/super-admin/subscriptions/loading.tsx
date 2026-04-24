export default function SubscriptionsLoading() {
  return (
    <>
      <div className="mb-6 flex flex-col gap-2">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted/60" />
        <div className="h-4 w-72 animate-pulse rounded-md bg-muted/40" />
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl border border-border/60 bg-card"
          />
        ))}
      </div>

      <div className="rounded-xl border border-border/60 bg-card">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 border-b border-border/40 px-4 py-3 last:border-b-0"
          >
            <div className="flex-1 space-y-2">
              <div className="h-3 w-48 animate-pulse rounded-md bg-muted/50" />
              <div className="h-3 w-24 animate-pulse rounded-md bg-muted/40" />
            </div>
            <div className="h-8 w-24 animate-pulse rounded-md bg-muted/50" />
          </div>
        ))}
      </div>
    </>
  );
}
