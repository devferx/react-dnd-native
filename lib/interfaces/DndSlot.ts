import type { DndItem } from './DndItem';

export type DndSlot<T extends DndItem> =
  | { type: 'item'; item: T; isDragging: boolean }
  | { type: 'ghost'; key: string };
