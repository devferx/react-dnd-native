import type { GetItemHandlers } from './DndHandlers';
import type { DndItem } from './DndItem';
import type { DndSlot } from './DndSlot';

export interface DndListContextValue {
  containerId: string;
  slots: DndSlot<DndItem>[];
  getItemHandlers: GetItemHandlers;
}
