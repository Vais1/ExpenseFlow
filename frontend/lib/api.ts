import axios, { AxiosError } from 'axios';

const envUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
// Normalize URL to ensure it ends with /api/
let apiUrl = envUrl.replace(/\/$/, ''); // Remove trailing slash if present
if (!apiUrl.endsWith('/api')) {
    apiUrl += '/api';
}
const API_URL = `${apiUrl}/`; // Ensure trailing slash for Axios baseURL

console.log('🌐 API Config:', {
    envVar: process.env.NEXT_PUBLIC_API_URL,
    resolvedUrl: API_URL
});

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

const STORAGE_KEY = 'vendorpay_session';

// Request Interceptor: Attach Token
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const session = JSON.parse(stored);
                    if (session?.token) {
                        config.headers.Authorization = `Bearer ${session.token}`;
                    }
                }
            } catch (e) {
                // Ignore JSON parse errors
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 & Errors
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            if (typeof window !== 'undefined') {
                localStorage.removeItem(STORAGE_KEY); // Logout
                window.location.href = '/auth/login';
            }
        }
        return Promise.reject(error);
    }
);
