import { PageItem } from '@/types/pagination';

export default function getPaginationItems(current: number, total: number): PageItem[] {
  const items: PageItem[] = [];

  const add = (v: PageItem) => items.push(v);

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  add(1);

  if (start > 2) add('ellipsis');

  for (let i = start; i <= end; i++) {
    add(i);
  }

  if (end < total - 1) add('ellipsis');
  if (total > 1) add(total);

  return items;
}