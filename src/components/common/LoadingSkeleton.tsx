export default function LoadingSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)]"
          />
        ))}
      </div>
      <div className="overflow-hidden rounded-2xl border border-[var(--border)]">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-16 animate-pulse border-b border-[var(--border)] bg-[var(--bg-elevated)] last:border-b-0"
            style={{ animationDelay: `${index * 80}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
