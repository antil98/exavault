export type SelectionState = {
  selectedIds: Set<string>;
  lastSelectedId: string | null;
  shiftSelectedIds: Set<string>;
};
