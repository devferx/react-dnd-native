import { DndList, useDragAndDrop } from '../lib';

interface Task {
  id: string;
  title: string;
}

interface TaskList {
  id: string;
  name: string;
  tasks: Task[];
}

const initialLists: TaskList[] = [
  {
    id: 'todo',
    name: 'Todo',
    tasks: [
      { id: 't1', title: 'Design the drop indicator' },
      { id: 't2', title: 'Write the README' },
      { id: 't3', title: 'Publish to npm' },
    ],
  },
  {
    id: 'in-progress',
    name: 'In progress',
    tasks: [{ id: 't4', title: 'Wire up cross-container drops' }],
  },
  {
    id: 'done',
    name: 'Done',
    tasks: [{ id: 't5', title: 'Scaffold the project' }],
  },
];

function App() {
  const { containers, getItemHandlers, getContainerHandlers } = useDragAndDrop(initialLists, {
    getItems: (list) => list.tasks,
    setItems: (list, tasks) => ({ ...list, tasks }),
  });

  return (
    <main>
      <h1>react-dnd-native playground</h1>
      <div className="board">
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
              <h2 className="list__title">{list.name}</h2>
            </DndList.Header>
            <DndList.Items>
              {(task: Task) => <div className="task">{task.title}</div>}
            </DndList.Items>
          </DndList>
        ))}
      </div>
    </main>
  );
}

export default App;
