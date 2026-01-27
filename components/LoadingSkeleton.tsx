export function LoadingSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-slate-200 rounded w-1/2"></div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="h-12 bg-slate-100 rounded-lg"></div>
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl bg-white p-6 border-2 border-indigo-100">
      <div className="h-6 bg-slate-200 rounded w-2/3 mb-4"></div>
      <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-slate-200 rounded w-5/6"></div>
    </div>
  );
}
