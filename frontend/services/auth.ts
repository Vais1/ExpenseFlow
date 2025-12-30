export type UserRole = 'Admin' | 'Management' | 'User';

export interface User {
    username: string;
    role: UserRole;
}

export interface AuthSession {
    user: User;
    token: string;
}

const STORAGE_KEY = 'vendorpay_session';

export const authService = {
    async login(username: string, password: string): Promise<AuthSession> {
        // Simulate network latency
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Mock logic: check credentials (accept any password for demo)
        // "admin" -> Admin
        // "manager" -> Management
        // others -> User

        // Simple mock validation - in a real app, you'd check password hash
        if (!username || !password) {
            throw new Error('Username and password are required');
        }

        let role: UserRole = 'User';
        if (username.toLowerCase() === 'admin') {
            role = 'Admin';
        } else if (username.toLowerCase() === 'manager') {
            role = 'Management';
        }

        const session: AuthSession = {
            user: {
                username,
                role,
            },
            token: `mock-jwt-token-${Math.random().toString(36).substring(2)}`,
        };

        // Persist session
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        }

        return session;
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
