import type { CreateTodoDto, Todo, UpdateTodoDto } from '../types/todo';
import { api } from './client';

export const getTodos = () => api.get<Todo[]>('/todos');

export const getTodo = (id: number) => api.get<Todo>(`/todos/${id}`);

export const createTodo = (data: CreateTodoDto) =>
  api.post<Todo>('/todos', data);

export const updateTodo = (id: number, data: UpdateTodoDto) =>
  api.patch<Todo>(`/todos/${id}`, data);

export const deleteTodo = (id: number) => api.delete<void>(`/todos/${id}`);
