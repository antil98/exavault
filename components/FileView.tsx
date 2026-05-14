'use client';

import { use, useEffect, useState } from 'react';
import { useSelection } from '@/hooks/useSelection';
import { FileItem } from '@/types/file-type';
import FileActionsMenu from './FileActionsMenu';
import Link from 'next/link';
import { Folder, File } from 'lucide-react';
import { deleteForever, trashFiles } from '@/lib/file-actions';
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

export default function FileView({
  filesPromise,
  fileViewPage,
}: {
  filesPromise: Promise<FileItem[]>;
  fileViewPage: 'files' | 'trash';
}) {
  const { state, select } = useSelection();
  const [keyboardDeleteOpen, setKeyboardDeleteOpen] = useState(false);
  const [keyboardDeleteIds, setKeyboardDeleteIds] = useState<string[]>([]);
  const [keyboardDeleting, setKeyboardDeleting] = useState(false);
  const router = useRouter();

  const files = use(filesPromise);
  const orderedIds = files.map((f) => f.id);
  const selectedIds = Array.from(state.selectedIds);

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
        // The keyboard shortcut mirrors the visible menu action for each page:
        // files go to trash, while trash items are permanently deleted.
        if (fileViewPage === 'files') {
          await trashFiles(selectedIds);
          toast.success('File(s) moved to trash');
          router.refresh();
        } else {
          // Permanent deletes still need confirmation, so store the exact
          // selected ids from the moment the Delete key was pressed.
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
      await deleteForever(keyboardDeleteIds);
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

  if (!files.length) {
    return (
      <div className="p-4">
        <p className="text-gray-600">The folder is empty</p>
      </div>
    );
  }

  return (
    <div>
      <div className="hidden md:block">
        {/* HEADER */}
        <div
          className="
      grid grid-cols-[minmax(0,1fr)_100px_100px_140px_40px]
      gap-4 px-3 py-2 text-xs font-medium text-muted-foreground border-b
    "
        >
          <div>Name</div>
          <div>Type</div>
          <div>Size</div>
          <div>
            {fileViewPage === 'files' ? 'Uploaded at' : 'Original location'}
          </div>
          <div />
        </div>

        {/* ROWS */}
        {files.map((file, i) => (
          <div key={file.id}>
            <FileActionsMenu
              menuType="context"
              fileViewPage={fileViewPage}
              ids={selectedIds}
              // The menu receives row metadata so unselected-row actions still
              // target the row that opened the menu.
              primaryId={file.id}
              primaryName={file.name}
              isPrimarySelected={state.selectedIds.has(file.id)}
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
            grid grid-cols-[minmax(0,1fr)_100px_100px_140px_40px]
            gap-4 items-center px-3 py-3 transition
            hover:bg-muted/50 select-none border-b
            ${state.selectedIds.has(file.id) ? 'bg-muted' : ''}
          `}
              >
                {/* NAME */}
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

                {/* TYPE */}
                <div className="text-xs text-muted-foreground">
                  {file.is_dir ? 'Folder' : 'File'}
                </div>

                {/* SIZE */}
                <div className="text-xs text-muted-foreground whitespace-nowrap">
                  {(file.size / 1024).toFixed(1)} KB
                </div>

                {/* DATE / LOCATION */}
                <div className="text-xs text-muted-foreground truncate">
                  {fileViewPage === 'files'
                    ? new Date(file.created_at).toLocaleDateString()
                    : file.original_location}
                </div>

                {/* ACTIONS */}
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
                    isPrimarySelected={state.selectedIds.has(file.id)}
                    onSelectItem={() => select(file.id, 'click', orderedIds)}
                  />
                </div>
              </div>
            </FileActionsMenu>
          </div>
        ))}
      </div>

      {/* ================= MOBILE CARDS ================= */}
      <div className="md:hidden space-y-1">
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

                  <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                    <span>{file.is_dir ? 'Folder' : 'File'}</span>
                    <span>{(file.size / 1024).toFixed(1)} KB</span>
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
                  isPrimarySelected={state.selectedIds.has(file.id)}
                  onSelectItem={() => select(file.id, 'click', orderedIds)}
                />
              </div>
            </div>
          );
        })}
      </div>

      <AlertDialog
        open={keyboardDeleteOpen}
        onOpenChange={setKeyboardDeleteOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              The selected files will be permanently deleted from our servers.
              This cannot be undone.
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
    </div>
  );
}
