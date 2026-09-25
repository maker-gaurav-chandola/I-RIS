import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "@/components/navigation/AppShell";
import { ProtectedRoute } from "./ProtectedRoute";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import { Dashboard } from "@/pages/Dashboard";
import { InterviewSetup } from "@/pages/InterviewSetup";
import { Ready } from "@/pages/Ready";
import { ActiveInterview } from "@/pages/ActiveInterview";
import { Results } from "@/pages/Results";
import { History } from "@/pages/History";
import { Progress } from "@/pages/Progress";

// Mirrors the route list from the architecture doc 1:1. Nothing here decides
// interview lifecycle — /interview/:sessionId just renders whatever state
// the backend reports for that session.
export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: "/", element: <Dashboard /> },
          { path: "/dashboard", element: <Dashboard /> },
          { path: "/interview/setup", element: <InterviewSetup /> },
          { path: "/interview/ready", element: <Ready /> },
          { path: "/interview/:sessionId", element: <ActiveInterview /> },
          { path: "/interview/:sessionId/results", element: <Results /> },
          { path: "/history", element: <History /> },
          { path: "/progress", element: <Progress /> },
        ],
      },
    ],
  },
]);
