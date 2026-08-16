import type { ReactNode } from 'react';

import { useDndListContext } from '../hooks';

import { Draggable } from './Draggable';
import { DropIndicator } from './DropIndicator';

import type { DndItem } from '../interfaces';

type Props<T> = {
  children: (item: T) => ReactNode;
};

export function DndListItems<T extends DndItem>({ children }: Props<T>) {
  const { containerId, slots, getItemHandlers } = useDndListContext();

  return (
    <>
      {slots.map((slot) =>
        slot.type === 'ghost' ? (
          <DropIndicator key={slot.key} />
        ) : (
          <Draggable
            key={slot.item.id}
            id={slot.item.id}
            isDragging={slot.isDragging}
            {...getItemHandlers(slot.item.id, containerId)}
          >
            {children(slot.item as T)}
          </Draggable>
        ),
      )}
    </>
  );
}
