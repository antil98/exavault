export type FileViewPage = 'files' | 'trash';

export type SortKey = 'name' | 'type' | 'size' | 'date';
export type SortDirection = 'asc' | 'desc';

export type SelectionType =
  | 'click'
  | 'right'
  | 'ctrl'
  | 'shift'
  | 'toggle-all'
  | 'clear';

export type SelectFiles = (
  id: string,
  type: SelectionType,
  items: string[],
) => void;

export const sortLabels: Record<SortKey, string> = {
  name: 'Name',
  type: 'Type',
  size: 'Size',
  date: 'Date',
};
