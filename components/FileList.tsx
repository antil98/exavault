'use client';

import { use } from 'react';
import { useSelection } from '@/hooks/useSelection';
import { Separator } from '@/components/ui/separator';
import { FileItem } from '@/types/file-type';

export default function FileList({
  filesPromise,
  userId,
}: {
  filesPromise: Promise<FileItem[]>;
  userId: string;
}) {
  const { state, select } = useSelection();

  const files = use(filesPromise);
  const orderedIds = files.map((f) => f.id);

  if (!files.length) {
    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Files</h2>
        <p className="text-gray-600">No files uploaded yet.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Files</h2>

      <ul>
        {files.map((file, i) => (
          <div key={file.id}>
            <li
              onClick={(e) => {
                if (e.shiftKey) {
                  select(file.id, 'shift', orderedIds);
                } else if (e.ctrlKey || e.metaKey) {
                  select(file.id, 'ctrl', orderedIds);
                } else {
                  select(file.id, 'click', orderedIds);
                }
              }}
              className={`
                flex items-center justify-between p-3 transition
                hover:bg-muted/50 cursor-pointer
                ${state.selectedIds.has(file.id) ? 'bg-muted' : ''}
              `}
            >
              <div className="flex items-center gap-3">
                <img
                  src={file.is_dir ? '/icons/folder.svg' : '/icons/file.svg'}
                  className="w-5 h-5 opacity-80"
                />

                <a
                  href={file.is_dir ? `/${userId}/drive/${file.id}` : file.url}
                  className="text-sm font-medium hover:underline"
                >
                  {file.name}
                </a>
              </div>

              <div className="text-xs text-muted-foreground flex gap-4">
                <span>{(file.size / 1024).toFixed(1)} KB</span>
                <span>{new Date(file.created_at).toLocaleDateString()}</span>
              </div>
            </li>

            {i !== files.length - 1 && <Separator />}
          </div>
        ))}
      </ul>
    </div>
  );
}
