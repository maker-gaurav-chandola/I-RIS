import { useEffect, useState, type FormEvent, type ReactElement } from "react";
import {
  Dashboard,
  type DashboardAction,
  type DashboardUser,
} from "./components/Dashboard";
import {
  InterviewConfiguration,
  initialConfiguration,
  type ConfigurationAction,
  type InterviewConfiguration as InterviewConfigurationState,
} from "./components/InterviewConfiguration";
import {
  hasValidConfiguration,
  ReadyScreen,
  type ReadyAction,
} from "./components/ReadyScreen";
import { InterviewSessionEntry } from "./components/InterviewSessionEntry";
import { ActiveInterview } from "./components/ActiveInterview";
import {
  HistoryProgress,
  type HistoryItem,
  type Progress,
} from "./components/HistoryProgress";
import {
  OverviewIcon,
  StartIcon,
  HistoryIcon,
  ProgressIcon,
} from "./components/icons";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

type User = DashboardUser;
type AuthMode = "login" | "register";

export function getPageForPath(pathname: string): string {
  const pages: Record<string, string> = {
    "/": "Entry",
    "/account": "Account Access",
    "/dashboard": "Dashboard",
    "/interview/setup": "Interview Setup",
    "/ready": "Ready",
    "/interview": "Interview",
    "/results": "Results",
    "/history": "History",
    "/progress": "Progress",
  };

  return pages[pathname] ?? "Entry";
}

