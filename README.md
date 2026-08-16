# react-dnd-native

A small, dependency-free drag-and-drop library for React, built on the native
HTML5 [Drag and Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API).

It provides a `useDragAndDrop` hook and a `DndList` component for building
reorderable lists and cross-container interactions without coupling the
drag-and-drop logic to a specific domain model. It knows nothing about
"cards" or "columns" — only about **items** (things with an `id`) and
**containers** (things with an `id` that hold a list of items). You tell it
how to read/write the items array on _your own_ container type via a small
adapter (`{ getItems, setItems }`). A kanban board is just one consumer.

## Features

- Lightweight and dependency-free
- React and TypeScript first
- Domain-agnostic container and item models — no required `.items` field
- Reorder items within a container
- Move items across containers
- Visual drop position indicators
- Native HTML5 Drag and Drop API
- Composable React primitives

## Installation

Install it with your preferred package manager:

```sh
npm install react-dnd-native
```

```sh
pnpm add react-dnd-native
```

```sh
yarn add react-dnd-native
```

The library has no runtime dependencies. `react` and `react-dom` (v19+) are
peer dependencies.

## Quick Start

```tsx
import { DndList, useDragAndDrop } from 'react-dnd-native';
import 'react-dnd-native/style.css';

const { containers, getItemHandlers, getContainerHandlers } = useDragAndDrop(
  columns, // your own type, e.g. ColumnData[]
  {
    getItems: (column) => column.cards,
    setItems: (column, cards) => ({ ...column, cards }),
  },
);
```

`useDragAndDrop` works directly with your own data structures — your
containers don't need an `items` property or a base type from this library.

<details>
<summary>Full example</summary>

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

Note that `TaskList` doesn't `extend` any base type from this library — it
just needs an `id`, and the adapter (`getItems`/`setItems`) tells the hook
where the items live (`tasks`, not `items`). A kanban board follows the same
pattern, with the field called `cards` instead.

</details>

## API

### `useDragAndDrop<C, T>(containers, adapter)`

The engine. Owns all drag state and produces render-ready data. `C` and `T`
are inferred from `containers` and from `adapter.getItems`'s return type —
no explicit type arguments needed at the call site.

Returns:

| Property               | Description                                                                                                                                                                   |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `containers`           | `DndContainerView<C, T>[]` — your original containers, same shape/order, each with a `slots` array (items + a ghost slot at the current drop position) and `isDragOver` added |
| `getItemHandlers`      | `(itemId, containerId) => { onDragStart, onDragEnd }` — spread onto a draggable item                                                                                          |
| `getContainerHandlers` | `(containerId) => { onDragOver, onDragLeave, onDrop }` — spread onto a container's drop zone                                                                                  |

### `DndAdapter<C, T>`

The boundary between the generic DnD engine and your domain model:

```ts
interface DndAdapter<C, T> {
  getItems: (container: C) => T[];
  setItems: (container: C, items: T[]) => C;
}
```

A Kanban board may store cards under `cards`, while a task list may store
them under `tasks` — the adapter is what lets the same engine work with
either.

### `DndList`

The public compound component: wires a `DndContainerView` up to a drop zone
and renders its items and ghost/drop indicator, while staying agnostic
about what a header or an item look like.

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

- **`DndList.Header`** — a transparent pass-through for whatever header
  content the consumer wants; rendered first, inside the drop zone (so
  drag-over still registers while hovering it).
- **`DndList.Items`** — reads `slots`/`getItemHandlers`/`containerId` from
  `DndList`'s context and, for each slot, renders either the drop indicator
  or `children(item)` wrapped as a draggable. Must be used inside a
  `<DndList>`.

### Types

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

## Styling

The library provides minimal default styles for the two classes it applies
during a drag.

```ts
import 'react-dnd-native/style.css';
```

```css
.dnd-dragging {
  display: none; /* hides the item mid-drag */
}
.dnd-drop-indicator {
  border: 2px dashed; /* ghost placeholder look, e.g. */
}
```

Import the stylesheet for sensible defaults, or define the classes yourself
in your own stylesheet. The library does not otherwise impose styles on
your cards, containers, or layout.

## Architecture

The library is intentionally split into three layers:

```
lib/
├── interfaces/   Pure types — no runtime logic, no JSX
├── hooks/        State + behavior (useDragAndDrop, DndList's context)
├── components/   Rendering (Draggable, DropZone, DropIndicator, DndList)
├── style.css     Optional default styles for the two required classes
└── index.ts      Public barrel — everything is imported from here
```

```
Your domain model
       │
       │ getItems / setItems
       ▼
useDragAndDrop
       │
       ▼
     DndList
       │
       ▼
    Your UI
```

Only `index.ts` is meant to be imported from outside `lib/`. Its surface is
intentionally small — `DndList` is the only component it exports.
`Draggable`, `DropZone`, and `DropIndicator` are implementation details that
`DndList` composes internally; a consumer never needs to reach for them
directly, so they're not part of the public API.

<details>
<summary>Internal implementation</summary>

**Internal components (not exported):**

