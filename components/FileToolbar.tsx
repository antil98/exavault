'use client';

import BulkActions from '@/components/BulkActions';
import { Button } from '@/components/ui/button';
import { XIcon } from 'lucide-react';
import {
  FileViewPage,
  SelectFiles,
  SortDirection,
  SortKey,
} from '@/components/FileViewTypes';

export default function FileToolbar({
  fileViewPage,
  selectedCount,
  shownCount,
  totalCount,
  selectedIds,
  orderedIds,
  downloadsAsArchive,
  userRootFolder,
  sortKey,
  sortDirection,
  onSortChange,
  select,
}: {
  fileViewPage: FileViewPage;
  selectedCount: number;
  shownCount: number;
  totalCount: number;
  selectedIds: string[];
  orderedIds: string[];
  downloadsAsArchive: boolean;
  userRootFolder: string;
  sortKey: SortKey;
  sortDirection: SortDirection;
  onSortChange: (key: SortKey, direction: SortDirection) => void;
  select: SelectFiles;
}) {
  const hasSelection = selectedCount > 0;

  return (
    <div
      data-file-toolbar
      className="my-2 flex w-full flex-col items-start gap-3 sm:gap-3 sm:py-0"
    >
      <div className="min-h-9 w-full min-w-0">
        {hasSelection ? (
          <div className="flex w-full min-w-0 items-center gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-1">
              <span className="min-w-0 truncate">
                {selectedCount} file(s) selected
              </span>
              <Button
                className="shrink-0"
                variant="ghost"
                size="icon-sm"
                aria-label="Clear selection"
                title="Clear selection"
                onClick={() => select('', 'clear', orderedIds)}
              >
                <XIcon />
              </Button>
            </div>

            {selectedCount < totalCount && (
              <Button
                className="shrink-0"
                variant="secondary"
                onClick={() => select('', 'toggle-all', orderedIds)}
              >
                Select all
              </Button>
            )}

            <div className="shrink-0">
              <BulkActions
                fileViewPage={fileViewPage}
                ids={selectedIds}
                downloadsAsArchive={downloadsAsArchive}
                userRootFolder={userRootFolder}
                onClearSelection={() => select('', 'clear', orderedIds)}
              />
            </div>
          </div>
        ) : (
          <span className="block truncate">
            Showing {shownCount} of {totalCount} files
          </span>
        )}
      </div>
      <select
        value={`${sortKey}:${sortDirection}`}
        onChange={(e) => {
          const [nextSortKey, nextSortDirection] = e.target.value.split(
            ':',
          ) as [SortKey, SortDirection];
          onSortChange(nextSortKey, nextSortDirection);
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
    </div>
  );
}
