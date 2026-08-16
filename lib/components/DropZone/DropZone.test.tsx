import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DropZone } from './DropZone';

describe('DropZone', () => {
  it('renders a section with the given class name and children', () => {
    render(
      <DropZone
        className="board-column"
        onDragOver={vi.fn()}
        onDragLeave={vi.fn()}
        onDrop={vi.fn()}
      >
        content
      </DropZone>,
    );

    const section = screen.getByText('content');
    expect(section.tagName).toBe('SECTION');
    expect(section).toHaveClass('board-column');
  });

  it('forwards drag handlers to the section element', () => {
    const onDragOver = vi.fn();
    const onDragLeave = vi.fn();
    const onDrop = vi.fn();

    render(
      <DropZone
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        content
      </DropZone>,
    );

    const section = screen.getByText('content');
    fireEvent.dragOver(section);
    fireEvent.dragLeave(section);
    fireEvent.drop(section);

    expect(onDragOver).toHaveBeenCalledTimes(1);
    expect(onDragLeave).toHaveBeenCalledTimes(1);
    expect(onDrop).toHaveBeenCalledTimes(1);
  });
});
