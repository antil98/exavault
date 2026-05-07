import { sql } from './db';
import { FileItem } from '@/types/file-type';

export async function uploadFile({
  url,
  pathname,
  parentId,
  size,
  name,
  ownerId,
}: {
  url: string;
  pathname: string;
  parentId: string | null;
  size: number;
  name: string;
  ownerId: string;
}) {
  await sql`
    INSERT INTO files (
      name,
      parent_id,
      owner_id,
      is_dir,
      url,
      pathname,
      size
    )
    VALUES (
      ${name},
      ${parentId},
      ${ownerId},
      false,
      ${url},
      ${pathname},
      ${size}
    )
  `;
}

export async function getFilesByParent({
  parentId,
  ownerId,
}: {
  parentId: string | null;
  ownerId: string;
}): Promise<FileItem[]> {
  const result = parentId
    ? await sql`
        SELECT * FROM files
        WHERE parent_id = ${parentId}
        AND owner_id = ${ownerId}
        ORDER BY created_at DESC
      `
    : await sql`
        SELECT * FROM files
        WHERE parent_id IS NULL
        AND owner_id = ${ownerId}
        ORDER BY is_dir DESC, created_at DESC
      `;

  return result as FileItem[];
}
