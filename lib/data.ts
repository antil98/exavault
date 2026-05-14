import { sql } from '@/lib/db';
import { FileItem } from '@/types/file-type';
import { getUniqueName } from './utils';

export const ROOT_FOLDER_ID = '2bcecc5f-089b-42b7-91fe-307ff392dea2';

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

export async function getFoldersByParent(
  parentId: string | null,
  ownerId: string,
): Promise<FileItem[]> {
  const result = parentId
    ? await sql`
        SELECT *
        FROM files
        WHERE parent_id = ${parentId}
        AND owner_id = ${ownerId}
        AND is_dir = true
        AND is_trashed = false
        ORDER BY name ASC
      `
    : await sql`
        SELECT *
        FROM files
        WHERE parent_id IS NULL
        AND owner_id = ${ownerId}
        AND is_dir = true
        AND is_trashed = false
        ORDER BY name ASC
      `;

  return result as FileItem[];
}

export async function nameExistsInFolder({
  name,
  parentId,
  ownerId,
  excludeId,
}: {
  name: string;
  parentId: string | null;
  ownerId: string;
  excludeId?: string;
}) {
  let result;

  if (parentId && excludeId) {
    result = await sql`
        SELECT id
        FROM files
        WHERE parent_id = ${parentId}
        AND owner_id = ${ownerId}
        AND lower(name) = lower(${name})
        AND id <> ${excludeId}
        LIMIT 1
      `;
  } else if (parentId) {
    result = await sql`
        SELECT id
        FROM files
        WHERE parent_id = ${parentId}
        AND owner_id = ${ownerId}
        AND lower(name) = lower(${name})
        LIMIT 1
      `;
  } else if (excludeId) {
    result = await sql`
        SELECT id
        FROM files
        WHERE parent_id IS NULL
        AND owner_id = ${ownerId}
        AND lower(name) = lower(${name})
        AND id <> ${excludeId}
        LIMIT 1
      `;
  } else {
    result = await sql`
        SELECT id
        FROM files
        WHERE parent_id IS NULL
        AND owner_id = ${ownerId}
        AND lower(name) = lower(${name})
        LIMIT 1
      `;
  }

  return result.length > 0;
}

export async function nameExistsForOwner({
  name,
  ownerId,
  excludeId,
}: {
  name: string;
  ownerId: string;
  excludeId?: string;
}) {
  const result = excludeId
    ? await sql`
        SELECT id
        FROM files
        WHERE owner_id = ${ownerId}
        AND lower(name) = lower(${name})
        AND id <> ${excludeId}
        LIMIT 1
      `
    : await sql`
        SELECT id
        FROM files
        WHERE owner_id = ${ownerId}
        AND lower(name) = lower(${name})
        LIMIT 1
      `;

  return result.length > 0;
}

export async function renameFile({
  id,
  newName,
  ownerId,
}: {
  id: string;
  newName: string;
  ownerId: string;
}) {
  const file = await getFileById(id, ownerId);

  if (!file) {
    return { ok: false as const, status: 404, message: 'File not found' };
  }

  const trimmedName = newName.trim();

  if (!trimmedName) {
    return { ok: false as const, status: 400, message: 'Invalid name' };
  }

  // Rename uses a global owner-level conflict check because the UI now treats
  // file names as unique across the whole account, not just inside one folder.
  const hasConflict = await nameExistsForOwner({
    name: trimmedName,
    ownerId,
    excludeId: id,
  });

  if (hasConflict) {
    return {
      ok: false as const,
      status: 409,
      message: 'A file or folder with that name already exists',
    };
  }

  await sql`
    UPDATE files
    SET name = ${trimmedName}
    WHERE id = ${id}
    AND owner_id = ${ownerId}
  `;

  return { ok: true as const };
}

export async function isDescendantFolder({
  folderId,
  possibleDescendantId,
  ownerId,
}: {
  folderId: string;
  possibleDescendantId: string;
  ownerId: string;
}) {
  const result = await sql`
    WITH RECURSIVE descendants AS (
      SELECT id
      FROM files
      WHERE parent_id = ${folderId}
      AND owner_id = ${ownerId}
      AND is_dir = true

      UNION ALL

      SELECT f.id
      FROM files f
      INNER JOIN descendants d
        ON f.parent_id = d.id
      WHERE f.owner_id = ${ownerId}
      AND f.is_dir = true
    )
    SELECT id
    FROM descendants
    WHERE id = ${possibleDescendantId}
    LIMIT 1
  `;

  return result.length > 0;
}

export async function moveFiles({
  ids,
  targetFolderId,
  ownerId,
}: {
  ids: string[];
  targetFolderId: string;
  ownerId: string;
}) {
  const target = await getFileById(targetFolderId, ownerId);

  if (!target || !target.is_dir || target.is_trashed) {
    return { ok: false as const, status: 400, message: 'Invalid destination' };
  }

  const items = await sql`
    SELECT *
    FROM files
    WHERE id = ANY(${ids})
    AND owner_id = ${ownerId}
    AND is_trashed = false
  `;

  if (items.length !== ids.length) {
    return { ok: false as const, status: 404, message: 'File not found' };
  }

  const movingNames = new Set<string>();

  for (const item of items as FileItem[]) {
    const normalizedName = item.name.toLowerCase();

    if (movingNames.has(normalizedName)) {
      return {
        ok: false as const,
        status: 409,
        message: 'Two selected items have the same name',
      };
    }

    movingNames.add(normalizedName);

    if (item.id === targetFolderId) {
      return {
        ok: false as const,
        status: 400,
        message: 'A folder cannot be moved into itself',
      };
    }

    if (item.is_dir) {
      const movingIntoDescendant = await isDescendantFolder({
        folderId: item.id,
        possibleDescendantId: targetFolderId,
        ownerId,
      });

      if (movingIntoDescendant) {
        return {
          ok: false as const,
          status: 400,
          message: 'A folder cannot be moved into one of its own subfolders',
        };
      }
    }

    // Moving follows the same strict duplicate-name rule as rename so users do
    // not accidentally hide an existing file behind an auto-generated suffix.
    const hasConflict = await nameExistsInFolder({
      name: item.name,
      parentId: targetFolderId,
      ownerId,
      excludeId: item.id,
    });

    if (hasConflict) {
      return {
        ok: false as const,
        status: 409,
        message: `"${item.name}" already exists in the destination folder`,
      };
    }
  }

  await sql`
    UPDATE files
    SET parent_id = ${targetFolderId}
    WHERE id = ANY(${ids})
    AND owner_id = ${ownerId}
  `;

  return { ok: true as const };
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
        THEN ${ROOT_FOLDER_ID}
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
        THEN ${ROOT_FOLDER_ID}
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
