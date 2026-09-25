import { apiRequest } from "./http";
import type { AuthResponse, LoginRequest, RegisterRequest } from "@/types/auth";

// Identity Service. The frontend collects credentials and renders whatever
// the backend decides — it never determines auth state itself beyond
// reflecting the last response (see hooks/useAuth.tsx).
export const authService = {
  register: (data: RegisterRequest) =>
    apiRequest<AuthResponse>("/api/auth/register", { method: "POST", body: data }),

  login: (data: LoginRequest) =>
    apiRequest<AuthResponse>("/api/auth/login", { method: "POST", body: data }),

  logout: () => apiRequest<void>("/api/auth/logout", { method: "POST" }),

  // Called once on app load so a valid session cookie survives a page
  // refresh instead of bouncing the user back to /login. A 401 here just
  // means "not logged in" — see useAuth's bootstrap effect.
  me: () => apiRequest<AuthResponse>("/api/auth/me"),
};