- **`<Draggable id isDragging onDragStart onDragEnd>`** — wraps its
  `children` in a `<div draggable data-drag-id={id}>` and attaches the
  drag-source handlers. The child itself needs zero drag-and-drop
  awareness — it can be any plain presentational component. The
  `data-drag-id` attribute is the contract `useDragAndDrop`'s geometry scan
  (`querySelectorAll('[data-drag-id]')`) relies on.
- **`<DropZone className onDragOver onDragLeave onDrop>`** — renders a
  `<section>` wired up as a native drop target. Container-level equivalent
  of `Draggable`.
- **`<DropIndicator>`** — the dashed "ghost card" placeholder
  (`.dnd-drop-indicator`) rendered wherever a `ghost` slot appears.

**Behavior notes:**

- Drag payload (`{ itemId, containerId }`) travels through `dataTransfer` as
  JSON — this is what makes cross-container drops work with the native API.
- **Drop position** is computed on every `dragover` of the container by
  comparing the cursor's `clientY` against the vertical midpoint of each
  rendered item (elements found via `[data-drag-id]`). This means hovering
  the _gap_ between two items still resolves to the nearest slot instead of
  the indicator jumping to the end of the list — a naive "only listen on
  each card" approach flickers there.
- The dragged item is hidden (`display: none` via the `dnd-dragging` class)
  rather than removed from the tree, and hiding it is deferred one frame
  (`requestAnimationFrame`) so the browser has already captured its native
  drag thumbnail before it disappears — hiding it synchronously in
  `dragstart` can produce a blank drag image in some browsers.
- Reordering within the same container and moving across containers share
  the same code path: the moved item is spliced out of its source list and
  back into the target list at the computed index.

</details>

## Development

Clone the repository and install dependencies:

```sh
git clone https://github.com/devferx/react-dnd-native.git
cd react-dnd-native
npm install
```

Start the local playground:

```sh
npm run dev
```

This runs an interactive Kanban-style board (`src/App.tsx`) built on top of
the library, useful for manually testing drag-and-drop behavior.

## Testing

Unit tests are written with [Vitest](https://vitest.dev/) and
[React Testing Library](https://testing-library.com/react). They cover the
core drag-and-drop state transitions: reordering within a container, moving
items across containers, inserting at the start/end, empty containers, drop
position calculation, and drag state cleanup.

```sh
npm test          # run all tests once
npm run test:watch  # run tests in watch mode
```

## Build & quality checks

```sh
npm run build      # bundle the library + generate .d.ts files (vite.lib.config.ts)
npm run typecheck  # tsc -b
npm run lint       # oxlint
npm run format:check  # oxfmt --check
```

## Publishing

Releases are manual for now. To cut a new version:

```sh
npm version <patch|minor|major>   # bumps package.json + creates a git tag
npm run release                   # runs prepublishOnly (lint, typecheck, test, build), then publishes
git push --follow-tags
```

`prepublishOnly` runs automatically before `npm publish` as well, so the
package can never ship without passing lint, typecheck, and tests, and
without a fresh `dist/` build.

## Roadmap

This project is currently targeting its first `0.1.0` release — the core
drag-and-drop behavior works, but the public API, testing, accessibility,
and packaging are still in progress.

### Core

- [x] Native HTML5 drag-and-drop
- [x] Reorder items within the same container
- [x] Move items across containers
- [x] Dynamic drop position detection
- [x] Visual drop indicator
- [x] Generic container/item model
- [x] Refactor `useDragAndDrop` to work directly with consumer domain models
- [ ] Finalize the public API

### Developer Experience

- [x] Add comprehensive unit tests
- [ ] Add integration tests for drag-and-drop interactions
- [ ] Improve TypeScript types and API ergonomics
- [x] Add interactive playground
- [ ] Improve API documentation
- [ ] Add usage examples for common patterns

### Accessibility

- [ ] Keyboard-based dragging
- [ ] Keyboard-based reordering
- [ ] Screen reader announcements
- [ ] ARIA attributes and drag states
- [ ] Focus management during drag and drop

### Platform Support

- [ ] Touch / pointer-based dragging
- [ ] Mobile device support
- [ ] Cross-browser testing
- [ ] Document browser limitations of native HTML5 drag-and-drop

### Package & Release

- [x] Set up production library build
- [x] Generate TypeScript declaration files
- [x] Configure package exports
- [ ] Add CI for linting, type checking, tests, and builds
- [ ] Add automated npm releases
- [x] Publish the first `0.1.0` release
- [ ] Establish a stable API for `1.0.0`

### Possible Future Improvements

Not committed — ideas that may or may not happen after `1.0.0`.

- [ ] Custom drag previews
- [ ] Customizable drop indicators
- [ ] Drag handles
- [ ] Drag constraints
- [ ] Animation support
- [ ] Nested containers

## Limitations

The library currently relies on the native HTML5 Drag and Drop API. As a
result:

- Touch and mobile interactions are not currently supported.
- Keyboard-based dragging is not currently supported.
- Accessibility features (ARIA, screen reader announcements, focus
  management) are still being developed.
- Native drag-and-drop behavior can vary slightly across browsers.

These are tracked in the [Roadmap](#roadmap) above.

## Contributing

Contributions, bug reports, and ideas are welcome. Before opening a pull
request:

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

For larger changes, please open an issue first to discuss the proposed API
or behavior.

## License

MIT
