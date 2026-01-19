import { useEffect, useState } from 'react';
import type { Todo } from './types/todo';
import { createTodo, deleteTodo, getTodos, updateTodo } from './api/todo-api';
import { TodoForm } from './components/todo-form';
import { TodoList } from './components/todo-list';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTodos();
  }, []);

  async function loadTodos() {
    try {
      setLoading(true);
      const data = await getTodos();
      setTodos(data);
      setError(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load todos';
      setError(message);
      console.error('Load todos error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(title: string) {
    try {
      const newTodo = await createTodo({ title });
      setTodos([...todos, newTodo]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add todo';
      setError(message);
      console.error('Add todo error:', err);
    }
  }

  async function handleToggle(id: number, completed: boolean) {
    try {
      const updated = await updateTodo(id, { completed });
      setTodos(todos.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to update todo';
      setError(message);
      console.error('Update todo error:', err);
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteTodo(id);
      setTodos(todos.filter((t) => t.id !== id));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete todo';
      setError(message);
      console.error('Delete todo error:', err);
    }
  }

  return (
    <div className='min-h-screen bg-slate-100 py-8 px-4'>
      <div className='card max-w-md mx-auto'>
        <h1 className='text-2xl font-bold text-center text-slate-800 mb-6'>
          Todo App
        </h1>

        {error && <p className='alert-error'>{error}</p>}

        <TodoForm onAdd={handleAdd} />

        {loading ? (
          <p className='text-center text-slate-500'>Loading...</p>
        ) : (
          <TodoList
            todos={todos}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
}

export default App;
