"use client";

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { STORAGE_KEYS, ROUTES } from "./constants";

// 1. Create Axios instance
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001",
    headers: {
        "Content-Type": "application/json",
    },
});

// 2. Request Interceptor: Attach Token
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem(STORAGE_KEYS.accessToken);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 3. Response Interceptor: Global Error Handling (401)
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            if (typeof window !== "undefined") {
                // Clear storage
                localStorage.removeItem(STORAGE_KEYS.accessToken);
                localStorage.removeItem(STORAGE_KEYS.user);

                // Redirect to login if not already there
                if (!window.location.pathname.includes("/auth")) {
                    window.location.href = ROUTES.customerAuth;
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
