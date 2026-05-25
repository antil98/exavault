'use server';

import { del } from '@vercel/blob';
import {
  createFolder as createFolderInDb,
  deleteForever as deleteForeverInDb,
  getFileTree,
  getTrashedFiles,
  moveFiles as moveFilesInDb,
  renameFile as renameFileInDb,
  restoreFiles as restoreFilesInDb,
  trashFiles as trashFilesInDb,
} from '@/lib/data';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

const { userId } = await auth();

export async function renameFileAction(id: string, newName: string) {
  if (!userId) {
    redirect('/sign-in');
  }

  if (!id || !newName.trim()) {
    return {
      ok: false as const,
      message: 'Invalid rename payload',
    };
  }

  const result = await renameFileInDb({ id, newName, ownerId: userId });

  if (!result.ok) {
    return {
      ok: false as const,
      message: result.message,
    };
  }

  return { ok: true as const };
}

export async function createFolderAction(
  name: string,
  parentId: string | null,
) {
  if (!userId) {
    redirect('/sign-in');
  }

  if (!name.trim()) {
    return {
      ok: false as const,
      message: 'Invalid folder name',
    };
  }

  const result = await createFolderInDb({ name, parentId, ownerId: userId });

  if (!result.ok) {
    return {
      ok: false as const,
      message: result.message,
    };
  }

  return { ok: true as const };
}

export async function moveFilesAction(ids: string[], targetFolderId: string) {
  if (!userId) {
    redirect('/sign-in');
  }

  if (!Array.isArray(ids) || !ids.length || !targetFolderId) {
    return {
      ok: false as const,
      message: 'Invalid move payload',
    };
  }

  const result = await moveFilesInDb({ ids, targetFolderId, ownerId: userId });

  if (!result.ok) {
    return {
      ok: false as const,
      message: result.message,
    };
  }

  return { ok: true as const };
}

export async function trashFilesAction(ids: string[]) {
  if (!userId) {
    redirect('/sign-in');
  }
  if (!Array.isArray(ids) || !ids.length) {
    return {
      ok: false as const,
      message: 'Invalid ids',
    };
  }

  const items = await getFileTree(ids, userId);
  const allIds = items.map((item) => item.id);

  await trashFilesInDb(allIds, userId);

  return { ok: true as const };
}

export async function restoreFilesAction(ids: string[]) {
  if (!userId) {
    redirect('/sign-in');
  }

  if (!Array.isArray(ids) || !ids.length) {
    return {
      ok: false as const,
      message: 'Invalid ids',
    };
  }

  const items = await getFileTree(ids, userId);
  const allIds = items.map((item) => item.id);

  await restoreFilesInDb(allIds, userId);

  return { ok: true as const };
}

export async function deleteForeverAction(ids: string[]) {
  if (!userId) {
    redirect('/sign-in');
  }

  if (!Array.isArray(ids) || !ids.length) {
    return {
      ok: false as const,
      message: 'Invalid ids',
    };
  }

  const items = await getFileTree(ids, userId);
  const allIds = items.map((item) => item.id);

  await Promise.all(
    items.map((item) => {
      if (!item.url) return Promise.resolve();
      return del(item.url);
    }),
  );

  await deleteForeverInDb(allIds, userId);

  return { ok: true as const };
}

export async function emptyTrashAction() {
  if (!userId) {
    redirect('/sign-in');
  }
  
  const items = await getTrashedFiles(userId);
  const ids = items.map((item) => item.id);

  if (!ids.length) {
    return { ok: true as const, deletedCount: 0 };
  }

  await Promise.all(
    items.map((item) => {
      if (item.is_dir || !item.url) return Promise.resolve();
      return del(item.url);
    }),
  );

  await deleteForeverInDb(ids, userId);

  return { ok: true as const, deletedCount: ids.length };
}
