import { SelectionState } from '@/types/selection';

export function updateSelection({
  id,
  type,
  state,
  itemsOrdered,
}: {
  id: string;
  type: 'click' | 'right' | 'ctrl' | 'shift' | 'toggle-all' | 'clear';
  state: SelectionState;
  itemsOrdered: string[];
}) {
  const newSelected = new Set(state.selectedIds);
  const newShiftSelected = new Set<string>();

  if (type === 'toggle-all') {
    if (state.selectedIds.size === itemsOrdered.length) {
      newSelected.clear();
    } else {
      itemsOrdered.forEach((itemId) => newSelected.add(itemId));
    }
    
    return {
      selectedIds: newSelected,
      lastSelectedId: null,
      shiftSelectedIds: newShiftSelected,
    };
  }

  if (type === 'right') {
    if (!newSelected.has(id)) {
      newSelected.clear();
      newSelected.add(id);
    }

    return {
      selectedIds: newSelected,
      lastSelectedId: id,
      shiftSelectedIds: newShiftSelected,
    };
  }

  if (type === 'click') {
    newSelected.clear();
    newSelected.add(id);
    return {
      selectedIds: newSelected,
      lastSelectedId: id,
      shiftSelectedIds: newShiftSelected,
    };
  }

  if (type === 'ctrl') {
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);

    return {
      selectedIds: newSelected,
      lastSelectedId: id,
      shiftSelectedIds: newShiftSelected,
    };
  }

  if (type === 'shift' && state.lastSelectedId) {
    state.shiftSelectedIds.forEach((itemId) => newSelected.delete(itemId));

    const start = itemsOrdered.indexOf(state.lastSelectedId);
    const end = itemsOrdered.indexOf(id);

    if (start === -1 || end === -1) {
      return state;
    }

    const [from, to] = start < end ? [start, end] : [end, start];

    for (let i = from; i <= to; i++) {
      const itemId = itemsOrdered[i];
      const wasSelected = newSelected.has(itemId);

      newSelected.add(itemId);

      if (!wasSelected) {
        newShiftSelected.add(itemId);
      }
    }

    return {
      selectedIds: newSelected,
      lastSelectedId: state.lastSelectedId,
      shiftSelectedIds: newShiftSelected,
    };
  }

  if (type === 'clear') {
    newSelected.clear();
    return {
      selectedIds: newSelected,
      lastSelectedId: null,
      shiftSelectedIds: newShiftSelected,
    };
  }

  return state;
}
