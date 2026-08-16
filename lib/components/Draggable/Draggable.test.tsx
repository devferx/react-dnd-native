import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Draggable } from './Draggable';

describe('Draggable', () => {
  it('renders with the given drag id and draggable attribute', () => {
    render(
      <Draggable
        id="item-1"
        isDragging={false}
        onDragStart={vi.fn()}
        onDragEnd={vi.fn()}
      >
        content
      </Draggable>,
    );

    const element = screen.getByText('content');
    expect(element).toHaveAttribute('data-drag-id', 'item-1');
    expect(element).toHaveAttribute('draggable', 'true');
  });

  it('applies the dragging class only when isDragging is true', () => {
    const { rerender } = render(
      <Draggable
        id="item-1"
        isDragging={false}
        onDragStart={vi.fn()}
        onDragEnd={vi.fn()}
      >
        content
      </Draggable>,
    );

    expect(screen.getByText('content')).not.toHaveClass('dnd-dragging');

    rerender(
      <Draggable
        id="item-1"
        isDragging={true}
        onDragStart={vi.fn()}
        onDragEnd={vi.fn()}
      >
        content
      </Draggable>,
    );

    expect(screen.getByText('content')).toHaveClass('dnd-dragging');
  });

  it('invokes onDragStart and onDragEnd handlers', () => {
    const onDragStart = vi.fn();
    const onDragEnd = vi.fn();

    render(
      <Draggable
        id="item-1"
        isDragging={false}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        content
      </Draggable>,
    );

    const element = screen.getByText('content');
    fireEvent.dragStart(element);
    fireEvent.dragEnd(element);

    expect(onDragStart).toHaveBeenCalledTimes(1);
    expect(onDragEnd).toHaveBeenCalledTimes(1);
  });
});
