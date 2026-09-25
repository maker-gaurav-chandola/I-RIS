import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authService } from "@/services/auth";
import type { AuthUser, LoginRequest, RegisterRequest } from "@/types/auth";
import { ApiError } from "@/services/http";

type AuthStatus = "checking" | "idle" | "loading" | "authenticated" | "error";

interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  error: string | null;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Owns nothing about authorization itself — it only holds the last identity
// the backend handed back. The backend remains the source of truth; if a
// protected request 401s, that request's own error handling is what should
// react (e.g. by clearing this state and redirecting to /login).
//
// On mount it calls GET /api/auth/me once so a valid session cookie
// survives a page refresh instead of forcing a fresh login every time.
// Status starts at "checking" precisely so ProtectedRoute can wait for that
// call instead of redirecting to /login before it's had a chance to run.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    authService
      .me()
      .then((res) => {
        if (!cancelled) {
          setUser(res.user);
          setStatus("authenticated");
        }
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          setStatus("idle");
          return;
        }
        setStatus("error");
        setError(
          err instanceof ApiError
            ? err.message
            : "Could not restore your session",
        );
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    setStatus("loading");
    setError(null);
    try {
      const res = await authService.login(data);
      setUser(res.user);
      setStatus("authenticated");
    } catch (err) {
      setStatus("error");
      setError(err instanceof ApiError ? err.message : "Login failed");
      throw err;
    }
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    setStatus("loading");
    setError(null);
    try {
      const res = await authService.register(data);
      setUser(res.user);
      setStatus("authenticated");
    } catch (err) {
      setStatus("error");
      setError(err instanceof ApiError ? err.message : "Registration failed");
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setStatus("idle");
    }
  }, []);

  const value = useMemo(
    () => ({ user, status, error, login, register, logout }),
    [user, status, error, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
