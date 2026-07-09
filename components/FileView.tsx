'use client';

import { use, useEffect, useMemo, useRef, useState } from 'react';
import { useSelection } from '@/hooks/useSelection';
import { FileItem } from '@/types/file-type';
import FileActionsMenu from './FileActionsMenu';
import Link from 'next/link';
import { Folder, File, Info } from 'lucide-react';
import {
  deleteForeverAction,
  emptyTrashAction,
  trashFilesAction,
} from '@/app/actions/files';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import BulkActions from './BulkActions';
import { Button } from './ui/button';

const MOBILE_LONG_PRESS_MS = 450;
type SortKey = 'name' | 'type' | 'size' | 'date';
type SortDirection = 'asc' | 'desc';

const sortLabels: Record<SortKey, string> = {
  name: 'Name',
  type: 'Type',
  size: 'Size',
  date: 'Date',
};

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
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggeredRef = useRef(false);
  const router = useRouter();

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
  const orderedIds = sortedFiles.map((f) => f.id);
  const selectedIds = Array.from(state.selectedIds);
  const selectedFiles = files.filter((file) => state.selectedIds.has(file.id));
  const selectedDownloadsAsArchive =
    selectedFiles.length !== 1 || selectedFiles[0]?.is_dir === true;

  const isVisible = state.selectedIds.size > 0;
  const mobileSelectionMode = state.selectedIds.size > 0;

  function clearLongPressTimer() {
    if (!longPressTimerRef.current) return;

    clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = null;
  }

  function handleMobilePointerDown(id: string) {
    longPressTriggeredRef.current = false;
    clearLongPressTimer();

    longPressTimerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true;
      select(id, 'ctrl', orderedIds);
    }, MOBILE_LONG_PRESS_MS);
  }

  function handleMobilePointerEnd() {
    clearLongPressTimer();
  }

  function handleMobileClick(id: string) {
    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false;
      return;
    }

    if (mobileSelectionMode) {
      select(id, 'ctrl', orderedIds);
    }
  }

  function handleSort(nextSortKey: SortKey) {
    if (sortKey === nextSortKey) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortKey(nextSortKey);
    setSortDirection('asc');
  }

  function getSortLabel(key: SortKey) {
    return sortKey === key
      ? `${sortLabels[key]} ${sortDirection === 'asc' ? 'Asc' : 'Desc'}`
      : sortLabels[key];
  }

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

  useEffect(() => {
    return () => clearLongPressTimer();
  }, []);

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
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-md">
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
          <p className="text-gray-600">The folder is empty</p>
        </div>
      ) : (
        <>
          <div className="h-10 my-2 flex items-center gap-3 py-2 my-5 sm:gap-3 sm:py-0">
            <Button
              variant="secondary"
              onClick={() => select('', 'toggle-all', orderedIds)}
            >
              {state.selectedIds.size === files.length
                ? 'Unselect all'
                : 'Select all'}
            </Button>
            <select
              value={`${sortKey}:${sortDirection}`}
              onChange={(e) => {
                const [nextSortKey, nextSortDirection] = e.target.value.split(
                  ':',
                ) as [SortKey, SortDirection];
                setSortKey(nextSortKey);
                setSortDirection(nextSortDirection);
              }}
              aria-label="Sort files"
              className="h-8 rounded-lg border border-input bg-background px-2 text-sm md:hidden"
            >
              <option value="name:asc">Name A-Z</option>
              <option value="name:desc">Name Z-A</option>
              <option value="type:asc">Type A-Z</option>
              <option value="type:desc">Type Z-A</option>
              <option value="size:asc">Size smallest</option>
              <option value="size:desc">Size largest</option>
              <option value="date:asc">Date oldest</option>
              <option value="date:desc">Date newest</option>
            </select>
            <div
              className={`transition-all duration-300 ease-out
                ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}
              `}
            >
              {isVisible && (
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <span className="shrink-0">
                    {state.selectedIds.size} file(s) selected
                  </span>
                  <BulkActions
                    fileViewPage={fileViewPage}
                    ids={selectedIds}
                    downloadsAsArchive={selectedDownloadsAsArchive}
                    userRootFolder={userRootFolder}
                    onClearSelection={() => select('', 'clear', orderedIds)}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="hidden overflow-x-auto md:block dark">
            <div
              className="
                grid min-w-[590px] grid-cols-[32px_minmax(0,1fr)_80px_90px_100px_40px]
                gap-4 px-3 py-2 font-medium text-muted-foreground border-b
              "
            >
              <div></div>
              <div>
                <button
                  type="button"
                  onClick={() => handleSort('name')}
                  className="text-left hover:text-foreground"
                >
                  {getSortLabel('name')}
                </button>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => handleSort('type')}
                  className="text-left hover:text-foreground"
                >
                  {getSortLabel('type')}
                </button>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => handleSort('size')}
                  className="text-left hover:text-foreground"
                >
                  {getSortLabel('size')}
                </button>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => handleSort('date')}
                  className="text-left hover:text-foreground"
                >
                  {sortKey === 'date'
                    ? `${fileViewPage === 'files' ? 'Uploaded at' : 'Original location'} ${
                        sortDirection === 'asc' ? 'Asc' : 'Desc'
                      }`
                    : fileViewPage === 'files'
                      ? 'Uploaded at'
                      : 'Original location'}
                </button>
              </div>
            </div>
            {sortedFiles.map((file) => (
              <div key={file.id}>
                <FileActionsMenu
                  menuType="context"
                  fileViewPage={fileViewPage}
                  ids={selectedIds}
                  primaryId={file.id}
                  primaryName={file.name}
                  primaryIsDir={file.is_dir}
                  isPrimarySelected={state.selectedIds.has(file.id)}
                  downloadsAsArchive={
                    state.selectedIds.has(file.id)
                      ? selectedDownloadsAsArchive
                      : file.is_dir
                  }
                  userRootFolder={userRootFolder}
                  onClearSelection={() => select('', 'clear', orderedIds)}
                >
                  <div
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
                    onContextMenu={() => {
                      if (!state.selectedIds.has(file.id)) {
                        select(file.id, 'click', orderedIds);
                      }

                      select(file.id, 'right', orderedIds);
                    }}
                    className={`
                      grid min-w-[590px] grid-cols-[32px_minmax(0,1fr)_80px_90px_100px_40px]
                      gap-4 items-center px-3 py-3 transition
                      border-b border-border hover:bg-card/50
                      ${state.selectedIds.has(file.id) ? 'bg-card' : ''}
                    `}
                  >
                    <div onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={state.selectedIds.has(file.id)}
                        onChange={() => select(file.id, 'ctrl', orderedIds)}
                        aria-label={`Select ${file.name}`}
                        className="size-4 rounded border-border accent-primary"
                      />
                    </div>
                    <div className="flex items-center gap-3 min-w-0">
                      {file.is_dir ? (
                        <Folder className="w-8 h-8 shrink-0 fill-foreground" />
                      ) : (
                        <File className="w-8 h-8 shrink-0" />
                      )}
                      <Link
                        href={
                          file.is_dir ? `/${fileViewPage}/${file.id}` : file.url
                        }
                        target={file.is_dir ? '_self' : '_blank'}
                        title={file.name}
                        onClick={(e) => e.stopPropagation()}
                        className="
                          truncate min-w-0 overflow-hidden
                          font-medium hover:underline
                        "
                      >
                        {file.name}
                      </Link>
                    </div>
                    <div className="text-muted-foreground truncate">
                      {file.file_type ? file.file_type : 'Folder'}
                    </div>
                    <div className="text-muted-foreground truncate">
                      {(file.size / 1024).toFixed(1)} KB
                    </div>
                    <div className="text-muted-foreground truncate">
                      {fileViewPage === 'files'
                        ? new Date(file.created_at).toLocaleDateString()
                        : file.original_location}
                    </div>
                    <div
                      className="flex justify-end"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FileActionsMenu
                        menuType="dropdown"
                        fileViewPage={fileViewPage}
                        ids={selectedIds}
                        primaryId={file.id}
                        primaryName={file.name}
                        primaryIsDir={file.is_dir}
                        isPrimarySelected={state.selectedIds.has(file.id)}
                        downloadsAsArchive={
                          state.selectedIds.has(file.id)
                            ? selectedDownloadsAsArchive
                            : file.is_dir
                        }
                        userRootFolder={userRootFolder}
                        onSelectItem={() =>
                          select(file.id, 'click', orderedIds)
                        }
                        onClearSelection={() => select('', 'clear', orderedIds)}
                      />
                    </div>
                  </div>
                </FileActionsMenu>
              </div>
            ))}
          </div>
          <div className="block md:hidden space-y-1">
            {sortedFiles.map((file) => {
              return (
                <div
                  key={file.id}
                  onPointerDown={() => handleMobilePointerDown(file.id)}
                  onPointerUp={handleMobilePointerEnd}
                  onPointerCancel={handleMobilePointerEnd}
                  onPointerLeave={handleMobilePointerEnd}
                  onClick={() => handleMobileClick(file.id)}
                  onContextMenu={(e) => e.preventDefault()}
                  className={`flex items-center justify-between gap-3 pl-3 py-3 rounded-md bg-black/30
                    ${state.selectedIds.has(file.id) ? 'bg-card ' : ''}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {mobileSelectionMode ? (
                      <span className="flex size-8 shrink-0 items-center justify-center">
                        <input
                          type="checkbox"
                          checked={state.selectedIds.has(file.id)}
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          onChange={() => select(file.id, 'ctrl', orderedIds)}
                          aria-label={`Select ${file.name}`}
                          className="size-4 rounded border-border accent-primary"
                        />
                      </span>
                    ) : file.is_dir ? (
                      <Folder className="size-8 shrink-0 fill-foreground" />
                    ) : (
                      <File className="size-8 shrink-0" />
                    )}
                    <div className="flex flex-col min-w-0">
                      <Link
                        href={
                          file.is_dir ? `/${fileViewPage}/${file.id}` : file.url
                        }
                        target={file.is_dir ? '_self' : '_blank'}
                        onClick={(e) => e.stopPropagation()}
                        className="font-medium truncate max-w-fit"
                        title={file.name}
                      >
                        {file.name}
                      </Link>
                      <div className="flex flex-col min-w-0 text-muted-foreground mt-1">
                        <span className=" truncate">
                          {file.file_type ? file.file_type : 'Folder'}
                        </span>
                        <span className="shrink-0">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                        <span>
                          {fileViewPage === 'files'
                            ? new Date(file.created_at).toLocaleDateString()
                            : file.original_location}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <FileActionsMenu
                      menuType="dropdown"
                      fileViewPage={fileViewPage}
                      ids={selectedIds}
                      primaryId={file.id}
                      primaryName={file.name}
                      primaryIsDir={file.is_dir}
                      isPrimarySelected={state.selectedIds.has(file.id)}
                      downloadsAsArchive={
                        state.selectedIds.has(file.id)
                          ? selectedDownloadsAsArchive
                          : file.is_dir
                      }
                      userRootFolder={userRootFolder}
                      onSelectItem={() => select(file.id, 'click', orderedIds)}
                      onClearSelection={() => select('', 'clear', orderedIds)}
                    />
                  </div>
                </div>
              );
            })}
          </div>

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
