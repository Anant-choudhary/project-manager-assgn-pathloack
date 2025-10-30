interface User {
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

interface Project {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  tasks?: Task[];
}

interface Task {
  id: string;
  title: string;
  dueDate?: string;
  isCompleted: boolean;
  dependencies?: string[];
  estimatedHours?: number;
}

interface LoginCredentials {
  email?: string;
  password: string;
  username: string;
}

interface RegisterData extends LoginCredentials {}

interface ProjectFormData {
  title: string;
  description?: string;
}

interface TaskFormData {
  title: string;
  dueDate?: string;
  dependencies?: string[];
  estimatedHours?: number;
}

// Smart Scheduler Types
export interface ScheduleTaskInput {
  title: string;
  estimatedHours: number;
  dueDate: string; // use string for JSON compatibility
  dependencies: string[];
}

export interface ScheduleTasksRequest {
  tasks: ScheduleTaskInput[];
}

export interface ScheduleTasksResponse {
  recommendedOrder: string[];
}

export type { User, AuthContextType, Project, Task, LoginCredentials, RegisterData, ProjectFormData, TaskFormData };

