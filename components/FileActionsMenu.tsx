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
  trashFiles,
  restoreFiles,
  deleteForever,
} from '@/lib/file-actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import RenameDialog from './RenameDialog';
import MoveDialog from './MoveDialog';

export default function FileActionsMenu({
  menuType,
  fileViewPage,
  ids,
  primaryId,
  primaryName,
  isPrimarySelected = false,
  children,
  onSelectItem,
}: {
  menuType: 'dropdown' | 'context';
  fileViewPage: 'files' | 'trash';
  ids: string[];
  primaryId?: string;
  primaryName?: string;
  isPrimarySelected?: boolean;
  children?: React.ReactNode;
  onSelectItem?: () => void;
}) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const router = useRouter();
  const effectiveIds =
    primaryId && (!isPrimarySelected || !ids.length) ? [primaryId] : ids;
  const canRename = fileViewPage === 'files' && effectiveIds.length === 1;

  async function handleZipDownload() {
    const zipToast = toast.loading(`Zipping ${effectiveIds.length} file(s)...`);

    try {
      await downloadFiles(effectiveIds);
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
    await trashFiles(effectiveIds);
    toast.success('File(s) moved to trash');
    router.refresh();
  }

  async function handleRestore() {
    await restoreFiles(effectiveIds);
    toast.success('File(s) restored');
    router.refresh();
  }

  async function handleDeleteForever() {
    const toastId = toast.loading('Deleting permanently...');

    try {
      await deleteForever(effectiveIds);

      toast.success('Deleted permanently', { id: toastId });
      router.refresh();
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
            <DropdownMenuContent className="w-fit">
              {fileViewPage === 'files' ? (
                <>
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleZipDownload}>
                      <Download />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={!canRename}
                      onClick={() => setRenameDialogOpen(true)}
                    >
                      <Pencil />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setMoveDialogOpen(true)}>
                      <Move />
                      Move to...
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleTrash}>
                      <Trash2 />
                      Move to trash
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </>
              ) : (
                <>
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleRestore}>
                      <RotateCcw />
                      Restore file(s)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)}>
                      <Trash2 />
                      Delete forever
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
          <ContextMenuContent className="w-fit">
            <ContextMenuGroup>
              <ContextMenuLabel>Options</ContextMenuLabel>
              <ContextMenuSeparator />
              {fileViewPage === 'files' ? (
                <>
                  <ContextMenuItem onClick={handleZipDownload}>
                    <Download />
                    Download
                  </ContextMenuItem>
                    <ContextMenuItem
                      disabled={!canRename}
                      onClick={() => setRenameDialogOpen(true)}
                    >
                      <Pencil />
                      Rename
                    </ContextMenuItem>
                  <ContextMenuItem onClick={() => setMoveDialogOpen(true)}>
                    <Move />
                    Move to...
                  </ContextMenuItem>
                  <ContextMenuItem onClick={handleTrash}>
                    <Trash2 />
                    Delete
                  </ContextMenuItem>
                </>
              ) : (
                <>
                  <ContextMenuItem onClick={handleRestore}>
                    <RotateCcw />
                    Restore file(s)
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => setDeleteDialogOpen(true)}>
                    <Trash2 />
                    Delete permanently
                  </ContextMenuItem>
                </>
              )}
            </ContextMenuGroup>
          </ContextMenuContent>
        </ContextMenu>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              The selected files will be permanently deleted from our servers.
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteForever}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <RenameDialog
        open={renameDialogOpen}
        onOpenChange={setRenameDialogOpen}
        id={canRename ? effectiveIds[0] : null}
        currentName={primaryName ?? ''}
      />

      <MoveDialog
        open={moveDialogOpen}
        onOpenChange={setMoveDialogOpen}
        ids={effectiveIds}
      />
    </>
  );
}
