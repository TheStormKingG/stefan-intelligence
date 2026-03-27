export function CardSkeleton() {
  return (
    <div className="card p-4 space-y-3 animate-fade-in">
      <div className="skeleton h-4 w-3/4 rounded" />
      <div className="skeleton h-3 w-1/2 rounded" />
    </div>
  );
}

export function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3 animate-fade-in">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="card p-4 flex items-center gap-3">
          <div className="skeleton w-2 h-2 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-4/5 rounded" />
            <div className="skeleton h-3 w-2/5 rounded" />
          </div>
          <div className="skeleton w-[22px] h-[22px] rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function MetricsSkeleton() {
  return (
    <div className="flex gap-3 animate-fade-in">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card p-3 flex-1 min-w-[90px] space-y-2">
          <div className="skeleton h-3 w-full rounded" />
          <div className="skeleton h-5 w-2/3 rounded" />
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="page-container space-y-6">
      <div className="space-y-2">
        <div className="skeleton h-7 w-48 rounded" />
        <div className="skeleton h-4 w-32 rounded" />
      </div>
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <ListSkeleton rows={4} />
    </div>
  );
}
