import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DndListHeader } from './DndListHeader';

describe('DndListHeader', () => {
  it('renders its children without adding a wrapper element', () => {
    const { container } = render(
      <DndListHeader>
        <span>title</span>
      </DndListHeader>,
    );

    expect(screen.getByText('title')).toBeInTheDocument();
    expect(container.childElementCount).toBe(1);
    expect(container.firstElementChild?.tagName).toBe('SPAN');
  });
});
