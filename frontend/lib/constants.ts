// API Configuration
export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://localhost:7001";

// Auth endpoints
export const AUTH_ENDPOINTS = {
    login: `${API_BASE_URL}/api/auth/login`,
    register: `${API_BASE_URL}/api/auth/register`,
    me: `${API_BASE_URL}/api/auth/me`,
} as const;

// Storage keys
export const STORAGE_KEYS = {
    accessToken: "vendorpay_access_token",
    user: "vendorpay_user",
} as const;

// User roles (must match backend enum)
export enum UserRole {
    User = 0,
    Management = 1,
    Admin = 2,
}

// Route paths
export const ROUTES = {
    customerAuth: "/auth/customer",
    customerDashboard: "/dashboard/customer",
    adminAuth: "/auth/admin",
    managerDashboard: "/dashboard/manager",
    adminDashboard: "/dashboard/admin",
} as const;
