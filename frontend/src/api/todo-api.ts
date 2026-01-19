import type { CreateTodoDto, Todo, UpdateTodoDto } from '../types/todo';

const API_URL = '/api/todos';

export async function getTodos(): Promise<Todo[]> {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error('Failed to fetch todos');
  return response.json();
}

export async function getTodo(id: number): Promise<Todo> {
  const response = await fetch(`${API_URL}/${id}`);
  if (!response.ok) throw new Error('Failed to fetch todo');
  return response.json();
}

export async function createTodo(data: CreateTodoDto): Promise<Todo> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create todo');
  return response.json();
}

export async function updateTodo(
  id: number,
  data: UpdateTodoDto,
): Promise<Todo> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update todo');
  return response.json();
}

export async function deleteTodo(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete todo');
}
