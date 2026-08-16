import { useState, type DragEvent } from 'react';

import type {
  DndAdapter,
  DndContainerLike,
  DndContainerView,
  DndItem,
  DndSlot,
  GetContainerHandlers,
  GetItemHandlers,
} from '../interfaces';

interface DragPayload {
  itemId: string;
  containerId: string;
}

interface DropIndicator {
  containerId: string;
  index: number;
}

export function useDragAndDrop<C extends DndContainerLike, T extends DndItem>(
  initialContainers: C[],
  { getItems, setItems }: DndAdapter<C, T>,
) {
  const [containers, setContainers] = useState<C[]>(initialContainers);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dropIndicator, setDropIndicator] = useState<DropIndicator | null>(
    null,
  );

  const handleDragStart = (
    event: DragEvent<HTMLElement>,
    itemId: string,
    containerId: string,
  ) => {
    const payload: DragPayload = { itemId, containerId };
    event.dataTransfer.setData('application/json', JSON.stringify(payload));
    event.dataTransfer.effectAllowed = 'move';
    requestAnimationFrame(() => setDraggedItemId(itemId));
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
    setDropIndicator(null);
  };

  const handleContainerDragOver = (
    event: DragEvent<HTMLElement>,
    containerId: string,
  ) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';

    const itemElements = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>('[data-drag-id]'),
    ).filter((element) => element.dataset.dragId !== draggedItemId);

    let index = itemElements.length;
    for (let i = 0; i < itemElements.length; i += 1) {
      const rect = itemElements[i].getBoundingClientRect();
      if (event.clientY < rect.top + rect.height / 2) {
        index = i;
        break;
      }
    }

    setDropIndicator({ containerId, index });
  };

  const handleContainerDragLeave = (event: DragEvent<HTMLElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null))
      return;
    setDropIndicator(null);
  };

  const handleDrop = (
    event: DragEvent<HTMLElement>,
    targetContainerId: string,
  ) => {
    event.preventDefault();

    const raw = event.dataTransfer.getData('application/json');
    if (!raw) return;

    const { itemId, containerId: sourceContainerId }: DragPayload =
      JSON.parse(raw);
    const insertAt =
      dropIndicator?.containerId === targetContainerId
        ? dropIndicator.index
        : undefined;

    setContainers((prev) => {
      const sourceContainer = prev.find(
        (container) => container.id === sourceContainerId,
      );
      const movedItem = sourceContainer
        ? getItems(sourceContainer).find((item) => item.id === itemId)
        : undefined;
      if (!movedItem) return prev;

      return prev.map((container) => {
        if (
          container.id !== sourceContainerId &&
          container.id !== targetContainerId
        ) {
          return container;
        }

        let items = getItems(container);
        if (container.id === sourceContainerId) {
          items = items.filter((item) => item.id !== itemId);
        }
        if (container.id === targetContainerId) {
          const clamped = Math.max(
            0,
            Math.min(insertAt ?? items.length, items.length),
          );
          items = items.toSpliced(clamped, 0, movedItem);
        }
        return setItems(container, items);
      });
    });

    setDraggedItemId(null);
    setDropIndicator(null);
  };

  const containerViews: DndContainerView<C, T>[] = containers.map(
    (container) => {
      const slots: DndSlot<T>[] = [];
      let visibleIndex = 0;

      for (const item of getItems(container)) {
        const isDragging = draggedItemId === item.id;

        if (
          !isDragging &&
          dropIndicator?.containerId === container.id &&
          dropIndicator.index === visibleIndex
        ) {
          slots.push({ type: 'ghost', key: `ghost-${item.id}` });
        }

        slots.push({ type: 'item', item, isDragging });
        if (!isDragging) visibleIndex += 1;
      }

      if (
        dropIndicator?.containerId === container.id &&
        dropIndicator.index === visibleIndex
      ) {
        slots.push({ type: 'ghost', key: 'ghost-end' });
      }

      return {
        ...container,
        slots,
        isDragOver: dropIndicator?.containerId === container.id,
      };
    },
  );

  const getItemHandlers: GetItemHandlers = (itemId, containerId) => ({
    onDragStart: (event) => handleDragStart(event, itemId, containerId),
    onDragEnd: handleDragEnd,
  });

  const getContainerHandlers: GetContainerHandlers = (containerId) => ({
    onDragOver: (event) => handleContainerDragOver(event, containerId),
    onDragLeave: handleContainerDragLeave,
    onDrop: (event) => handleDrop(event, containerId),
  });

  return { containers: containerViews, getItemHandlers, getContainerHandlers };
}
