'use client';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import getPaginationItems from '@/lib/get-pagination-items';
import { usePathname, useSearchParams } from 'next/navigation';

export default function FilePagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPage = Math.max(1, totalPages);

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const pages = getPaginationItems(currentPage, lastPage);

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={createPageURL(Math.max(1, currentPage - 1))}
            isDisabled={currentPage === 1}
          />
        </PaginationItem>

        {pages.map((item, idx) => {
          if (item === 'ellipsis') {
            return (
              <PaginationItem key={`e-${idx}`}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }

          return (
            <PaginationItem key={item}>
              <PaginationLink
                href={createPageURL(item)}
                isActive={item === currentPage}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          );
        })}
        <PaginationItem>
          <PaginationNext
            href={createPageURL(Math.min(lastPage, currentPage + 1))}
            isDisabled={currentPage >= lastPage}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
