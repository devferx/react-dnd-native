import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DropIndicator } from './DropIndicator';

describe('DropIndicator', () => {
  it('renders a placeholder with the drop indicator class', () => {
    const { container } = render(<DropIndicator />);

    const element = container.firstElementChild;
    expect(element?.tagName).toBe('DIV');
    expect(element).toHaveClass('dnd-drop-indicator');
  });
});
