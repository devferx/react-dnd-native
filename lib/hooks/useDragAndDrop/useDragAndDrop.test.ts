import { act, renderHook } from '@testing-library/react';
import type { DragEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';

import type { DndAdapter } from '../../interfaces';
import { useDragAndDrop } from './useDragAndDrop';

interface TestItem {
  id: string;
}

interface TestContainer {
  id: string;
  items: TestItem[];
}

const adapter: DndAdapter<TestContainer, TestItem> = {
  getItems: (container) => container.items,
  setItems: (container, items) => ({ ...container, items }),
};

// jsdom has no DataTransfer implementation, so drag events are simulated
// with a minimal fake carrying just the pieces the hook reads/writes.
class FakeDataTransfer {
  private data = new Map<string, string>();
  effectAllowed = '';
  dropEffect = '';

  setData(format: string, value: string) {
    this.data.set(format, value);
  }

  getData(format: string) {
    return this.data.get(format) ?? '';
  }
}

function makeEvent(
  overrides: Record<string, unknown> = {},
): DragEvent<HTMLElement> {
  return {
    preventDefault: vi.fn(),
    dataTransfer: new FakeDataTransfer(),
    currentTarget: document.createElement('div'),
    relatedTarget: null,
    clientY: 0,
    ...overrides,
  } as unknown as DragEvent<HTMLElement>;
}

async function flushAnimationFrame() {
  await act(async () => {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  });
}

function initialContainers(): TestContainer[] {
  return [
    { id: 'a', items: [{ id: 'i1' }, { id: 'i2' }] },
    { id: 'b', items: [] },
  ];
}

describe('useDragAndDrop', () => {
  it('exposes the initial containers and handler factories', () => {
    const { result } = renderHook(() =>
      useDragAndDrop(initialContainers(), adapter),
    );

    expect(result.current.containers).toHaveLength(2);
    expect(result.current.containers[0]).toMatchObject({
      id: 'a',
      isDragOver: false,
      slots: [
        { type: 'item', item: { id: 'i1' }, isDragging: false },
        { type: 'item', item: { id: 'i2' }, isDragging: false },
      ],
    });
    expect(typeof result.current.getItemHandlers).toBe('function');
    expect(typeof result.current.getContainerHandlers).toBe('function');
  });

  it('marks the dragged item on drag start', async () => {
    const { result } = renderHook(() =>
      useDragAndDrop(initialContainers(), adapter),
    );

    const dataTransfer = new FakeDataTransfer();
    const event = makeEvent({ dataTransfer });

    act(() => {
      result.current.getItemHandlers('i1', 'a').onDragStart(event);
    });

    expect(dataTransfer.getData('application/json')).toBe(
      JSON.stringify({ itemId: 'i1', containerId: 'a' }),
    );
    expect(dataTransfer.effectAllowed).toBe('move');

    await flushAnimationFrame();

    const containerA = result.current.containers.find((c) => c.id === 'a');
    const draggedSlot = containerA?.slots.find(
      (slot) => slot.type === 'item' && slot.item.id === 'i1',
    );
    expect(draggedSlot).toMatchObject({ type: 'item', isDragging: true });
  });

  it('moves an item to another container on drop', async () => {
    const { result } = renderHook(() =>
      useDragAndDrop(initialContainers(), adapter),
    );

    const dataTransfer = new FakeDataTransfer();

    act(() => {
      result.current
        .getItemHandlers('i1', 'a')
        .onDragStart(makeEvent({ dataTransfer }));
    });
    await flushAnimationFrame();

    const dropEvent = makeEvent({ dataTransfer });
    act(() => {
      result.current.getContainerHandlers('b').onDrop(dropEvent);
    });

    expect(dropEvent.preventDefault).toHaveBeenCalled();

    const containerA = result.current.containers.find((c) => c.id === 'a');
    const containerB = result.current.containers.find((c) => c.id === 'b');
    expect(
      containerA?.slots.map((s) => (s.type === 'item' ? s.item.id : s.key)),
    ).toEqual(['i2']);
    expect(
      containerB?.slots.map((s) => (s.type === 'item' ? s.item.id : s.key)),
    ).toEqual(['i1']);
  });

  it('clears the drop indicator on drag leave', () => {
    const { result } = renderHook(() =>
      useDragAndDrop(initialContainers(), adapter),
    );

    const containerDiv = document.createElement('div');
    act(() => {
      result.current
        .getContainerHandlers('b')
        .onDragOver(makeEvent({ currentTarget: containerDiv }));
    });

    expect(
      result.current.containers.find((c) => c.id === 'b')?.isDragOver,
    ).toBe(true);

    act(() => {
      result.current
        .getContainerHandlers('b')
        .onDragLeave(
          makeEvent({ currentTarget: containerDiv, relatedTarget: null }),
        );
    });

    expect(
      result.current.containers.find((c) => c.id === 'b')?.isDragOver,
    ).toBe(false);
  });

  it('clears the dragged item and drop indicator on drag end', async () => {
    const { result } = renderHook(() =>
      useDragAndDrop(initialContainers(), adapter),
    );

    act(() => {
      result.current.getItemHandlers('i1', 'a').onDragStart(makeEvent());
    });
    await flushAnimationFrame();

    act(() => {
      result.current.getItemHandlers('i1', 'a').onDragEnd();
    });

    const containerA = result.current.containers.find((c) => c.id === 'a');
    const slot = containerA?.slots.find(
      (s) => s.type === 'item' && s.item.id === 'i1',
    );
    expect(slot).toMatchObject({ type: 'item', isDragging: false });
  });
});
