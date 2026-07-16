'use client';

import { use, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Info } from 'lucide-react';
import { toast } from 'sonner';
import { useSelection } from '@/hooks/useSelection';
import { FileItem } from '@/types/file-type';
import {
  deleteForeverAction,
  emptyTrashAction,
  trashFilesAction,
} from '@/app/actions/files';
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
import { Button } from '@/components/ui/button';
import DesktopFileList from '@/components/DesktopFileList';
import FileToolbar from '@/components/FileToolbar';
import MobileFileList from '@/components/MobileFileList';
import { SortDirection, SortKey } from '@/components/FileViewTypes';
import { useGlobalContext } from '@/app/context/global.context';

export default function FileView({
  filesPromise,
  fileViewPage,
  userRootFolder,
}: {
  filesPromise: Promise<FileItem[]>;
  fileViewPage: 'files' | 'trash';
  userRootFolder: string;
}) {
  const { state, select } = useSelection();
  const [keyboardDeleteOpen, setKeyboardDeleteOpen] = useState(false);
  const [keyboardDeleteIds, setKeyboardDeleteIds] = useState<string[]>([]);
  const [keyboardDeleting, setKeyboardDeleting] = useState(false);
  const [emptyTrashOpen, setEmptyTrashOpen] = useState(false);
  const [emptyTrashDeleting, setEmptyTrashDeleting] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const router = useRouter();
  const { renamedFile, setRenamedFile } = useGlobalContext();

  const files = use(filesPromise);
  const sortedFiles = useMemo(() => {
    return [...files].sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;

      if (sortKey === 'size') {
        return (a.size - b.size) * direction;
      }

      if (sortKey === 'date') {
        if (fileViewPage === 'trash') {
          return (
            (a.original_location ?? '').localeCompare(
              b.original_location ?? '',
              undefined,
              {
                numeric: true,
                sensitivity: 'base',
              },
            ) * direction
          );
        }

        return (
          (new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime()) *
          direction
        );
      }

      const aValue =
        sortKey === 'type' ? (a.file_type ?? 'Folder') : a.name;
      const bValue =
        sortKey === 'type' ? (b.file_type ?? 'Folder') : b.name;

      return (
        aValue.localeCompare(bValue, undefined, {
          numeric: true,
          sensitivity: 'base',
        }) * direction
      );
    });
  }, [fileViewPage, files, sortDirection, sortKey]);
  const orderedIds = sortedFiles.map((file) => file.id);
  const selectedIds = Array.from(state.selectedIds);
  const selectedFiles = files.filter((file) => state.selectedIds.has(file.id));
  const selectedDownloadsAsArchive =
    selectedFiles.length !== 1 || selectedFiles[0]?.is_dir === true;

  function handleSort(nextSortKey: SortKey) {
    if (sortKey === nextSortKey) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortKey(nextSortKey);
    setSortDirection('asc');
  }

  useEffect(() => {
    if (!selectedIds.length) return;

    function handleOutsidePointerDown(event: PointerEvent) {
      const target = event.target;

      if (!(target instanceof Element)) return;

      const isInsideFileInteraction = target.closest(
        [
          '[data-file-list]',
          '[data-file-toolbar]',
          '[data-slot$="-content"]',
        ].join(', '),
      );

      if (isInsideFileInteraction) return;

      select('', 'clear', orderedIds);
    }

    document.addEventListener('pointerdown', handleOutsidePointerDown);
    return () =>
      document.removeEventListener('pointerdown', handleOutsidePointerDown);
  }, [orderedIds, select, selectedIds.length]);

  useEffect(() => {
    if (!renamedFile) return;

    const refreshedFile = sortedFiles.find((file) => file.id === renamedFile.id);

    if (!refreshedFile || refreshedFile.name !== renamedFile.name) return;

    const frameId = requestAnimationFrame(() => {
      const fileElements = Array.from(
        document.querySelectorAll<HTMLElement>('[data-file-id]'),
      ).filter((element) => element.dataset.fileId === renamedFile.id);
      const visibleElement =
        fileElements.find((element) => element.offsetParent !== null) ??
        fileElements[0];

      visibleElement?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });

      setRenamedFile(null);
    });

    return () => cancelAnimationFrame(frameId);
  }, [renamedFile, setRenamedFile, sortedFiles]);

  useEffect(() => {
    function handleUploadComplete() {
      if (fileViewPage !== 'files') return;

      setSortKey('date');
      setSortDirection('desc');
    }

    window.addEventListener('exavault:upload-complete', handleUploadComplete);
    return () =>
      window.removeEventListener(
        'exavault:upload-complete',
        handleUploadComplete,
      );
  }, [fileViewPage]);

  useEffect(() => {
    async function handleDeleteKey(e: KeyboardEvent) {
      if (e.key !== 'Delete' || !selectedIds.length) return;

      const target = e.target as HTMLElement | null;
      const isTyping =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable;

      if (isTyping) return;

      e.preventDefault();

      try {
        if (fileViewPage === 'files') {
          const result = await trashFilesAction(selectedIds);

          if (!result.ok) {
            throw new Error(result.message);
          }

          toast.success('File(s) moved to trash');
          router.refresh();
        } else {
          setKeyboardDeleteIds(selectedIds);
          setKeyboardDeleteOpen(true);
        }
      } catch (err) {
        console.error(err);
        toast.error(
          fileViewPage === 'files'
            ? 'Failed to move file(s) to trash'
            : 'Failed to delete permanently',
        );
      }
    }

    window.addEventListener('keydown', handleDeleteKey);
    return () => window.removeEventListener('keydown', handleDeleteKey);
  }, [fileViewPage, router, selectedIds]);

  async function handleKeyboardDeleteForever() {
    if (!keyboardDeleteIds.length || keyboardDeleting) return;

    setKeyboardDeleting(true);

    try {
      const result = await deleteForeverAction(keyboardDeleteIds);

      if (!result.ok) {
        throw new Error(result.message);
      }

      toast.success('Deleted permanently');
      setKeyboardDeleteOpen(false);
      setKeyboardDeleteIds([]);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete permanently');
    } finally {
      setKeyboardDeleting(false);
    }
  }

  async function handleEmptyTrash() {
    if (emptyTrashDeleting) return;

    setEmptyTrashDeleting(true);
    const toastId = toast.loading('Emptying trash...');

    try {
      await emptyTrashAction();
      toast.success('Trash emptied', { id: toastId });
      setEmptyTrashOpen(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error('Failed to empty trash', { id: toastId });
    } finally {
      setEmptyTrashDeleting(false);
    }
  }

  return (
    <div>
      {fileViewPage === 'trash' ? (
        <div className="flex flex-wrap gap-3 text-pretty items-center justify-between p-4 my-5 bg-muted/50 rounded-md">
          <div className="flex flex-wrap items-center gap-2 ">
            <Info className="inline-block" />
            <span>Trash is not automatically deleted.</span>
          </div>
          <Button variant="ghost" onClick={() => setEmptyTrashOpen(true)}>
            Empty trash
          </Button>
        </div>
      ) : (
        ''
      )}
      {files.length === 0 ? (
        <div className="p-30 text-center">
          <p className="text-gray-600">
            {fileViewPage === 'files'
              ? 'Drag and drop files to upload or click the "Upload" button.'
              : 'Trash is empty.'}
          </p>
        </div>
      ) : (
        <>
          <FileToolbar
            fileViewPage={fileViewPage}
            selectedCount={state.selectedIds.size}
            shownCount={sortedFiles.length}
            totalCount={files.length}
            selectedIds={selectedIds}
            orderedIds={orderedIds}
            downloadsAsArchive={selectedDownloadsAsArchive}
            userRootFolder={userRootFolder}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSortChange={(key, direction) => {
              setSortKey(key);
              setSortDirection(direction);
            }}
            select={select}
          />
          <DesktopFileList
            files={sortedFiles}
            fileViewPage={fileViewPage}
            selectedIds={selectedIds}
            orderedIds={orderedIds}
            selectedIdSet={state.selectedIds}
            downloadsAsArchive={selectedDownloadsAsArchive}
            userRootFolder={userRootFolder}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSort={handleSort}
            select={select}
          />
          <MobileFileList
            files={sortedFiles}
            fileViewPage={fileViewPage}
            selectedIds={selectedIds}
            orderedIds={orderedIds}
            selectedIdSet={state.selectedIds}
            downloadsAsArchive={selectedDownloadsAsArchive}
            userRootFolder={userRootFolder}
            select={select}
          />

          <AlertDialog open={emptyTrashOpen} onOpenChange={setEmptyTrashOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Empty trash?</AlertDialogTitle>
                <AlertDialogDescription>
                  All files in trash will be permanently deleted from our
                  servers. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={emptyTrashDeleting}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  disabled={emptyTrashDeleting}
                  onClick={handleEmptyTrash}
                >
                  {emptyTrashDeleting ? 'Deleting...' : 'Continue'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialog
            open={keyboardDeleteOpen}
            onOpenChange={setKeyboardDeleteOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  The selected files will be permanently deleted from our
                  servers. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={keyboardDeleting}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  disabled={keyboardDeleting}
                  onClick={handleKeyboardDeleteForever}
                >
                  {keyboardDeleting ? 'Deleting...' : 'Continue'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}
