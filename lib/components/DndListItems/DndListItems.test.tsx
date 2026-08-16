import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DndListContext } from '../../hooks';
import { DndListItems } from './DndListItems';

import type { DndSlot } from '../../interfaces';

interface TestItem {
  id: string;
}

describe('DndListItems', () => {
  it('renders a DropIndicator for ghost slots and items for item slots', () => {
    const slots: DndSlot<TestItem>[] = [
      { type: 'ghost', key: 'ghost-start' },
      { type: 'item', item: { id: 'i1' }, isDragging: false },
    ];
    const getItemHandlers = vi.fn(() => ({
      onDragStart: vi.fn(),
      onDragEnd: vi.fn(),
    }));

    const { container } = render(
      <DndListContext.Provider
        value={{ containerId: 'col-1', slots, getItemHandlers }}
      >
        <DndListItems>
          {(item: TestItem) => <span>{item.id}</span>}
        </DndListItems>
      </DndListContext.Provider>,
    );

    expect(container.querySelector('.dnd-drop-indicator')).not.toBeNull();
    expect(screen.getByText('i1')).toBeInTheDocument();
    expect(getItemHandlers).toHaveBeenCalledWith('i1', 'col-1');
  });

  it('wires the handlers returned by getItemHandlers onto each item', () => {
    const slots: DndSlot<TestItem>[] = [
      { type: 'item', item: { id: 'i1' }, isDragging: false },
    ];
    const onDragStart = vi.fn();
    const onDragEnd = vi.fn();
    const getItemHandlers = vi.fn(() => ({ onDragStart, onDragEnd }));

    render(
      <DndListContext.Provider
        value={{ containerId: 'col-1', slots, getItemHandlers }}
      >
        <DndListItems>
          {(item: TestItem) => <span>{item.id}</span>}
        </DndListItems>
      </DndListContext.Provider>,
    );

    const draggable = screen.getByText('i1').closest('[data-drag-id]');
    expect(draggable).not.toBeNull();

    fireEvent.dragStart(draggable as Element);
    fireEvent.dragEnd(draggable as Element);

    expect(onDragStart).toHaveBeenCalledTimes(1);
    expect(onDragEnd).toHaveBeenCalledTimes(1);
  });
});
