import { sql } from '@/lib/db';
import { FileItem } from '@/types/file-type';
import { getUniqueName } from './utils';

export async function getFiles(parentId: string | null, ownerId: string) {
  return await sql`
    SELECT name
    FROM files
    WHERE parent_id = ${parentId}
    AND owner_id = ${ownerId}
  `;
}

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
  const existingFile = await getFiles(parentId, ownerId);
  const existingNames = existingFile.map((file) => file.name);
  const finalName = getUniqueName(name, existingNames);

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
      ${finalName},
      ${parentId},
      ${ownerId},
      false,
      ${url},
      ${pathname},
      ${size}
    )
  `;
}

export async function getFilesByParent(
  parentId: string | null,
  ownerId: string,
): Promise<FileItem[]> {
  const result = parentId
    ? await sql`
        SELECT * FROM files
        WHERE parent_id = ${parentId}
        AND owner_id = ${ownerId}
        AND is_trashed = false
        ORDER BY is_dir DESC, name DESC
      `
    : await sql`
        SELECT * FROM files
        WHERE parent_id IS NULL
        AND owner_id = ${ownerId}
        AND is_trashed = false
        ORDER BY is_dir DESC, name DESC
      `;

  return result as FileItem[];
}

export async function getFilesById(
  ids: string[],
  ownerId: string,
): Promise<FileItem[]> {
  const result = await sql`
    WITH RECURSIVE tree AS (
      SELECT *, ARRAY[id] AS path
      FROM files
      WHERE id = ANY(${ids})
      AND owner_id = ${ownerId}

      UNION ALL

      SELECT f.*, t.path || f.id
      FROM files f
      INNER JOIN tree t 
        ON f.parent_id = t.id
      WHERE t.is_dir = true
      AND f.owner_id = ${ownerId}
      AND NOT f.id = ANY(t.path)
    )
    SELECT * FROM tree;
  `;

  return result as FileItem[];
}

export async function trashFiles(
  ids: string[],
  ownerId: string,
  isTrashed = true,
) {
  await sql`
    UPDATE files
    SET is_trashed = ${isTrashed}
    WHERE owner_id = ${ownerId}
    AND id = ANY(${ids})
  `;
}

export async function getTrashedFiles(
  parentId: string | null,
  ownerId: string,
): Promise<FileItem[]> {
  const result = await sql`
    SELECT 
      f.*,
      p.is_trashed AS parent_is_trashed,
      CASE 
        WHEN p.is_trashed = false THEN NULL
        ELSE f.parent_id
      END AS trash_parent_group
    FROM files f
    LEFT JOIN files p ON f.parent_id = p.id
    WHERE f.owner_id = ${ownerId}
    AND f.is_trashed = true
  `;

  return result as FileItem[];
}

export async function deleteForever(ids: string[], ownerId: string) {
  await sql`
    DELETE FROM files
    WHERE id = ANY(${ids})
    AND owner_id = ${ownerId}
  `;
}
