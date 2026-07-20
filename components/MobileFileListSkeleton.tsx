'use client';

import { Skeleton } from '@/components/ui/skeleton';

export default function MobileFileListSkeleton() {
  return (
    <div className="block space-y-1 md:hidden">
      {Array.from({ length: 8 }).map((_, i) => (
        <SkeletonCard key={i} index={i} />
      ))}
    </div>
  );
}

function SkeletonCard({ index }: { index: number }) {
  const widths = [
    'w-32',
    'w-44',
    'w-28',
    'w-52',
    'w-40',
    'w-36',
    'w-48',
    'w-56',
  ];

  return (
    <div
      className="
        flex items-center justify-between gap-3
        rounded-md
        bg-black/5 dark:bg-black/30
        pl-3 py-3
      "
    >
      <div className="flex min-w-0 items-center gap-3">
        {/* icon */}
        <Skeleton className="size-8 shrink-0 rounded-md" />

        <div className="flex min-w-0 flex-col">
          {/* filename */}
          <Skeleton
            className={`h-5 ${widths[index % widths.length]}`}
          />

          {/* metadata */}
          <div className="mt-1 flex min-w-0 flex-col sm:flex-row sm:gap-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="mt-1 h-4 w-10 sm:mt-0" />
            <Skeleton className="mt-1 h-4 w-24 sm:mt-0" />
          </div>
        </div>
      </div>

      {/* actions */}
      <Skeleton className="size-12 rounded-full shrink-0" />
    </div>
  );
}