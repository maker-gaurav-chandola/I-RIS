import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAsyncData } from "@/hooks/useAsyncData";
import { historyService } from "@/services/history";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Spinner } from "@/components/common/Spinner";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";

// Shows only real backend-reported information — no invented statistics.
export function Dashboard() {
  const { user } = useAuth();
  const history = useAsyncData(() => historyService.getHistory());
  const progress = useAsyncData(() => historyService.getProgress());

  const recent = history.data?.history.slice(0, 5) ?? [];

  return (
    <div className="page">
      <section className="hero-card">
        <div>
          <p className="hero-eyebrow">Practice session</p>
          <h1>Start a focused interview</h1>
          <p className="hero-sub">
            {user?.email ? `Welcome back, ${user.email}. ` : ""}
            Pick a topic and difficulty — I-RIS adapts the questions to your
            answers as you go.
          </p>
        </div>
        <Link to="/interview/setup">
          <Button>Start interview</Button>
        </Link>
      </section>

      <div className="dashboard-grid">
        <Card
          title="Recent practice"
          action={
            <Link to="/history" className="card-link">
              View all
            </Link>
          }
        >
          {history.loading && <Spinner label="Loading history" />}
          <ErrorBanner message={history.error} />
          {!history.loading && recent.length === 0 && (
            <p className="empty-state">
              No interviews yet — start your first one above.
            </p>
          )}
          <ul className="history-list">
            {recent.map((item) => (
              <li key={item.sessionId}>
                <span>{item.topic}</span>
                <span className="muted">{item.interviewType}</span>
                <span className="muted">{item.actualScore ?? "—"}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card
          title="Current progress"
          action={
            <Link to="/progress" className="card-link">
              Details
            </Link>
          }
        >
          {progress.loading && <Spinner label="Loading progress" />}
          <ErrorBanner message={progress.error} />
          {progress.data && (
            <div className="progress-summary">
              <div className="stat">
                <span className="stat-value">{progress.data.averageScore}</span>
                <span className="stat-label">Average</span>
              </div>
              <div className="stat">
                <span className="stat-value">
                  {progress.data.latestScore ?? "—"}
                </span>
                <span className="stat-label">Latest</span>
              </div>
              <div className="stat">
                <span className="stat-value">
                  {progress.data.totalCompleted}
                </span>
                <span className="stat-label">Completed</span>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
