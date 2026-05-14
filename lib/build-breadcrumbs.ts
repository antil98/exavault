'use server'

import { FileItem } from '@/types/file-type';
import { getFileById } from '@/lib/data';

export default async function getBreadcrumbs(
  currentId: string,
  ownerId: string,
): Promise<FileItem[]> {
  const crumbs: FileItem[] = [];

  let node = await getFileById(currentId, ownerId);

  while (node) {
    crumbs.push(node);

    if (!node.parent_id) break;

    node = await getFileById(node.parent_id, ownerId);
  }

  return crumbs.reverse();
}
