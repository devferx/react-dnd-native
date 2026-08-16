import type { DragEvent } from 'react';

export interface DndItemHandlers {
  onDragStart: (event: DragEvent<HTMLElement>) => void;
  onDragEnd: () => void;
}

export interface DndContainerHandlers {
  onDragOver: (event: DragEvent<HTMLElement>) => void;
  onDragLeave: (event: DragEvent<HTMLElement>) => void;
  onDrop: (event: DragEvent<HTMLElement>) => void;
}

export type GetItemHandlers = (itemId: string, containerId: string) => DndItemHandlers;

export type GetContainerHandlers = (containerId: string) => DndContainerHandlers;
