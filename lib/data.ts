import { sql } from '@/lib/db';
import { FileItem } from '@/types/file-type';
import { getUniqueName } from './utils';

export async function getAllFiles(parentId: string | null, ownerId: string) {
  return await sql`
    SELECT name
    FROM files
    WHERE parent_id = ${parentId}
    AND owner_id = ${ownerId}
  `;
}

export async function getFileById(id: string, ownerId: string) {
  const result = await sql`
    SELECT * FROM files
    WHERE id = ${id}
    AND owner_id = ${ownerId}
    LIMIT 1
  `;

  return result[0] as FileItem | undefined;
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
  const existingFile = await getAllFiles(parentId, ownerId);
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
  isTrashed: boolean = false,
): Promise<FileItem[]> {
  const result = parentId
    ? await sql`
        SELECT * FROM files
        WHERE parent_id = ${parentId}
        AND owner_id = ${ownerId}
        AND is_trashed = ${isTrashed}
        ORDER BY is_dir DESC, name DESC
      `
    : await sql`
        SELECT * FROM files
        WHERE parent_id IS NULL
        AND owner_id = ${ownerId}
        AND is_trashed = ${isTrashed}
        ORDER BY is_dir DESC, name DESC
      `;

  return result as FileItem[];
}

export async function getFileTree(
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

export async function trashFiles(ids: string[], ownerId: string) {
  await sql`
    UPDATE files AS f
    SET
      is_trashed = true,
      original_location = f.parent_id,
      parent_id = CASE
        WHEN p.is_trashed = false
          AND NOT (p.id = ANY(${ids}))
        THEN '2bcecc5f-089b-42b7-91fe-307ff392dea2'
        ELSE f.parent_id
      END
    FROM files AS p
    WHERE f.owner_id = ${ownerId}
      AND f.id = ANY(${ids})
      AND (
        f.parent_id = p.id
        OR f.parent_id IS NULL
      );
  `;
}

export async function restoreFiles(ids: string[], ownerId: string) {
  await sql`
    UPDATE files AS f
    SET
      is_trashed = false,
      parent_id = f.original_location,
      original_location = CASE
        WHEN p.is_trashed = true
          AND NOT (p.id = ANY(${ids}))
        THEN '2bcecc5f-089b-42b7-91fe-307ff392dea2'
        ELSE f.original_location
      END
    FROM files AS p
    WHERE f.owner_id = ${ownerId}
      AND f.id = ANY(${ids})
      AND (
        f.parent_id = p.id
        OR f.parent_id IS NULL
      );
  `;
}

export async function deleteForever(ids: string[], ownerId: string) {
  await sql`
    DELETE FROM files
    WHERE id = ANY(${ids})
    AND owner_id = ${ownerId}
  `;
}
