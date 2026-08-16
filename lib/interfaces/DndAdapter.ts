import type { DndItem } from './DndItem';

// Tells useDragAndDrop how to read/write the items array on the consumer's
// own container type, instead of forcing that container into a fixed shape.
export interface DndAdapter<C, T extends DndItem> {
  getItems: (container: C) => T[];
  setItems: (container: C, items: T[]) => C;
}
