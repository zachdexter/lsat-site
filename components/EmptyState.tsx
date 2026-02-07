import Link from 'next/link';

type EmptyStateProps = {
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
};

export function EmptyState({ title, message, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="py-12 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
        <svg
          className="h-8 w-8 text-indigo-400"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="mb-2 text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mb-4 text-sm text-slate-500">{message}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

