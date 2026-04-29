export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-(--antarctica-line) ${className ?? ""}`}
      aria-hidden="true"
    />
  );
}

export function TextLineSkeleton({ lines = 3 }: { lines?: number }) {
  const widths = ["w-full", "w-4/5", "w-3/5"];

  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-3 ${widths[i % widths.length]}`} />
      ))}
    </div>
  );
}
