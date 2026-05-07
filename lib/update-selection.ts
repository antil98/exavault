import { SelectionState } from '@/types/selection-type';

export function updateSelection({
  id,
  type,
  state,
  itemsOrdered,
}: {
  id: string;
  type: 'click' | 'ctrl' | 'shift';
  state: SelectionState;
  itemsOrdered: string[];
}) {
  const newSelected = new Set(state.selectedIds);

  // normal click → replace selection
  if (type === 'click') {
    newSelected.clear();
    newSelected.add(id);
    return {
      selectedIds: newSelected,
      lastSelectedId: id,
    };
  }

  // ctrl/cmd → toggle
  if (type === 'ctrl') {
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);

    return {
      selectedIds: newSelected,
      lastSelectedId: id,
    };
  }

  // shift → range select
  if (type === 'shift' && state.lastSelectedId) {
    const start = itemsOrdered.indexOf(state.lastSelectedId);
    const end = itemsOrdered.indexOf(id);

    const [from, to] = start < end ? [start, end] : [end, start];

    for (let i = from; i <= to; i++) {
      newSelected.add(itemsOrdered[i]);
    }

    return {
      selectedIds: newSelected,
      lastSelectedId: id,
    };
  }

  return state;
}
