import { Skeleton } from '@/components/ui/skeleton';

export default function FileToolbarSkeleton() {
  return (
    <div className="my-2 flex w-full flex-col items-start gap-3 sm:py-0">
      <div className="min-h-9 flex w-full items-center">
        <Skeleton className="h-5 w-40" />
      </div>
      <Skeleton className="h-8 w-40 rounded-lg md:hidden" />
    </div>
  );
}
