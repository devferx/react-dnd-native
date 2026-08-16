# react-dnd-native

> 🇪🇸 Explicación en español: [`README.es.md`](./README.es.md)

A small, generic drag-and-drop library for React built on the native HTML5
[Drag and Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)
— no external dependencies. It knows nothing about "cards" or "columns"; it
only knows about **items** (things with an `id`) and **containers** (anything
with an `id` that holds a list of items). It works directly with _your own_
container type — you tell it how to read/write the items array via a small
adapter (`{ getItems, setItems }`), so there's no forced shape and no wrapper
hook to write. Any feature that needs draggable, reorderable lists can use it
— a kanban board is just one consumer.

## Folder structure

```
lib/
├── interfaces/   Pure types — no runtime logic, no JSX
├── hooks/        State + behavior (useDragAndDrop, DndList's context)
├── components/   Rendering (Draggable, DropZone, DropIndicator, DndList)
├── style.css     Optional default styles for the two required classes
└── index.ts      Public barrel — everything below is imported from here
```

Only `index.ts` should be imported from outside this folder, and its surface
is intentionally small: `DndList` is the only component it exports.
`Draggable`, `DropZone`, and `DropIndicator` are implementation details that
`DndList` composes internally (see below) — a consumer never needs to reach
for them directly, so they're not part of the public API.

```ts
import {
  useDragAndDrop,
  DndList,
  type DndItem,
  type DndContainerLike,
  type DndAdapter,
  type DndSlot,
  type DndContainerView,
} from 'react-dnd-native';
import 'react-dnd-native/style.css';
```

## Core concepts (`interfaces/`)

| Type                                       | Shape                                                                              | Meaning                                                                                                                                 |
| ------------------------------------------ | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `DndItem`                                  | `{ id: string }`                                                                   | Anything draggable. Your item type just needs to structurally match this — no need to `extend` it.                                      |
| `DndContainerLike`                         | `{ id: string }`                                                                   | The only requirement on _your_ container type: it needs an `id`. Everything else about its shape (`title`, `cards`, whatever) is yours. |
| `DndAdapter<C, T>`                         | `{ getItems: (c: C) => T[]; setItems: (c: C, items: T[]) => C }`                   | How the hook reads/writes the items array on your container type `C`, without forcing a field name like `.items`.                       |
| `DndSlot<T>`                               | `{ type: 'item'; item: T; isDragging: boolean } \| { type: 'ghost'; key: string }` | One render-ready row in a container: either a real item, or the placeholder marking where a drop would land.                            |
| `DndContainerView<C, T>`                   | `C & { slots: DndSlot<T>[]; isDragOver: boolean }`                                 | _Your_ container type, augmented with everything needed to render it during a drag.                                                     |
| `DndItemHandlers`                          | `{ onDragStart, onDragEnd }`                                                       | Native drag-source handlers for one item.                                                                                               |
| `DndContainerHandlers`                     | `{ onDragOver, onDragLeave, onDrop }`                                              | Native drop-target handlers for one container.                                                                                          |
| `GetItemHandlers` / `GetContainerHandlers` | `(id, containerId?) => Handlers`                                                   | Factories returned by the hook, used to wire a specific item/container.                                                                 |
| `DndListContextValue`                      | internal                                                                           | What `<DndList>` provides to its `Header`/`Items` children.                                                                             |

## `useDragAndDrop<C, T>(initialContainers, adapter)` (`hooks/useDragAndDrop.ts`)

The engine. Owns all drag state and produces render-ready data. It works
directly with your own container type `C` — you don't reshape your data to
fit the hook, you tell the hook how to reach into your shape:

```ts
const { containers, getItemHandlers, getContainerHandlers } = useDragAndDrop(
  columns, // ColumnData[] — your own type, whatever it looks like
  {
    getItems: (column) => column.cards,
    setItems: (column, cards) => ({ ...column, cards }),
  },
);
```

`C` and `T` are inferred from `initialContainers` and from `getItems`'s
return type — no explicit type arguments needed at the call site.

