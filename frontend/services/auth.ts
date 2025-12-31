import { z } from 'zod';
import { api } from '@/lib/api';

export type UserRole = 'Admin' | 'Management' | 'User';

// --- DTO Schemas ---
const UserSchema = z.object({
    id: z.coerce.string(), // Backend might send number or string
    username: z.string(),
    role: z.enum(['Admin', 'Management', 'User']),
});

const LoginResponseSchema = z.object({
    success: z.boolean(),
    message: z.string().optional(),
    token: z.string(),
    user: UserSchema,
});

const RegisterResponseSchema = LoginResponseSchema; // Same structure

const MeResponseSchema = z.object({
    userId: z.coerce.string(),
    username: z.string(),
    role: z.enum(['Admin', 'Management', 'User']),
    message: z.string().optional(),
});

export type User = z.infer<typeof UserSchema>;

export interface AuthSession {
    user: User;
    token: string;
}

const STORAGE_KEY = 'vendorpay_session';

export const authService = {
    async login(username: string, password: string): Promise<AuthSession> {
        const response = await api.post('auth/login', { username, password });

        // Runtime Validation
        const parsed = LoginResponseSchema.parse(response.data);

        const session: AuthSession = {
            user: parsed.user,
            token: parsed.token,
        };

        this.persistSession(session);
        return session;
    },

    async register(username: string, password: string, role: string): Promise<AuthSession> {
        const response = await api.post('auth/register', {
            username,
            password,
            confirmPassword: password, // Auto-confirm since UI might not have field yet, or we assume match
            role: role === 'Admin' ? 2 : role === 'Management' ? 1 : 0 // Map string role to enum integer
        });


        const parsed = RegisterResponseSchema.parse(response.data);

        const session: AuthSession = {
            user: parsed.user,
            token: parsed.token,
        };

        this.persistSession(session);
        return session;
    },

    async refreshSession(): Promise<AuthSession | null> {
        try {
            const currentSession = this.getSession();
            if (!currentSession) return null;

            // Verify with backend
            const response = await api.get('auth/me');
            const parsed = MeResponseSchema.parse(response.data);

            const updatedSession: AuthSession = {
                user: {
                    id: parsed.userId,
                    username: parsed.username,
                    role: parsed.role,
                },
                token: currentSession.token, // Keep existing token
            };

            this.persistSession(updatedSession);
            return updatedSession;
        } catch (error) {
            console.error('Session refresh failed:', error);
            // If validation or API fails, logout
            this.logout();
            return null;
        }
    },

    persistSession(session: AuthSession) {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        }
    },

    getSession(): AuthSession | null {
        if (typeof window === 'undefined') return null;

        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return null;

        try {
            return JSON.parse(stored) as AuthSession;
        } catch (e) {
            localStorage.removeItem(STORAGE_KEY);
            return null;
        }
    },

    logout() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEY);
        }
    },
};
