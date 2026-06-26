"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

interface User {
  userId: string;
  email: string;
  createdAt?: string;
  lastLoginAt?: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  isLoading: true,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(
    () => typeof window !== "undefined" && Boolean(localStorage.getItem("auth_token"))
  );

  // Pure fetcher — returns user data or null, never calls setState
  const loadUserData = useCallback(async (authToken: string): Promise<User | null> => {
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      return data.user as User;
    } catch {
      localStorage.removeItem("auth_token");
      return null;
    }
  }, []);

  // On mount: restore session from localStorage — state is set inside .then() callback (async, not synchronous)
  useEffect(() => {
    const stored = localStorage.getItem("auth_token");
    if (!stored) return;
    loadUserData(stored).then((userData) => {
      if (userData) {
        setUser(userData);
        setToken(stored);
      } else {
        setToken(null);
        setUser(null);
      }
      setIsLoading(false);
    });
  }, [loadUserData]);

  const login = useCallback(async (newToken: string) => {
    localStorage.setItem("auth_token", newToken);
    const userData = await loadUserData(newToken);
    if (userData) {
      setUser(userData);
      setToken(newToken);
    } else {
      setToken(null);
      setUser(null);
    }
  }, [loadUserData]);

  const logout = () => {
    localStorage.removeItem("auth_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
