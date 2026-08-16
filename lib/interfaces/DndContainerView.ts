import type { DndItem } from './DndItem';
import type { DndSlot } from './DndSlot';

// The consumer's own container type, augmented with everything needed to
// render it during a drag.
export type DndContainerView<C, T extends DndItem> = C & {
  slots: DndSlot<T>[];
  isDragOver: boolean;
};
