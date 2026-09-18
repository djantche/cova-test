import { apiClient } from "./client";
import type { Task, TaskPayload, TaskStatus } from "../types";

export function fetchTasks(status?: TaskStatus | "", search?: string) {
  return apiClient
    .get<Task[]>("/api/tasks", { params: { status: status || undefined, search: search || undefined } })
    .then((res) => res.data);
}

export function createTask(payload: TaskPayload) {
  return apiClient.post<Task>("/api/tasks", payload).then((res) => res.data);
}

export function updateTask(id: number, payload: TaskPayload) {
  return apiClient.put<Task>(`/api/tasks/${id}`, payload).then((res) => res.data);
}

export function deleteTask(id: number) {
  return apiClient.delete(`/api/tasks/${id}`);
}
