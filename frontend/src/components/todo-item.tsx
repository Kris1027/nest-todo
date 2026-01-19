import type { Todo } from '../types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <li className='todo-item'>
      <input
        type='checkbox'
        checked={todo.completed}
        onChange={() => onToggle(todo.id, !todo.completed)}
        className='todo-checkbox'
      />
      <span className={todo.completed ? 'todo-title-completed' : 'todo-title'}>
        {todo.title}
      </span>
      <button
        onClick={() => onDelete(todo.id)}
        className='btn-danger text-sm px-3 py-1'
      >
        Delete
      </button>
    </li>
  );
}
