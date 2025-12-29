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

    const roleStr = decoded.role;
    if (roleStr === "User" || roleStr === "0") return UserRole.User;
    if (roleStr === "Management" || roleStr === "1") return UserRole.Management;
    if (roleStr === "Admin" || roleStr === "2") return UserRole.Admin;

    return null;
}

// Admin/Staff Login mutation hook
export function useAdminLogin() {
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

            // Security check: Block User role from admin portal
            if (role === UserRole.User) {
                clearAuthData();
                throw new Error("Access Denied: Please use the Customer Portal.");
            }

            storeAuthData(data.token);

            // Route based on role
            if (role === UserRole.Admin) {
                router.push(ROUTES.adminDashboard);
            } else if (role === UserRole.Management) {
                router.push(ROUTES.managerDashboard);
            }
        },
        onError: (error) => {
            clearAuthData();
            console.error("Admin login error:", error);
        },
    });
}

// Admin/Staff Register mutation hook
export function useAdminRegister() {
    return useMutation({
        mutationFn: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
            // Validate role is not User
            if (credentials.role === UserRole.User) {
                throw new Error("Invalid role selection for staff registration.");
            }

            const response = await fetch(AUTH_ENDPOINTS.register, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: credentials.username,
                    password: credentials.password,
                    role: credentials.role,
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

// Logout function for admin
export function useAdminLogout() {
    const router = useRouter();

    return () => {
        clearAuthData();
        router.push(ROUTES.adminAuth);
    };
}
