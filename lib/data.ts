import { sql } from '@/lib/db';
import { FileItem } from '@/types/file-type';
import getUniqueName from '@/lib/get-unique-name';

export async function createUserRootFolder(userId: string) {
  await sql`
    INSERT INTO files (
      name,
      parent_id,
      owner_id,
      is_dir
    )
    SELECT
      'root',
      NULL,
      ${userId},
      true
    WHERE NOT EXISTS (
      SELECT 1
      FROM files
      WHERE owner_id = ${userId}
        AND parent_id IS NULL
        AND is_dir = true
    )
  `;
}

export async function getUserRootFolder(userId: string) {
  return await sql`
    SELECT id
    FROM files
    WHERE owner_id = ${userId}
      AND parent_id IS NULL
      AND is_dir = true
    LIMIT 1
  `;
}

export async function getAllUserFiles(ownerId: string) {
  return await sql`
    SELECT *
    FROM files
    WHERE owner_id = ${ownerId}
  `;
}

export async function getAllFilesInFolder(
  parentId: string | null,
  ownerId: string,
) {
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

export async function getFilesByParent(
  parentId: string | null,
  ownerId: string,
  isTrashed: boolean,
  searchQuery: string = '',
  page: number = 1,
  pageSize: number = 20,
): Promise<FileItem[]> {
  // await new Promise((resolve) => setTimeout(resolve, 5000));

  const result = parentId
    ? await sql`
        SELECT * FROM files
        WHERE parent_id = ${parentId}
        AND owner_id = ${ownerId}
        AND is_trashed = ${isTrashed}
        AND lower(name) LIKE lower(${`%${searchQuery}%`})
        ORDER BY is_dir DESC, created_at DESC
        LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}
      `
    : await sql`
        SELECT * FROM files
        WHERE parent_id IS NULL
        AND owner_id = ${ownerId}
        AND is_trashed = ${isTrashed}
        AND lower(name) LIKE lower(${`%${searchQuery}%`})
        ORDER BY is_dir DESC, created_at DESC
        LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}
      `;

  return result as FileItem[];
}

export async function getTrashedFiles(ownerId: string): Promise<FileItem[]> {
  const result = await sql`
    SELECT *
    FROM files
    WHERE owner_id = ${ownerId}
    AND is_trashed = true
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

export async function getFileLink(ids: string[]) {
  const result = await sql`
    SELECT url, is_dir
    FROM files
    WHERE id = ANY(${ids})
  `;

  return result as FileItem[];
}

export async function uploadFile({
  url,
  pathname,
  parentId,
  size,
  name,
  ownerId,
  fileType,
}: {
  url: string;
  pathname: string;
  parentId: string | null;
  size: number;
  name: string;
  ownerId: string;
  fileType: string;
}) {
  const existingFile = await getAllFilesInFolder(parentId, ownerId);
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
      size,
      file_type
    )
    VALUES (
      ${finalName},
      ${parentId},
      ${ownerId},
      false,
      ${url},
      ${pathname},
      ${size},
      ${fileType}
    )
  `;
}

export async function createFolder({
  name,
  parentId,
  ownerId,
}: {
  name: string;
  parentId: string | null;
  ownerId: string;
}) {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return { ok: false as const, message: 'Invalid folder name' };
  }

  const existing = await sql`
    SELECT name
    FROM files
    WHERE parent_id = ${parentId}
    AND owner_id = ${ownerId}
    AND is_dir = true
  `;

  const existingNames = existing.map((file) => file.name);
  const finalName = getUniqueName(trimmedName, existingNames);

  await sql`
    INSERT INTO files (
      name,
      parent_id,
      owner_id,
      is_dir
    )
    VALUES (
      ${finalName},
      ${parentId},
      ${ownerId},
      true
    )
  `;

  return { ok: true as const };
}

