export function LoadingSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="mb-2 h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700"></div>
      <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-700"></div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="h-12 rounded-lg bg-slate-100 dark:bg-slate-700"></div>
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border-2 border-indigo-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
      <div className="mb-4 h-6 w-2/3 rounded bg-slate-200 dark:bg-slate-700"></div>
      <div className="mb-2 h-4 w-full rounded bg-slate-200 dark:bg-slate-700"></div>
      <div className="h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-700"></div>
    </div>
  );
}

