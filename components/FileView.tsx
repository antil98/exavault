'use client';

import { use, useEffect, useState } from 'react';
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
  const router = useRouter();

  const files = use(filesPromise);
  const orderedIds = files.map((f) => f.id);
  const selectedIds = Array.from(state.selectedIds);
  const selectedFiles = files.filter((file) => state.selectedIds.has(file.id));
  const selectedDownloadsAsArchive =
    selectedFiles.length !== 1 || selectedFiles[0]?.is_dir === true;

  const isVisible = state.selectedIds.size > 0;

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
                ? 'Cancel selection'
                : 'Select all'}
            </Button>
            <div
              className={`transition-all duration-300 ease-out
                ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}
              `}
            >
              {isVisible && (
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <span className="shrink-0 text-sm">
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
          <div className="hidden overflow-x-auto lg:block">
            <div
              className="
                grid min-w-[634px] grid-cols-[minmax(220px,1fr)_80px_90px_140px_40px]
                gap-4 px-3 py-2 text-xs font-medium text-muted-foreground border-b
              "
            >
              <div>Name</div>
              <div>Type</div>
              <div>Size</div>
              <div>
                {fileViewPage === 'files' ? 'Uploaded at' : 'Original location'}
              </div>
            </div>
            {files.map((file) => (
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
                      grid min-w-[634px] grid-cols-[minmax(220px,1fr)_80px_90px_140px_40px]
                      gap-4 items-center px-3 py-3 transition
                      hover:bg-muted/50 border-b
                      ${state.selectedIds.has(file.id) ? 'bg-muted' : ''}
                    `}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {file.is_dir ? (
                        <Folder className="w-4 h-4 shrink-0" />
                      ) : (
                        <File className="w-4 h-4 shrink-0" />
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
                          text-sm font-medium hover:underline
                        "
                      >
                        {file.name}
                      </Link>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {file.file_type ? file.file_type : 'Folder'}
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {(file.size / 1024).toFixed(1)} KB
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
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
          <div className="lg:hidden space-y-1">
            {files.map((file) => {
              const isSelected = state.selectedIds.has(file.id);

              return (
                <div
                  key={file.id}
                  onClick={() => {
                    select(file.id, 'ctrl', orderedIds);
                  }}
                  onContextMenu={() => select(file.id, 'right', orderedIds)}
                  className={`flex items-start justify-between pl-3 py-3 rounded-md bg-background/50 ${
                    isSelected ? 'bg-muted' : ''
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    {file.is_dir ? (
                      <Folder className="w-4 h-4 shrink-0 mt-1" />
                    ) : (
                      <File className="w-4 h-4 shrink-0 mt-1" />
                    )}
                    <div className="flex flex-col min-w-0">
                      <Link
                        href={
                          file.is_dir ? `/${fileViewPage}/${file.id}` : file.url
                        }
                        target={file.is_dir ? '_self' : '_blank'}
                        onClick={(e) => e.stopPropagation()}
                        className="font-medium truncate hover:underline"
                        title={file.name}
                      >
                        {file.name}
                      </Link>
                      <div className="flex min-w-0 gap-3 text-xs text-muted-foreground mt-1">
                        <span>{file.file_type ? file.file_type : 'Folder'}</span>
                        <span className="shrink-0">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                        <span className="min-w-0 truncate">
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
