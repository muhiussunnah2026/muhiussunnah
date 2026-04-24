/**
 * Streaming skeleton — lets the sidebar + page header render the
 * instant you click into /students, while the student list loads
 * in the background.
 */
export default function StudentsLoading() {
  return (
    <>
      <div className="mb-6 flex flex-col gap-2">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted/60" />
        <div className="h-4 w-64 animate-pulse rounded-md bg-muted/40" />
      </div>

      <div className="mb-4 flex items-center gap-2">
        <div className="h-10 flex-1 animate-pulse rounded-md bg-muted/50" />
        <div className="h-10 w-32 animate-pulse rounded-md bg-muted/50" />
      </div>

      <div className="rounded-xl border border-border/60 bg-card">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 border-b border-border/40 px-4 py-3 last:border-b-0"
          >
            <div className="size-10 animate-pulse rounded-full bg-muted/60" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-40 animate-pulse rounded-md bg-muted/50" />
              <div className="h-3 w-24 animate-pulse rounded-md bg-muted/40" />
            </div>
            <div className="h-6 w-16 animate-pulse rounded-md bg-muted/40" />
          </div>
        ))}
      </div>
    </>
  );
}
