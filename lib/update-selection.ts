import { SelectionState } from '@/types/selection';

export function updateSelection({
  id,
  type,
  state,
  itemsOrdered,
}: {
  id: string;
  type: 'click' | 'right' | 'ctrl' | 'shift' | 'toggle-all';
  state: SelectionState;
  itemsOrdered: string[];
}) {
  const newSelected = new Set(state.selectedIds);

  if (type === 'toggle-all') {
    if (state.selectedIds.size === itemsOrdered.length) {
      newSelected.clear();
    } else {
      itemsOrdered.forEach((itemId) => newSelected.add(itemId));
    }
    
    return {
      selectedIds: newSelected,
      lastSelectedId: null,
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
    };
  }

  if (type === 'click') {
    newSelected.clear();
    newSelected.add(id);
    return {
      selectedIds: newSelected,
      lastSelectedId: id,
    };
  }

  if (type === 'ctrl') {
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);

    return {
      selectedIds: newSelected,
      lastSelectedId: id,
    };
  }

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
