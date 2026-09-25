import type { ReactElement } from "react";
import type { HistoryItem, Progress } from "./HistoryProgress";

export type DashboardUser = {
  id: string;
  email: string;
  createdAt: string;
};

export type DashboardAction = "new-interview" | "history" | "progress";

export type DashboardViewModel = {
  heading: string;
  welcome: string;
  emptyState: string;
  activitySummary: string;
};

export function getDashboardViewModel(user: DashboardUser): DashboardViewModel {
  return {
    heading: "Your next interview starts here.",
    welcome: `Welcome back, ${user.email}. Choose a focused practice session and leave with something concrete to improve.`,
    emptyState:
      "Complete your first interview to start building a personal practice journal.",
    activitySummary: "No completed interviews yet.",
  };
}

type DashboardProps = {
  user: DashboardUser;
  history?: HistoryItem[];
  progress?: Progress | null;
  onAction: (action: DashboardAction) => void;
};

export function Dashboard({
  user,
  history = [],
  progress = null,
  onAction,
}: DashboardProps): ReactElement {
  const viewModel = getDashboardViewModel(user);
  const recent = history.slice(0, 4);
  const hasPerformance = Boolean(progress && progress.totalCompleted > 0);

  return (
    <section className="dashboard" aria-labelledby="dashboard-heading">
      <div className="sheet dashboard-primary">
        <div>
          <p className="eyebrow">Practice console</p>
          <h2 id="dashboard-heading">{viewModel.heading}</h2>
          <p>{viewModel.welcome}</p>
        </div>
        <button type="button" onClick={() => onAction("new-interview")}>
          Start an interview
        </button>
      </div>

      <ol className="practice-rail" aria-label="I-RIS practice loop">
        <li className="is-current">
          <span>01</span>
          <strong>Practice</strong>
          <small>Choose your focus</small>
        </li>
        <li>
          <span>02</span>
          <strong>Interview</strong>
          <small>Think out loud</small>
        </li>
        <li>
          <span>03</span>
          <strong>Analysis</strong>
          <small>See what landed</small>
        </li>
        <li>
          <span>04</span>
          <strong>Improve</strong>
          <small>Return sharper</small>
        </li>
      </ol>

      <div className="dashboard-columns">
        <section className="sheet" aria-labelledby="activity-heading">
          <div className="sheet-header">
            <h3 id="activity-heading">
              {recent.length > 0
                ? "Recent interviews"
                : viewModel.activitySummary}
            </h3>
          </div>
          {recent.length > 0 ? (
            <ul className="row-list">
              {recent.map((item) => (
                <li key={item.sessionId} className="activity-row">
                  <span className="activity-row-main">
                    <strong>{item.topic}</strong>
                    <span>
                      {item.interviewType} · {item.difficulty} ·{" "}
                      {new Date(item.completedAt).toLocaleDateString()}
                    </span>
                  </span>
                  <span className="activity-row-score numeral">
                    {item.actualScore ?? "—"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-row">{viewModel.emptyState}</p>
          )}
        </section>

        <div style={{ display: "grid", gap: 18 }}>
          <section className="sheet" aria-labelledby="performance-heading">
            <div className="sheet-header">
              <h3 id="performance-heading">Performance</h3>
            </div>
            {hasPerformance && progress ? (
              <dl className="progress-strip">
                <div>
                  <dt>Latest score</dt>
                  <dd>{progress.latestScore ?? "—"}</dd>
                </div>
                <div>
                  <dt>Average score</dt>
                  <dd>{progress.averageScore ?? "—"}</dd>
                </div>
                <div>
                  <dt>Trend</dt>
                  <dd
                    className={
                      progress.direction === "improving"
                        ? "is-good"
                        : progress.direction === "declining"
                          ? "is-bad"
                          : ""
                    }
                  >
                    {progress.direction.replace("_", " ")}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="empty-row">
                Performance data appears here once you complete an interview.
              </p>
            )}
          </section>

          <nav
            className="sheet journal-links"
            aria-label="Practice journal areas"
          >
            <button type="button" onClick={() => onAction("history")}>
              <span>
                History
                <span className="link-kicker">Review completed interviews</span>
              </span>
            </button>
            <button type="button" onClick={() => onAction("progress")}>
              <span>
                Progress
                <span className="link-kicker">
                  Understand your score movement
                </span>
              </span>
            </button>
          </nav>
        </div>
      </div>
    </section>
  );
}
