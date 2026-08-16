import type { ReactNode } from 'react';

import type { DndContainerHandlers } from '../../interfaces';

interface DropZoneProps extends DndContainerHandlers {
  children: ReactNode;
  className?: string;
}

export const DropZone = ({
  children,
  className,
  onDragLeave,
  onDragOver,
  onDrop,
}: DropZoneProps) => (
  <section
    className={className}
    onDragOver={onDragOver}
    onDragLeave={onDragLeave}
    onDrop={onDrop}
  >
    {children}
  </section>
);
