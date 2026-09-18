export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TaskPayload {
  title: string;
  description?: string;
  status?: TaskStatus;
}

export interface AuthResponse {
  token: string;
  userId: number;
  name: string;
  email: string;
}

export interface AuthUser {
  userId: number;
  name: string;
  email: string;
}

export interface ApiError {
  timestamp?: string;
  status?: number;
  message?: string;
  errors?: Record<string, string>;
}
