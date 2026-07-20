'use client';

import { Skeleton } from '@/components/ui/skeleton';

export default function DesktopFileListSkeleton() {
  return (
    <div className="hidden overflow-x-auto md:block">
      {/* Header */}
      <div
        className="
          grid min-w-[590px]
          grid-cols-[15px_minmax(0,1fr)_100px_90px_150px_40px]
          gap-4 border-b px-3 py-2
        "
      >
        <div />
        <Skeleton className="h-5 w-24 self-center" />
        <Skeleton className="h-5 w-14 self-center" />
        <Skeleton className="h-5 w-12 self-center" />
        <Skeleton className="h-5 w-28 self-center" />
        <div />
      </div>

      {Array.from({ length: 8 }).map((_, i) => (
        <SkeletonRow key={i} index={i} />
      ))}
    </div>
  );
}

function SkeletonRow({ index }: { index: number }) {
  const nameWidths = [
    'w-52',
    'w-40',
    'w-64',
    'w-36',
    'w-48',
    'w-56',
    'w-44',
    'w-60',
  ];

  return (
    <div
      className="
        grid min-w-[590px]
        grid-cols-[15px_minmax(0,1fr)_100px_90px_150px_40px]
        items-center gap-4
        border-b border-border
        px-3 py-3
      "
      style={{ minHeight: '72.8px' }}
    >
      {/* checkbox */}
      <Skeleton className="size-4 rounded-sm" />

      {/* icon + filename */}
      <div className="flex min-w-0 items-center gap-3">
        <Skeleton className="size-6 shrink-0 rounded-md" />
        <Skeleton
          className={`h-5 ${nameWidths[index % nameWidths.length]}`}
        />
      </div>

      {/* type */}
      <Skeleton className="h-4 w-16" />

      {/* size */}
      <Skeleton className="h-4 w-12" />

      {/* date */}
      <Skeleton className="h-4 w-24" />

      {/* menu button */}
      <div className="flex justify-end">
        <Skeleton className="size-6 rounded-full" />
      </div>
    </div>
  );
}