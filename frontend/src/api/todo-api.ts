import type {
  CreateTodoDto,
  PaginatedResponse,
  Todo,
  TodoQueryParams,
  UpdateTodoDto,
} from '../types/todo';
import { api } from './client';

export const getTodos = (params?: TodoQueryParams) => {
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.completed !== undefined)
    searchParams.set('completed', params.completed.toString());
  if (params?.search) searchParams.set('search', params.search);
  if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);

  const query = searchParams.toString();
  const url = query ? `/todos?${query}` : '/todos';

  return api.get<PaginatedResponse<Todo>>(url);
};

export const getTodo = (id: number) => api.get<Todo>(`/todos/${id}`);

export const createTodo = (data: CreateTodoDto) =>
  api.post<Todo>('/todos', data);

export const updateTodo = (id: number, data: UpdateTodoDto) =>
  api.patch<Todo>(`/todos/${id}`, data);

export const deleteTodo = (id: number) => api.delete<void>(`/todos/${id}`);
