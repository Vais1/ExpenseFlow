"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken, setAuthToken, removeAuthToken } from "@/lib/api/config";
import { login as loginApi, register as registerApi } from "@/lib/api/auth";
import type { AuthResponse, LoginRequest, RegisterRequest } from "@/lib/api/auth";
import type { UserRole } from "@/types/schema";

interface AuthContextType {
  user: AuthResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state from token
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      // Decode token to get user info (basic implementation)
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser({
          token,
          userId: payload[`http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier`] || payload.sub,
          email: payload[`http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress`] || payload.email,
          fullName: payload[`http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name`] || payload.name,
          role: (payload[`http://schemas.microsoft.com/ws/2008/06/identity/claims/role`] || payload.role) as UserRole,
        });
      } catch {
        // Invalid token, remove it
        removeAuthToken();
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = useCallback(async (credentials: LoginRequest) => {
    const response = await loginApi(credentials);
    setAuthToken(response.token);
    setUser(response);
    router.push("/dashboard");
  }, [router]);

  const handleRegister = useCallback(async (data: RegisterRequest) => {
    const response = await registerApi(data);
    setAuthToken(response.token);
    setUser(response);
    router.push("/dashboard");
  }, [router]);

  const handleLogout = useCallback(() => {
    removeAuthToken();
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

