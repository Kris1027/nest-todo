import type { AuthResponse, LoginDto, RegisterDto, User } from '../types/auth';
import { api, setToken } from './client';

export async function login(data: LoginDto): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/login', data);
  setToken(response.access_token);
  return response;
}

export async function register(data: RegisterDto): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/register', data);
  setToken(response.access_token);
  return response;
}

export const getMe = () => api.get<User>('/auth/me');