export function App(): ReactElement {
  const [health, setHealth] = useState("Checking backend...");
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(getPageForPath(window.location.pathname));
  const [configuration, setConfiguration] =
    useState<InterviewConfigurationState>(initialConfiguration);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [recentHistory, setRecentHistory] = useState<HistoryItem[]>([]);
  const [recentProgress, setRecentProgress] = useState<Progress | null>(null);

  useEffect(() => {
    fetch(`${apiBaseUrl}/api/health`)
      .then((response) => response.json())
      .then((result: { status?: string; database?: string }) => {
        setHealth(
          result.status === "ok" && result.database === "connected"
            ? "Backend and database connected"
            : "Backend unavailable",
        );
      })
      .catch(() => setHealth("Backend unavailable"));

    fetch(`${apiBaseUrl}/api/auth/me`, { credentials: "include" })
      .then(async (response) =>
        response.ok ? ((await response.json()).user as User) : null,
      )
      .then((authenticatedUser) => {
        setUser(authenticatedUser);
        setAuthChecked(true);
      })
      .catch(() => setAuthChecked(true));
  }, []);

  useEffect(() => {
    if (!user) return;
    fetch(`${apiBaseUrl}/api/interview-history`, { credentials: "include" })
      .then(async (response) =>
        response.ok
          ? ((await response.json()) as {
              history?: HistoryItem[];
              progress?: Progress;
            })
          : null,
      )
      .then((result) => {
        setRecentHistory(result?.history ?? []);
        setRecentProgress(result?.progress ?? null);
      })
      .catch(() => {
        setRecentHistory([]);
        setRecentProgress(null);
      });
  }, [user, page]);

  function navigate(path: string): void {
    window.history.pushState({}, "", path);
    setPage(getPageForPath(path));
    setMessage("");
  }

  async function submitAuth(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setMessage("");
    const response = await fetch(`${apiBaseUrl}/api/auth/${authMode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    const result = (await response.json()) as { user?: User; error?: string };
    if (!response.ok || !result.user) {
      setMessage(result.error ?? "Account access could not be completed.");
      return;
    }
    setUser(result.user);
    setPassword("");
    navigate("/dashboard");
  }

  async function logout(): Promise<void> {
    await fetch(`${apiBaseUrl}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    navigate("/account");
  }

  function handleDashboardAction(action: DashboardAction): void {
    if (action === "new-interview") {
      navigate("/interview/setup");
      return;
    }
    if (action === "history") {
      navigate("/history");
      return;
    }
    navigate("/progress");
  }

  function handleConfigurationAction(
    action: ConfigurationAction,
    _configuration?: InterviewConfigurationState,
  ): void {
    if (action === "back") {
      navigate("/dashboard");
      return;
    }
    if (configuration) navigate("/ready");
  }

  async function handleReadyAction(action: ReadyAction): Promise<void> {
    if (action === "edit") navigate("/interview/setup");
    if (action === "start") {
      const response = await fetch(`${apiBaseUrl}/api/interview-sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...configuration,
          duration: Number(configuration.duration),
        }),
      });
      const result = (await response.json()) as {
        session?: { id: string };
        error?: string;
      };
      if (!response.ok || !result.session) {
        setMessage(result.error ?? "Interview could not be started.");
        return;
      }
      setSessionId(result.session.id);
      navigate("/interview");
    }
  }

  if (!authChecked) {
    return (
      <main className="shell">
        <p className="status">Checking account access...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="shell">
        <header className="header">
          <div>
            <p className="eyebrow">Interview Response Intelligence System</p>
            <h1>I-RIS</h1>
          </div>
          <span className="status">{health}</span>
        </header>
        <section className="content">
          <p className="eyebrow">
            {page === "Entry" ? "Practice with purpose" : "Account access"}
          </p>
          <h2>
            {page === "Entry"
              ? "Practice Interviews. Improve Every Time."
              : authMode === "login"
                ? "Welcome back"
                : "Create your account"}
          </h2>
          {page === "Entry" ? (
            <>
              <p>
                Build confidence through realistic technical interview practice
                and structured feedback.
              </p>
              <button type="button" onClick={() => navigate("/account")}>
                Continue to account access
              </button>
            </>
          ) : (
            <form className="auth-form" onSubmit={submitAuth}>
              <label>
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  autoComplete={
                    authMode === "login" ? "current-password" : "new-password"
                  }
                />
              </label>
              <button type="submit">
                {authMode === "login" ? "Continue" : "Create account"}
              </button>
              {message && (
                <p className="error" role="alert">
                  {message}
                </p>
              )}
              <button
                className="link-button"
                type="button"
                onClick={() => {
                  setAuthMode(authMode === "login" ? "register" : "login");
                  setMessage("");
                }}
              >
                {authMode === "login"
                  ? "Create a new account"
                  : "Use an existing account"}
              </button>
            </form>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <aside className="app-rail" aria-label="Primary navigation">
        <button
          className="rail-brand"
          type="button"
          onClick={() => navigate("/dashboard")}
          aria-label="Go to dashboard"
        >
          <span className="brand-mark">IR</span>
          <span>I-RIS</span>
        </button>
        <p className="rail-label">Workspace</p>
        <nav className="rail-nav">
          {[
            {
              label: "Overview",
              path: "/dashboard",
              icon: <OverviewIcon />,
              active: page === "Dashboard",
            },
            {
              label: "Start interview",
              path: "/interview/setup",
              icon: <StartIcon />,
              active:
                page === "Interview Setup" ||
                page === "Ready" ||
                page === "Interview",
            },
            {
              label: "History",
              path: "/history",
              icon: <HistoryIcon />,
              active: page === "History",
            },
            {
              label: "Progress",
              path: "/progress",
              icon: <ProgressIcon />,
              active: page === "Progress",
            },
          ].map((item) => (
            <a
              key={item.path}
              className={item.active ? "is-active" : ""}
              href={item.path}
              aria-current={item.active ? "page" : undefined}
              onClick={(event) => {
                event.preventDefault();
                navigate(item.path);
              }}
            >
              {item.icon}
              {item.label}
            </a>
          ))}
        </nav>
        <div className="rail-account">
          <span className="account-dot" aria-hidden="true">
            {user.email.slice(0, 1).toUpperCase()}
          </span>
          <span className="account-email">{user.email}</span>
          <button type="button" onClick={logout}>
            Log out
          </button>
        </div>
      </aside>
      <section className="workspace">
        <header className="workspace-header">
          <div>
            <p className="workspace-breadcrumb">I-RIS / {page}</p>
            <p className="workspace-health">
              <span />
              System ready for practice
            </p>
          </div>
          <div className="workspace-context">
            Interview Response Intelligence System
          </div>
        </header>
        <div className="workspace-content">
          {page === "Interview Setup" ? (
            <InterviewConfiguration
              configuration={configuration}
              onChange={setConfiguration}
              onAction={handleConfigurationAction}
            />
          ) : page === "Ready" && hasValidConfiguration(configuration) ? (
            <ReadyScreen
              configuration={configuration}
              onAction={handleReadyAction}
            />
          ) : page === "Interview" && sessionId ? (
            <ActiveInterview apiBaseUrl={apiBaseUrl} sessionId={sessionId} />
          ) : page === "History" || page === "Progress" ? (
            <HistoryProgress
              apiBaseUrl={apiBaseUrl}
              initialView={page === "Progress" ? "progress" : "history"}
              onRePractice={() => navigate("/interview/setup")}
            />
          ) : page === "Interview" ? (
            <InterviewSessionEntry />
          ) : (
            <>
              <Dashboard
                user={user}
                history={recentHistory}
                progress={recentProgress}
                onAction={handleDashboardAction}
              />
              {message && (
                <p className="dashboard-message" role="status">
                  {message}
                </p>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
