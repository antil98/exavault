import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { FileItem } from '@/types/file-type';
import { PageItem } from '@/types/pagination';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getUniqueName(name: string, existing: string[]) {
  const dot = name.lastIndexOf('.');
  const base = dot !== -1 ? name.slice(0, dot) : name;
  const ext = dot !== -1 ? name.slice(dot) : '';

  let candidate = name;
  let i = 1;

  while (existing.includes(candidate)) {
    candidate = `${base} (${i})${ext}`;
    i++;
  }

  return candidate;
}

export function buildFullPath(
  item: FileItem,
  byId: Map<string, FileItem>,
  cache = new Map<string, string>(),
): string {
  if (cache.has(item.id)) {
    return cache.get(item.id)!;
  }

  if (!item.parent_id) {
    cache.set(item.id, item.name);
    return item.name;
  }

  const parent = byId.get(item.parent_id);

  if (!parent) {
    cache.set(item.id, item.name);
    return item.name;
  }

  const parentPath = buildFullPath(parent, byId, cache);
  const fullPath = `${parentPath}/${item.name}`;

  cache.set(item.id, fullPath);

  return fullPath;
}

export function getPaginationItems(current: number, total: number): PageItem[] {
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