import { post } from "./client";
import type { UserRole } from "@/types/schema";

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Register request payload
 */
export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  role?: UserRole;
}

/**
 * Auth response from API
 */
export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
}

/**
 * Login API call
 */
export async function login(request: LoginRequest): Promise<AuthResponse> {
  return post<AuthResponse>("/api/auth/login", request);
}

/**
 * Register API call
 */
export async function register(request: RegisterRequest): Promise<AuthResponse> {
  return post<AuthResponse>("/api/auth/register", request);
}

