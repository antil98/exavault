import { FileItem } from '@/types/file-type';

export default function buildFullPath(
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
