import { useEffect, useState } from 'react';
import type { PaginationMeta, Todo, TodoQueryParams } from '../types/todo';
import { createTodo, deleteTodo, getTodos, updateTodo } from '../api/todo-api';
import { TodoForm } from '../components/todo-form';
import { TodoList } from '../components/todo-list';
import { TodoFilters } from '../components/todo-filters';
import { Pagination } from '../components/pagination';
import { useAuth } from '../context/auth-context';

const DEFAULT_LIMIT = 10;

export function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, logout } = useAuth();

  // Query state
  const [queryParams, setQueryParams] = useState<TodoQueryParams>({
    page: 1,
    limit: DEFAULT_LIMIT,
    sortOrder: 'desc',
  });

  useEffect(() => {
    loadTodos();
  }, [queryParams]);

  async function loadTodos() {
    try {
      setLoading(true);
      const response = await getTodos(queryParams);
      setTodos(response.data);
      setMeta(response.meta);
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
      await createTodo({ title });
      // Reload to get updated pagination
      loadTodos();
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
      // Reload to get updated pagination
      loadTodos();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete todo';
      setError(message);
      console.error('Delete todo error:', err);
    }
  }

  function handlePageChange(page: number) {
    setQueryParams((prev) => ({ ...prev, page }));
  }

  function handleSearch(search: string) {
    setQueryParams((prev) => ({ ...prev, search: search || undefined, page: 1 }));
  }

  function handleFilterChange(completed: boolean | undefined) {
    setQueryParams((prev) => ({ ...prev, completed, page: 1 }));
  }

  function handleSortChange(sortOrder: 'asc' | 'desc') {
    setQueryParams((prev) => ({ ...prev, sortOrder, page: 1 }));
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4">
      <div className="card max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Todo App</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">{user?.email}</span>
            <button
              onClick={logout}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        {error && <p className="alert-error">{error}</p>}

        <TodoForm onAdd={handleAdd} />

        <TodoFilters
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
        />

        {loading ? (
          <p className="text-center text-slate-500">Loading...</p>
        ) : (
          <>
            <TodoList
              todos={todos}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
            {meta && <Pagination meta={meta} onPageChange={handlePageChange} />}
          </>
        )}
      </div>
    </div>
  );
}