export async function getFoldersByParent(
  parentId: string | null,
  ownerId: string,
  searchQuery: string = '',
): Promise<FileItem[]> {
  const result = parentId
    ? await sql`
        SELECT *
        FROM files
        WHERE parent_id = ${parentId}
        AND owner_id = ${ownerId}
        AND is_dir = true
        AND is_trashed = false
        AND lower(name) LIKE lower(${`%${searchQuery}%`})
        ORDER BY name ASC
      `
    : await sql`
        SELECT *
        FROM files
        WHERE parent_id IS NULL
        AND owner_id = ${ownerId}
        AND is_dir = true
        AND is_trashed = false
        AND lower(name) LIKE lower(${`%${searchQuery}%`})
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

  const originalDotIndex = file.name.lastIndexOf('.');
  const originalExtension =
    !file.is_dir && originalDotIndex > 0
      ? file.name.slice(originalDotIndex)
      : '';
  const newDotIndex = trimmedName.lastIndexOf('.');
  const newBaseName =
    !file.is_dir && newDotIndex > 0
      ? trimmedName.slice(0, newDotIndex).trim()
      : trimmedName;
  const finalName = file.is_dir
    ? trimmedName
    : `${newBaseName}${originalExtension}`;

  if (!file.is_dir && !newBaseName) {
    return { ok: false as const, status: 400, message: 'Invalid name' };
  }

  const hasConflict = await nameExistsForOwner({
    name: finalName,
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
    SET name = ${finalName}
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

export async function trashFiles(ids: string[], ownerId: string) {
  const rootFolderId = await getUserRootFolder(ownerId);

  await sql`
    UPDATE files AS f
    SET
      is_trashed = true,
      original_location = f.parent_id,
      deleted_at = NOW(),
      parent_id = CASE
        WHEN p.is_trashed = false
          AND NOT (p.id = ANY(${ids}))
        THEN ${rootFolderId[0].id}
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
    WITH root_folder AS (
      SELECT id
      FROM files
      WHERE owner_id = ${ownerId}
        AND parent_id IS NULL
        AND is_dir = true
      LIMIT 1
    ),
    restore_targets AS (
      SELECT
        f.id,
        CASE
          WHEN original_parent.id IS NULL
            OR (
              original_parent.is_trashed = true
              AND NOT (original_parent.id = ANY(${ids}))
            )
          THEN root_folder.id
          ELSE f.original_location
        END AS target_parent_id
      FROM files AS f
      CROSS JOIN root_folder
      LEFT JOIN files AS original_parent
        ON original_parent.id = f.original_location
        AND original_parent.owner_id = ${ownerId}
      WHERE f.owner_id = ${ownerId}
        AND f.id = ANY(${ids})
    )
    UPDATE files AS f
    SET
      is_trashed = false,
      parent_id = restore_targets.target_parent_id,
      original_location = restore_targets.target_parent_id
    FROM restore_targets
    WHERE f.owner_id = ${ownerId}
      AND f.id = restore_targets.id;
  `;
}

export async function deleteForever(ids: string[], ownerId: string) {
  await sql`
    DELETE FROM files
    WHERE id = ANY(${ids})
    AND owner_id = ${ownerId}
  `;
}

export async function getTotalPages(
  parentId: string | null,
  ownerId: string,
  isTrashed: boolean,
  searchQuery: string = '',
) {
  const result = parentId
    ? await sql`
        SELECT COUNT(*) AS count
        FROM files
        WHERE parent_id = ${parentId}
        AND owner_id = ${ownerId}
        AND is_trashed = ${isTrashed}
        AND lower(name) LIKE lower(${`%${searchQuery}%`})
      `
    : await sql`
        SELECT COUNT(*) AS count
        FROM files
        WHERE parent_id IS NULL
        AND owner_id = ${ownerId}
        AND is_trashed = ${isTrashed}
        AND lower(name) LIKE lower(${`%${searchQuery}%`})
      `;

  const totalCount = Number(result[0]?.count || 0);
  const pageSize = 20;
  return Math.ceil(totalCount / pageSize);
}
