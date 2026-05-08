'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  Trash2,
  Download,
  Pencil,
  Move,
  EllipsisVertical,
  RotateCcw,
} from 'lucide-react';
import {
  downloadFiles,
  renameFile,
  moveFiles,
  trashFiles,
  restoreFiles,
  deleteForever,
} from '@/lib/file-actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function FileActionsMenu({
  menuType,
  fileViewPage,
  ids,
  children,
  onSelectItem,
}: {
  menuType: 'dropdown' | 'context';
  fileViewPage: 'default' | 'trashed';
  ids: string[];
  children?: React.ReactNode;
  onSelectItem?: () => void;
}) {
  const router = useRouter();

  async function handleZipDownload() {
    const zipToast = toast.loading(`Zipping ${ids.length} file(s)...`);

    try {
      await downloadFiles(ids);
      toast.success('Download ready', {
        id: zipToast,
      });
    } catch (err) {
      console.error('ZIP failed:', err);

      toast.error('Failed to create ZIP', {
        id: zipToast,
      });
    }
  }

  async function handleTrash() {
    await trashFiles(ids);
    toast.success('File(s) moved to trash');
    router.refresh();
  }

  async function handleRestore() {
    await restoreFiles(ids);
    toast.success('File(s) restored');
    router.refresh();
  }

  async function handleDeleteForever() {
    const toastId = toast.loading('Deleting permanently...');

    try {
      await deleteForever(ids);

      toast.success('Deleted permanently', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Delete failed', { id: toastId });
    }
  }

  return (
    <>
      {menuType === 'dropdown' && (
        <div title="Options">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  className={'rounded-full w-10 h-10'}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectItem?.();
                  }}
                />
              }
            >
              <EllipsisVertical />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {fileViewPage === 'default' && (
                <>
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleZipDownload}>
                      <Download />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Pencil />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Move />
                      Move to...
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleTrash}>
                      <Trash2 />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </>
              )}

              {fileViewPage === 'trashed' && (
                <>
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleRestore}>
                      <RotateCcw />
                      Restore file(s)
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Trash2 />
                      Delete permanently
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {menuType === 'context' && (
        <ContextMenu>
          <ContextMenuTrigger>{children}</ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuGroup>
              <ContextMenuLabel>Options</ContextMenuLabel>
              <ContextMenuSeparator />
              {fileViewPage === 'default' && (
                <>
                  <ContextMenuItem onClick={handleZipDownload}>
                    <Download />
                    Download
                  </ContextMenuItem>
                  <ContextMenuItem disabled={ids.length > 1}>
                    <Pencil />
                    Rename
                  </ContextMenuItem>
                  <ContextMenuItem>
                    <Move />
                    Move to...
                  </ContextMenuItem>
                  <ContextMenuItem onClick={handleTrash}>
                    <Trash2 />
                    Delete
                  </ContextMenuItem>
                </>
              )}

              {fileViewPage === 'trashed' && (
                <>
                  <ContextMenuItem onClick={handleRestore}>
                    <RotateCcw />
                    Restore file(s)
                  </ContextMenuItem>
                  <ContextMenuItem onClick={handleDeleteForever}>
                    <Trash2 />
                    Delete permanently
                  </ContextMenuItem>
                </>
              )}
            </ContextMenuGroup>
          </ContextMenuContent>
        </ContextMenu>
      )}
    </>
  );
}
