import type { ReactNode } from 'react';

import type { DndItemHandlers } from '../../interfaces';

interface DraggableProps extends DndItemHandlers {
  children: ReactNode;
  id: string;
  isDragging: boolean;
}

export const Draggable = ({
  children,
  id,
  isDragging,
  onDragEnd,
  onDragStart,
}: DraggableProps) => (
  <div
    className={isDragging ? 'dnd-dragging' : undefined}
    data-drag-id={id}
    draggable
    onDragStart={onDragStart}
    onDragEnd={onDragEnd}
  >
    {children}
  </div>
);
