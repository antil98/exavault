'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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
import MoveDialog from '@/components/MoveDialog';
import { Trash2, Download, Move, RotateCcw, LoaderCircle } from 'lucide-react';
import {
  downloadFiles,
  trashFiles,
  restoreFiles,
  deleteForever,
} from '@/lib/file-actions';

export default function BulkActions({
  fileViewPage,
  ids,
}: {
  fileViewPage: 'files' | 'trash';
  ids: string[];
}) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [busyAction, setBusyAction] = useState<
    'download' | 'trash' | 'restore' | 'delete' | null
  >(null);
  const router = useRouter();
  const hasSelection = ids.length > 0;

  async function handleZipDownload() {
    if (!hasSelection || busyAction) return;

    setBusyAction('download');
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
    } finally {
      setBusyAction(null);
    }
  }

  async function handleTrash() {
    if (!hasSelection || busyAction) return;

    setBusyAction('trash');
    const toastId = toast.loading('Moving file(s) to trash...');

    try {
      await trashFiles(ids);
      toast.success('File(s) moved to trash', { id: toastId });
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error('Failed to move file(s) to trash', { id: toastId });
    } finally {
      setBusyAction(null);
    }
  }

  async function handleRestore() {
    if (!hasSelection || busyAction) return;

    setBusyAction('restore');
    const toastId = toast.loading('Restoring file(s)...');

    try {
      await restoreFiles(ids);
      toast.success('File(s) restored', { id: toastId });
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error('Failed to restore file(s)', { id: toastId });
    } finally {
      setBusyAction(null);
    }
  }

  async function handleDeleteForever() {
    if (!hasSelection || busyAction) return;

    setBusyAction('delete');
    const toastId = toast.loading('Deleting permanently...');

    try {
      await deleteForever(ids);

      toast.success('Deleted permanently', { id: toastId });
      setDeleteDialogOpen(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error('Delete failed', { id: toastId });
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <>
      {fileViewPage === 'files' ? (
        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            title="Download selected files"
            aria-label="Download selected files"
            disabled={!hasSelection || !!busyAction}
            onClick={handleZipDownload}
          >
            {busyAction === 'download' ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <Download />
            )}
            <span className="hidden lg:inline">Download</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            title="Move selected files"
            aria-label="Move selected files"
            disabled={!hasSelection || !!busyAction}
            onClick={() => setMoveDialogOpen(true)}
          >
            <Move />
            <span className="hidden lg:inline">Move to...</span>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            title="Move selected files to trash"
            aria-label="Move selected files to trash"
            disabled={!hasSelection || !!busyAction}
            onClick={handleTrash}
          >
            {busyAction === 'trash' ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <Trash2 />
            )}
            <span className="hidden lg:inline">Move to trash</span>
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            title="Restore selected files"
            aria-label="Restore selected files"
            disabled={!hasSelection || !!busyAction}
            onClick={handleRestore}
          >
            {busyAction === 'restore' ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <RotateCcw />
            )}
            <span className="hidden lg:inline">Restore file(s)</span>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            title="Delete selected files permanently"
            aria-label="Delete selected files permanently"
            disabled={!hasSelection || !!busyAction}
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 />
            <span className="hidden lg:inline">Delete permanently</span>
          </Button>
        </div>
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
            <AlertDialogCancel disabled={busyAction === 'delete'}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={busyAction === 'delete'}
              onClick={handleDeleteForever}
            >
              {busyAction === 'delete' ? 'Deleting...' : 'Continue'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <MoveDialog
        open={moveDialogOpen}
        onOpenChange={setMoveDialogOpen}
        ids={ids}
      />
    </>
  );
}