- **`containers: DndContainerView<C, T>[]`** — your original container objects, same shape/order as the input, each with a `slots` array added (items + a ghost slot spliced in at the current drop position) and `isDragOver`.
- **`getItemHandlers(itemId, containerId)`** — returns `{ onDragStart, onDragEnd }` to spread onto a `<Draggable>`.
- **`getContainerHandlers(containerId)`** — returns `{ onDragOver, onDragLeave, onDrop }` to spread onto a `<DropZone>` (or `<DndList>`'s `containerHandlers` prop).

Behavior notes:

- Drag payload (`{ itemId, containerId }`) travels through `dataTransfer` as JSON — this is what makes cross-container drops work with the native API.
- **Drop position** is computed on every `dragover` of the container by comparing the cursor's `clientY` against the vertical midpoint of each rendered item (elements found via `[data-drag-id]`, see `Draggable`/`components/index.ts` note below). This means hovering the _gap_ between two items still resolves to the nearest slot instead of the indicator jumping to the end of the list — a naive "only listen on each card" approach flickers there.
- The dragged item is hidden (`display: none` via the `dnd-dragging` class) rather than removed from the tree, and hiding it is deferred one frame (`requestAnimationFrame`) so the browser has already captured its native drag thumbnail before it disappears — hiding it synchronously in `dragstart` can produce a blank drag image in some browsers.
- Reordering within the same container and moving across containers share the same code path: the moved item is spliced out of its source list and back into the target list at the computed index (see `handleDrop` in `useDragAndDrop.ts`).

## Components (`components/`)

### Internal building blocks (not exported)

These aren't part of the public barrel — `DndList` composes them for you.
They're documented here to explain how `DndList` works internally, not as
something you'd import directly.

- **`<Draggable id isDragging onDragStart onDragEnd>`** — wraps its `children` in a `<div draggable data-drag-id={id}>` and attaches the drag-source handlers. The child itself needs zero drag-and-drop awareness — it can be any plain presentational component. The `data-drag-id` attribute is the contract `useDragAndDrop`'s geometry scan (`querySelectorAll('[data-drag-id]')`) relies on.
- **`<DropZone className onDragOver onDragLeave onDrop>`** — renders a `<section>` wired up as a native drop target. Container-level equivalent of `Draggable`.
- **`<DropIndicator>`** — the dashed "ghost card" placeholder (`.dnd-drop-indicator`, see `style.css`) rendered wherever a `ghost` slot appears.

### `<DndList>` — the public compound component

The full "generic dnd column": wires a `DndContainerView` up to a `DropZone`, `Draggable`s, and `DropIndicator`s, while staying agnostic about what a header or an item look like.

```tsx
<DndList
  containerId={column.id}
  slots={column.slots}
  getItemHandlers={getCardHandlers}
  containerHandlers={columnHandlers}
  className="column"
>
  <DndList.Header>
    <MyOwnHeaderMarkup />
  </DndList.Header>
  <DndList.Items>{(item) => <MyOwnItemMarkup item={item} />}</DndList.Items>
</DndList>
```

- **`DndList.Header`** — a transparent pass-through for whatever header content the consumer wants; rendered first, inside the drop zone (so drag-over still registers while hovering it).
- **`DndList.Items`** — reads `slots`/`getItemHandlers`/`containerId` from `DndList`'s context and, for each slot, renders either a `<DropIndicator>` or `children(item)` wrapped in `<Draggable>`.
- `DndList.Header`/`DndList.Items` must be used inside a `<DndList>` — they read from `DndListContext` (`hooks/useDndListContext.ts`) and throw if it's missing.

## Full usage example

```tsx
interface Task {
  id: string;
  title: string;
}

interface TaskList {
  id: string;
  name: string;
  tasks: Task[];
}

function TaskBoard({ initial }: { initial: TaskList[] }) {
  const { containers, getItemHandlers, getContainerHandlers } = useDragAndDrop(
    initial,
    {
      getItems: (list) => list.tasks,
      setItems: (list, tasks) => ({ ...list, tasks }),
    },
  );

  return (
    <>
      {containers.map((list) => (
        <DndList
          key={list.id}
          containerId={list.id}
          slots={list.slots}
          getItemHandlers={getItemHandlers}
          containerHandlers={getContainerHandlers(list.id)}
          className={list.isDragOver ? 'list list--drag-over' : 'list'}
        >
          <DndList.Header>
            <h2>{list.name}</h2>
          </DndList.Header>
          <DndList.Items>{(task) => <TaskCard task={task} />}</DndList.Items>
        </DndList>
      ))}
    </>
  );
}
```

Note that `TaskList` isn't required to `extend` any base type from this
library — it just needs an `id`, and the adapter (`getItems`/`setItems`)
tells the hook where the items live (`tasks`, not `items`). A kanban board
follows the exact same pattern, with the field called `cards` instead.

## Required CSS

The library assumes two global classes exist wherever it's used:

```css
.dnd-dragging {
  display: none;
} /* hides the item mid-drag */
.dnd-drop-indicator {
  /* ghost placeholder look, e.g. */
  border: 2px dashed;
}
```

Import `react-dnd-native/style.css` for sensible defaults, or define the
classes yourself in your own stylesheet.
