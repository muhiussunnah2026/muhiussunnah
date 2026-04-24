export default function ClassesLoading() {
  return (
    <>
      <div className="mb-6 flex flex-col gap-2">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-muted/60" />
        <div className="h-4 w-56 animate-pulse rounded-md bg-muted/40" />
      </div>

      <div className="mb-4 flex items-center gap-2">
        <div className="h-10 flex-1 animate-pulse rounded-md bg-muted/50" />
        <div className="h-10 w-32 animate-pulse rounded-md bg-muted/50" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-xl border border-border/60 bg-card"
          />
        ))}
      </div>
    </>
  );
}
