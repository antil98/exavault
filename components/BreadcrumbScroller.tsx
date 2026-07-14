'use client';

import { useEffect, useRef, type ReactNode } from 'react';

export default function BreadcrumbScroller({
  children,
  scrollKey,
}: {
  children: ReactNode;
  scrollKey: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroller = scrollerRef.current;

    if (!scroller) return;

    scroller.scrollLeft = scroller.scrollWidth;
  }, [scrollKey]);

  return (
    <div ref={scrollerRef} className="max-w-full overflow-x-hidden pb-1">
      {children}
    </div>
  );
}
