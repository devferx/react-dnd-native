import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DndListHeader } from '../DndListHeader';
import { DndListItems } from '../DndListItems';
import { DndList } from './DndList';

import type { DndSlot } from '../../interfaces';

interface TestItem {
  id: string;
}

describe('DndList', () => {
  it('exposes DndListHeader and DndListItems as compound components', () => {
    expect(DndList.Header).toBe(DndListHeader);
    expect(DndList.Items).toBe(DndListItems);
  });

  it('renders children inside a section with the given class name', () => {
    render(
      <DndList
        className="board-column"
        containerId="col-1"
        slots={[]}
        getItemHandlers={vi.fn()}
        containerHandlers={{
          onDragOver: vi.fn(),
          onDragLeave: vi.fn(),
          onDrop: vi.fn(),
        }}
      >
        content
      </DndList>,
    );

    const section = screen.getByText('content');
    expect(section.tagName).toBe('SECTION');
    expect(section).toHaveClass('board-column');
  });

  it('forwards containerHandlers to the underlying DropZone', () => {
    const onDragOver = vi.fn();
    const onDragLeave = vi.fn();
    const onDrop = vi.fn();

    render(
      <DndList
        containerId="col-1"
        slots={[]}
        getItemHandlers={vi.fn()}
        containerHandlers={{ onDragOver, onDragLeave, onDrop }}
      >
        content
      </DndList>,
    );

    const section = screen.getByText('content');
    fireEvent.dragOver(section);
    fireEvent.dragLeave(section);
    fireEvent.drop(section);

    expect(onDragOver).toHaveBeenCalledTimes(1);
    expect(onDragLeave).toHaveBeenCalledTimes(1);
    expect(onDrop).toHaveBeenCalledTimes(1);
  });

  it('provides containerId/slots/getItemHandlers via context to DndList.Items', () => {
    const getItemHandlers = vi.fn(() => ({
      onDragStart: vi.fn(),
      onDragEnd: vi.fn(),
    }));
    const slots: DndSlot<TestItem>[] = [
      { type: 'item', item: { id: 'i1' }, isDragging: false },
    ];

    render(
      <DndList
        containerId="col-1"
        slots={slots}
        getItemHandlers={getItemHandlers}
        containerHandlers={{
          onDragOver: vi.fn(),
          onDragLeave: vi.fn(),
          onDrop: vi.fn(),
        }}
      >
        <DndList.Items>
          {(item: TestItem) => <span>{item.id}</span>}
        </DndList.Items>
      </DndList>,
    );

    expect(screen.getByText('i1')).toBeInTheDocument();
    expect(getItemHandlers).toHaveBeenCalledWith('i1', 'col-1');
  });
});
