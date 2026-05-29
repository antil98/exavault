'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FieldError } from '@/components/ui/field';
import { moveFilesAction } from '@/app/actions/files';
import { FileItem } from '@/types/file-type';
import { ArrowLeft, Folder, LoaderCircle } from 'lucide-react';

export default function MoveDialog({
  open,
  onOpenChange,
  ids,
  userRootFolder,
  onClearSelection,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ids: string[];
  userRootFolder: string;
  onClearSelection: () => void;
}) {
  const [currentFolderId, setCurrentFolderId] = useState(userRootFolder);
  const [folderPath, setFolderPath] = useState([
    { id: userRootFolder, name: 'Home' },
  ]);
  const [folders, setFolders] = useState<FileItem[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState(userRootFolder);
  const [error, setError] = useState('');
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [moving, setMoving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;

    setCurrentFolderId(userRootFolder);
    setFolderPath([{ id: userRootFolder, name: 'Home' }]);
    setSelectedFolderId(userRootFolder);
    setError('');
  }, [open]);

  useEffect(() => {
    if (!open) return;

    async function loadFolders() {
      setLoadingFolders(true);
      setError('');

      try {
        const res = await fetch(`/api/folders?parentId=${currentFolderId}`);

        if (!res.ok) throw new Error('Could not load folders');

        const data = await res.json();
        setFolders(data.folders);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load folders');
      } finally {
        setLoadingFolders(false);
      }
    }

    loadFolders();
  }, [currentFolderId, open]);

  async function handleMove() {
    if (moving || !ids.length) return;

    setMoving(true);
    setError('');

    try {
      const result = await moveFilesAction(ids, selectedFolderId);

      if (!result.ok) {
        setError(result.message);
        return;
      }

      onOpenChange(false);
      onClearSelection();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Move failed');
    } finally {
      setMoving(false);
    }
  }

  function openFolder(folder: FileItem) {
    setCurrentFolderId(folder.id);
    setSelectedFolderId(folder.id);
    setFolderPath((path) => [...path, { id: folder.id, name: folder.name }]);
  }

  function goBack() {
    if (folderPath.length === 1) return;

    const nextPath = folderPath.slice(0, -1);
    const nextFolder = nextPath[nextPath.length - 1];

    setFolderPath(nextPath);
    setCurrentFolderId(nextFolder.id);
    setSelectedFolderId(nextFolder.id);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move file(s)</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={folderPath.length === 1}
              onClick={goBack}
            >
              <ArrowLeft />
              <span className="sr-only">Back</span>
            </Button>
            <span className="truncate text-sm text-muted-foreground">
              {folderPath.map((folder) => folder.name).join(' / ')}
            </span>
          </div>

          <div className="rounded-lg border">
            <button
              type="button"
              onClick={() => setSelectedFolderId(currentFolderId)}
              aria-pressed={selectedFolderId === currentFolderId}
              className="flex w-full items-center gap-2 border-b px-3 py-2 text-left text-sm hover:bg-muted/50 aria-pressed:bg-muted"
            >
              <Folder className="size-4 shrink-0" />
              Move here
            </button>

            <div className="max-h-64 overflow-auto">
              {loadingFolders ? (
                <div className="flex items-center gap-2 px-3 py-4 text-sm text-muted-foreground">
                  <LoaderCircle className="size-4 animate-spin" />
                  Loading folders...
                </div>
              ) : folders.length ? (
                folders.map((folder) => {
                  const isSelectedItem = ids.includes(folder.id);

                  return (
                    <div
                      key={folder.id}
                      className="flex items-center hover:bg-muted/50"
                    >
                      <button
                        type="button"
                        disabled={isSelectedItem}
                        onClick={() => {
                          setSelectedFolderId(folder.id);
                        }}
                        onDoubleClick={() => {
                          if (!isSelectedItem) {
                            openFolder(folder);
                          }
                        }}
                        aria-pressed={selectedFolderId === folder.id}
                        className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2 text-left text-sm disabled:cursor-not-allowed disabled:opacity-50 aria-pressed:bg-muted"
                      >
                        <Folder className="size-4 shrink-0" />
                        <span className="truncate">{folder.name}</span>
                      </button>
                      <button
                        type="button"
                        disabled={isSelectedItem}
                        onClick={() => openFolder(folder)}
                        className="mr-2 shrink-0 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Open
                      </button>
                    </div>
                  );
                })
              ) : (
                <p className="px-3 py-4 text-sm text-muted-foreground">
                  No folders here
                </p>
              )}
            </div>
          </div>

          <FieldError>{error}</FieldError>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button onClick={handleMove} disabled={moving || !ids.length}>
            {moving ? (
              <>
                <LoaderCircle className="mr-1 animate-spin" />
                Moving...
              </>
            ) : (
              'Move here'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
