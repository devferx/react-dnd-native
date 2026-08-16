import type { ReactNode } from 'react';

import { DndListContext } from '../hooks';
import type {
  DndContainerHandlers,
  DndItem,
  DndSlot,
  GetItemHandlers,
} from '../interfaces';
import { DndListHeader } from './DndListHeader';
import { DndListItems } from './DndListItems';
import { DropZone } from './DropZone';

interface DndListProps<T extends DndItem> {
  children: ReactNode;
  className?: string;
  containerHandlers: DndContainerHandlers;
  containerId: string;
  slots: DndSlot<T>[];
  getItemHandlers: GetItemHandlers;
}

// oxlint-disable-next-line react/only-export-components -- DndListRoot is merged into the DndList compound export below
function DndListRoot<T extends DndItem>({
  children,
  className,
  containerHandlers,
  containerId,
  slots,
  getItemHandlers,
}: DndListProps<T>) {
  return (
    <DndListContext.Provider
      value={{
        containerId,
        slots: slots as DndSlot<DndItem>[],
        getItemHandlers,
      }}
    >
      <DropZone className={className} {...containerHandlers}>
        {children}
      </DropZone>
    </DndListContext.Provider>
  );
}

export const DndList = Object.assign(DndListRoot, {
  Header: DndListHeader,
  Items: DndListItems,
});
