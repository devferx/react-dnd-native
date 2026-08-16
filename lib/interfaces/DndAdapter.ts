import type { DndItem } from './DndItem';

export interface DndAdapter<C, T extends DndItem> {
  getItems: (container: C) => T[];
  setItems: (container: C, items: T[]) => C;
}
