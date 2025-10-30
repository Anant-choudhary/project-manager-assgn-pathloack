import { LoginCredentials, Project, ProjectFormData, RegisterData, Task, TaskFormData } from '../types';
import type { ScheduleTasksRequest, ScheduleTasksResponse } from '../types';

interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  title?: string;
}

const API_BASE = (import.meta as any).env?.VITE_API_BASE || `https://project-manager-assgn-pathloack.onrender.com/api`;
console.log("API_BASE: " + API_BASE);

class ApiService {
  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error: ApiResponse = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || error.title || 'Request failed');
    }

    return response.json().catch(() => ({} as T));
  }

  auth = {
    register: (data: RegisterData) => this.request<{ token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    login: (data: LoginCredentials) => this.request<{ token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  };

  projects = {
    getAll: () => this.request<Project[]>('/projects'),
    getById: (id: string) => this.request<Project>(`/projects/${id}`),
    create: (data: ProjectFormData) => this.request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => this.request<void>(`/projects/${id}`, { method: 'DELETE' }),
    // Smart Scheduler endpoint
    getRecommendedTaskOrder: (projectId: string, tasks: ScheduleTasksRequest['tasks']) =>
      this.request<ScheduleTasksResponse>(`/projects/${projectId}/schedule`, {
        method: 'POST',
        body: JSON.stringify({ tasks }),
      }),
  };

  tasks = {
    create: (projectId: string, data: TaskFormData) => this.request<Task>(`/projects/${projectId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (taskId: string, data: Partial<Task>) => this.request<Task>(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (taskId: string) => this.request<void>(`/tasks/${taskId}`, { method: 'DELETE' }),
  };
}

export const api = new ApiService();
