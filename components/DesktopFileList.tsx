'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { File, Folder, MoveUp, MoveDown } from 'lucide-react';
import FileActionsMenu from '@/components/FileActionsMenu';
import { FileItem } from '@/types/file-type';
import {
  FileViewPage,
  SelectFiles,
  SortDirection,
  SortKey,
  sortLabels,
} from '@/components/FileViewTypes';
import formatFileDate from '@/lib/format-file-date';
import formatFileSize from '@/lib/format-file-size';

export default function DesktopFileList({
  files,
  fileViewPage,
  selectedIds,
  orderedIds,
  selectedIdSet,
  downloadsAsArchive,
  userRootFolder,
  sortKey,
  sortDirection,
  onSort,
  select,
}: {
  files: FileItem[];
  fileViewPage: FileViewPage;
  selectedIds: string[];
  orderedIds: string[];
  selectedIdSet: Set<string>;
  downloadsAsArchive: boolean;
  userRootFolder: string;
  sortKey: SortKey;
  sortDirection: SortDirection;
  onSort: (key: SortKey) => void;
  select: SelectFiles;
}) {
  function getSortLabel(key: SortKey) {
    return sortKey === key ? (
      <span className="inline-flex items-center gap-1">
        {sortLabels[key]}
        {sortDirection === 'asc' ? (
          <MoveUp className="w-4 h-4" />
        ) : (
          <MoveDown className="w-4 h-4" />
        )}
      </span>
    ) : (
      sortLabels[key]
    );
  }

  const dateColumnLabel =
    fileViewPage === 'files' ? 'Uploaded at' : 'Date deleted';

  return (
    <div data-file-list className="hidden overflow-x-auto md:block">
      <div
        className="
          grid min-w-[590px] grid-cols-[15px_minmax(0,1fr)_100px_90px_150px_40px]
          gap-4 px-3 py-2 font-medium text-muted-foreground border-b
        "
      >
        <div></div>
        <SortableHeader
          label={getSortLabel('name')}
          onClick={() => onSort('name')}
        />
        <SortableHeader
          label={getSortLabel('type')}
          onClick={() => onSort('type')}
        />
        <SortableHeader
          label={getSortLabel('size')}
          onClick={() => onSort('size')}
        />
        <SortableHeader
          label={
            sortKey === 'date' ? (
              <span className="inline-flex items-center gap-1">
                {dateColumnLabel}
                {sortDirection === 'asc' ? (
                  <MoveUp className="w-4 h-4" />
                ) : (
                  <MoveDown className="w-4 h-4" />
                )}
              </span>
            ) : (
              dateColumnLabel
            )
          }
          onClick={() => onSort('date')}
        />
      </div>
      {files.map((file) => {
        const isSelected = selectedIdSet.has(file.id);

        return (
          <div key={file.id}>
            <FileActionsMenu
              menuType="context"
              fileViewPage={fileViewPage}
              ids={selectedIds}
              primaryId={file.id}
              primaryName={file.name}
              primaryIsDir={file.is_dir}
              isPrimarySelected={isSelected}
              downloadsAsArchive={isSelected ? downloadsAsArchive : file.is_dir}
              userRootFolder={userRootFolder}
              onClearSelection={() => select('', 'clear', orderedIds)}
            >
              <div
                data-file-id={file.id}
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
                  if (!isSelected) {
                    select(file.id, 'click', orderedIds);
                  }

                  select(file.id, 'right', orderedIds);
                }}
                className={`
                  grid min-w-[590px] grid-cols-[15px_minmax(0,1fr)_100px_90px_150px_40px]
                  gap-4 items-center px-3 py-3 transition
                  border-b border-border hover:bg-black/5 hover:dark:bg-white/10
                  ${isSelected ? 'bg-black/15 dark:bg-white/15' : ''}
                `}
              >
                <div onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => select(file.id, 'ctrl', orderedIds)}
                    aria-label={`Select ${file.name}`}
                    className="size-4 rounded border-border accent-primary"
                  />
                </div>
                <div className="flex items-center gap-3 min-w-0">
                  {file.is_dir ? (
                    <Folder className="size-6 shrink-0 fill-foreground" />
                  ) : (
                    <File className="size-6 shrink-0" />
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
                <div
                  className="text-muted-foreground truncate"
                  title={file.file_type ? file.file_type : 'Folder'}
                >
                  {file.file_type ? file.file_type : 'Folder'}
                </div>
                <div
                  className="text-muted-foreground truncate"
                  title={
                    formatFileSize(file.size) === '0 B'
                      ? '—'
                      : formatFileSize(file.size)
                  }
                >
                  {formatFileSize(file.size) === '0 B'
                    ? '—'
                    : formatFileSize(file.size)}
                </div>
                <div
                  className="text-muted-foreground truncate"
                  title={file.created_at}
                >
                  {fileViewPage === 'files'
                    ? formatFileDate(file.created_at)
                    : formatFileDate(file.deleted_at)}
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
                    isPrimarySelected={isSelected}
                    downloadsAsArchive={
                      isSelected ? downloadsAsArchive : file.is_dir
                    }
                    userRootFolder={userRootFolder}
                    onSelectItem={() => select(file.id, 'click', orderedIds)}
                    onClearSelection={() => select('', 'clear', orderedIds)}
                  />
                </div>
              </div>
            </FileActionsMenu>
          </div>
        );
      })}
    </div>
  );
}

function SortableHeader({
  label,
  onClick,
}: {
  label: ReactNode;
  onClick: () => void;
}) {
  return (
    <div className="-my-2 flex min-w-0">
      <button
        type="button"
        onClick={onClick}
        className="w-full min-w-0 py-2 text-left hover:text-foreground"
      >
        {label}
      </button>
    </div>
  );
}
