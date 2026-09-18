import { apiClient } from "./client";
import type { AuthResponse } from "../types";

export function register(name: string, email: string, password: string) {
  return apiClient
    .post<AuthResponse>("/api/auth/register", { name, email, password })
    .then((res) => res.data);
}

export function login(email: string, password: string) {
  return apiClient
    .post<AuthResponse>("/api/auth/login", { email, password })
    .then((res) => res.data);
}
