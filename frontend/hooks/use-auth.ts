"use client";

import { useMutation } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { AUTH_ENDPOINTS, STORAGE_KEYS, UserRole, ROUTES } from "@/lib/constants";

// Types
interface LoginCredentials {
    username: string;
    password: string;
}

interface RegisterCredentials {
    username: string;
    password: string;
    confirmPassword?: string;
    role: UserRole;
}

interface AuthResponse {
    token: string;
    user: {
        id: number;
        username: string;
        role: UserRole;
    };
}

interface JwtPayload {
    sub: string;
    nameid: string;
    unique_name: string;
    role: string;
    exp: number;
    iss: string;
    aud: string;
}

// Helper functions
function storeAuthData(token: string) {
    if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.accessToken, token);
    }
}

function clearAuthData() {
    if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEYS.accessToken);
        localStorage.removeItem(STORAGE_KEYS.user);
    }
}

export function getStoredToken(): string | null {
    if (typeof window !== "undefined") {
        return localStorage.getItem(STORAGE_KEYS.accessToken);
    }
    return null;
}

export function decodeToken(token: string): JwtPayload | null {
    try {
        return jwtDecode<JwtPayload>(token);
    } catch {
        return null;
    }
}

function getRoleFromToken(token: string): UserRole | null {
    const decoded = decodeToken(token);
    if (!decoded) return null;

    // Role can be a string like "User", "Management", "Admin" or a number
    const roleStr = decoded.role;
    if (roleStr === "User" || roleStr === "0") return UserRole.User;
    if (roleStr === "Management" || roleStr === "1") return UserRole.Management;
    if (roleStr === "Admin" || roleStr === "2") return UserRole.Admin;

    return null;
}

// Login mutation hook
export function useLogin() {
    const router = useRouter();

    return useMutation({
        mutationFn: async (credentials: LoginCredentials): Promise<AuthResponse> => {
            const response = await fetch(AUTH_ENDPOINTS.login, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || "Login failed. Please check your credentials.");
            }

            return response.json();
        },
        onSuccess: (data) => {
            const role = getRoleFromToken(data.token);

            // Security check: Only allow User role (role 0) for customer portal
            if (role !== UserRole.User) {
                clearAuthData();
                throw new Error("Unauthorized: Customer access only. Employees must use the employee portal.");
            }

            storeAuthData(data.token);
            router.push(ROUTES.customerDashboard);
        },
        onError: (error) => {
            clearAuthData();
            console.error("Login error:", error);
        },
    });
}

// Register mutation hook
export function useRegister() {
    return useMutation({
        mutationFn: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
            const { confirmPassword, ...payload } = credentials;

            // Validate password match
            if (confirmPassword && credentials.password !== confirmPassword) {
                throw new Error("Passwords do not match");
            }

            const response = await fetch(AUTH_ENDPOINTS.register, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: payload.username,
                    password: payload.password,
                    role: UserRole.User, // Hardcode role 0 (User) for customer registration
                }),
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || "Registration failed. Please try again.");
            }

            return response.json();
        },
    });
}

// Logout function
export function useLogout() {
    const router = useRouter();

    return () => {
        clearAuthData();
        router.push(ROUTES.customerAuth);
    };
}
