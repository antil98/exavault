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
  const res = await fetch('/api/files/rename', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, newName }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || 'Rename failed');
  }
}

export async function moveFiles(ids: string[], targetFolderId: string) {
  const res = await fetch('/api/files/move', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids, targetFolderId }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || 'Move failed');
  }
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

export async function emptyTrash() {
  const res = await fetch('/api/empty-trash', {
    method: 'POST',
  });

  if (!res.ok) {
    throw new Error('Failed to empty trash');
  }
}
