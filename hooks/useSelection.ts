import { useState } from 'react';
import { updateSelection } from '@/lib/update-selection';
import { SelectionState } from '@/types/selection';

export const useSelection = () => {
  const [state, setState] = useState<SelectionState>({
    selectedIds: new Set(),
    lastSelectedId: null,
  });

  function select(
    id: string,
    type: 'click' | 'right' | 'ctrl' | 'shift' | 'toggle-all' | 'clear',
    items: string[],
  ) {
    setState((prev) =>
      updateSelection({
        id,
        type,
        state: prev,
        itemsOrdered: items,
      }),
    );
  }

  return { state, select };
};
