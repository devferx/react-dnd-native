import type { DndItem } from './DndItem';
import type { DndSlot } from './DndSlot';

export type DndContainerView<C, T extends DndItem> = C & {
  slots: DndSlot<T>[];
  isDragOver: boolean;
};
