// Identity Service owns authentication, account ownership, and authenticated
// user identity. The frontend never decides these — it only submits
// credentials and renders whatever the backend returns.
//
// Confirm these shapes against the real backend source before wiring up —
// this file is a best guess from the documented route list
// (POST /api/auth/register, /api/auth/login, /api/auth/logout), not the
// verified schema.

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  user: AuthUser;
}
