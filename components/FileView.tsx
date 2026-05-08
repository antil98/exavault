'use client';

import { use } from 'react';
import { useSelection } from '@/hooks/useSelection';
import { Separator } from '@/components/ui/separator';
import { FileItem } from '@/types/file-type';
import FileActionsMenu from './FileActionsMenu';
import Link from 'next/link';
import { 
  Folder, 
  File
} from 'lucide-react';

export default function FileView({filesPromise, fileViewPage}: {filesPromise: Promise<FileItem[]>, fileViewPage: 'default' | 'trashed'}) {
  const { state, select } = useSelection();

  const files = use(filesPromise);
  const orderedIds = files.map((f) => f.id);

  const selectedIds = Array.from(state.selectedIds);

  if (!files.length) {
    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Files</h2>
        <p className="text-gray-600">The folder is empty!</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">{fileViewPage === 'default' ? 'Files' : 'Trashed Files'}</h2>
      <ul>
        {files.map((file, i) => (
          <div key={file.id}>
            <FileActionsMenu
              menuType="context" 
              fileViewPage={fileViewPage} 
              ids={selectedIds}
            >
              <li
                title={file.name}
                onClick={(e) => {
                  if (e.shiftKey) {
                    select(file.id, 'shift', orderedIds);
                  } else if (e.ctrlKey || e.metaKey) {
                    select(file.id, 'ctrl', orderedIds);
                  } else {
                    select(file.id, 'click', orderedIds);
                  }
                }}
                onContextMenu={() => select(file.id, 'right', orderedIds)}
                className={`
                flex items-center justify-between p-3 transition
                hover:bg-muted/50
                select-none
                ${state.selectedIds.has(file.id) ? 'bg-muted' : ''}
              `}
              >
                <div className="flex items-center gap-3">
                  {file.is_dir ? <Folder /> : <File />}

                  <Link
                    href={
                      file.is_dir ? `/drive/${file.id}` : file.url
                    }
                    target={file.is_dir ? '_self' : '_blank'}
                    title={file.is_dir ? 'Open folder' : 'Preview file'}
                    className="text-sm font-medium hover:underline"
                  >
                    {file.name}
                  </Link>
                </div>

                <div className="grid grid-cols-[120px_100px_140px_auto] text-xs text-muted-foreground items-center">
                  <span>File/Type</span>
                  <span title="File size">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                  <span title="Created at">
                    {new Date(file.created_at).toLocaleDateString()}
                  </span>

                  <FileActionsMenu 
                    menuType="dropdown"
                    fileViewPage={fileViewPage}
                    ids={selectedIds}
                    onSelectItem={() => select(file.id, 'click', orderedIds)}
                  />
                </div>
              </li>
            </FileActionsMenu>

            {i !== files.length - 1 && <Separator />}
          </div>
        ))}
      </ul>
    </div>
  );
}
