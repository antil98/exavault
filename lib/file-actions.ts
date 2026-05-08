export async function downloadFiles(ids: string[]) {
  const res = await fetch('/api/download', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!res.ok) throw new Error('Download failed');

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;

  const disposition = res.headers.get('Content-Disposition');
  const match = disposition?.match(/filename="(.+)"/);
  a.download = match ? match[1] : 'download';

  a.click();
  URL.revokeObjectURL(url);
}

export async function renameFile(id: string, newName: string) {
  await fetch('/api/files/rename', {
    method: 'POST',
    body: JSON.stringify({ id, newName }),
  });
}

export async function moveFiles(ids: string[], targetFolderId: string) {
  await fetch('/api/files/move', {
    method: 'POST',
    body: JSON.stringify({ ids, targetFolderId }),
  });
}

export async function trashFiles(ids: string[]) {
  const res = await fetch('/api/trash', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ids }),
  });

  if (!res.ok) {
    throw new Error('Failed to delete files');
  }
}

export async function restoreFiles(ids: string[]) {
  const res = await fetch('/api/restore', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ids }),
  });

  if (!res.ok) {
    throw new Error('Failed to restore files');
  }
}

export async function deleteForever(ids: string[]) {
  const res = await fetch('/api/delete-forever', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ids }),
  });

  if (!res.ok) {
    throw new Error('Failed to delete permanently');
  }
}