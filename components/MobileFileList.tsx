'use client';

import { useEffect, useRef, type MouseEvent, type PointerEvent } from 'react';
import Link from 'next/link';
import { File, Folder } from 'lucide-react';
import FileActionsMenu from '@/components/FileActionsMenu';
import { FileItem } from '@/types/file-type';
import { FileViewPage, SelectFiles } from '@/components/FileViewTypes';
import { formatFileDate } from '@/lib/format-file-date';
import { formatFileSize } from '@/lib/format-file-size';
import { useBrowserLocale } from '@/hooks/useBrowserLocale';

const MOBILE_LONG_PRESS_MS = 450;

export default function MobileFileList({
  files,
  fileViewPage,
  selectedIds,
  orderedIds,
  selectedIdSet,
  downloadsAsArchive,
  userRootFolder,
  select,
}: {
  files: FileItem[];
  fileViewPage: FileViewPage;
  selectedIds: string[];
  orderedIds: string[];
  selectedIdSet: Set<string>;
  downloadsAsArchive: boolean;
  userRootFolder: string;
  select: SelectFiles;
}) {
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggeredRef = useRef(false);
  const lastPointerTypeRef = useRef<string | null>(null);
  const selectionMode = selectedIdSet.size > 0;
  const locale = useBrowserLocale();

  function clearLongPressTimer() {
    if (!longPressTimerRef.current) return;

    clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = null;
  }

  function handlePointerDown(e: PointerEvent<HTMLDivElement>, id: string) {
    lastPointerTypeRef.current = e.pointerType;
    longPressTriggeredRef.current = false;
    clearLongPressTimer();

    if (e.pointerType !== 'touch') return;

    longPressTimerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true;
      select(id, 'ctrl', orderedIds);
    }, MOBILE_LONG_PRESS_MS);
  }

  function handlePointerEnd() {
    clearLongPressTimer();
  }

  function handleClick(e: MouseEvent<HTMLDivElement>, id: string) {
    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false;
      return;
    }

    if (e.shiftKey) {
      select(id, 'shift', orderedIds);
      return;
    }

    if (e.ctrlKey || e.metaKey) {
      select(id, 'ctrl', orderedIds);
      return;
    }

    if (lastPointerTypeRef.current === 'mouse') {
      select(id, 'click', orderedIds);
      return;
    }

    if (selectionMode) {
      select(id, 'ctrl', orderedIds);
    }
  }

  useEffect(() => {
    return () => clearLongPressTimer();
  }, []);

  return (
    <div className="block md:hidden space-y-1">
      {files.map((file) => {
        const isSelected = selectedIdSet.has(file.id);

        return (
          <div
            key={file.id}
            onPointerDown={(e) => handlePointerDown(e, file.id)}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
            onPointerLeave={handlePointerEnd}
            onClick={(e) => handleClick(e, file.id)}
            onContextMenu={(e) => e.preventDefault()}
            className={`flex items-center justify-between gap-3 pl-3 py-3 rounded-md bg-black/30
              ${isSelected ? 'bg-card ' : ''}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              {selectionMode ? (
                <span className="flex size-8 shrink-0 items-center justify-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
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
                  href={file.is_dir ? `/${fileViewPage}/${file.id}` : file.url}
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
                    {formatFileSize(file.size, locale)}
                  </span>
                  <span>
                    {fileViewPage === 'files'
                      ? formatFileDate(file.created_at, locale)
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
                isPrimarySelected={isSelected}
                downloadsAsArchive={isSelected ? downloadsAsArchive : file.is_dir}
                userRootFolder={userRootFolder}
                onSelectItem={() => select(file.id, 'click', orderedIds)}
                onClearSelection={() => select('', 'clear', orderedIds)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
