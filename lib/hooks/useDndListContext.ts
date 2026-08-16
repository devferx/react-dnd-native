import { createContext, useContext } from 'react';

import type { DndListContextValue } from '../interfaces';

export const DndListContext = createContext<DndListContextValue | null>(null);

export function useDndListContext() {
  const context = useContext(DndListContext);

  if (!context) {
    throw new Error(
      'DndList.Header and DndList.Items must be rendered inside a <DndList>.',
    );
  }

  return context;
}
