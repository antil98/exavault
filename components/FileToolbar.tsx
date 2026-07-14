'use client';

import BulkActions from '@/components/BulkActions';
import { Button } from '@/components/ui/button';
import {
  FileViewPage,
  SelectFiles,
  SortDirection,
  SortKey,
} from '@/components/FileViewTypes';

export default function FileToolbar({
  fileViewPage,
  selectedCount,
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
    <div className="h-10 my-2 flex items-center gap-3 py-2 my-5 sm:gap-3 sm:py-0">
      <Button
        variant="secondary"
        onClick={() => select('', 'toggle-all', orderedIds)}
      >
        {selectedCount === totalCount ? 'Unselect all' : 'Select all'}
      </Button>
      <select
        value={`${sortKey}:${sortDirection}`}
        onChange={(e) => {
          const [nextSortKey, nextSortDirection] = e.target.value.split(':') as [
            SortKey,
            SortDirection,
          ];
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
      <div
        className={`transition-all duration-300 ease-out
          ${hasSelection ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}
        `}
      >
        {hasSelection && (
          <div className="flex flex-wrap items-center justify-end gap-2">
            <span className="shrink-0">{selectedCount} file(s) selected</span>
            <BulkActions
              fileViewPage={fileViewPage}
              ids={selectedIds}
              downloadsAsArchive={downloadsAsArchive}
              userRootFolder={userRootFolder}
              onClearSelection={() => select('', 'clear', orderedIds)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
