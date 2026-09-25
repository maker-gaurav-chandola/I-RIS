import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Spinner } from "@/components/common/Spinner";

// Route protection is a UX convenience only — it is not the security
// boundary. The backend must reject unauthenticated/unauthorized requests
// on every protected endpoint regardless of what this component does.
//
// "checking" is the brief window while GET /api/auth/me is in flight on
// app load (see useAuth) — waiting it out here is what stops a valid
// session from being bounced to /login on every page refresh.
export function ProtectedRoute() {
  const { user, status } = useAuth();
  const location = useLocation();

  if (status === "checking") {
    return <Spinner label="Checking session" />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
