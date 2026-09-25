import { useEffect, useState, type ReactElement } from "react";

export type HistoryItem = {
  sessionId: string;
  topic: string;
  interviewType: string;
  difficulty: string;
  completedAt: string;
  actualScore: number | null;
  expectedScore: number | null;
  hasResults: boolean;
};

export type Progress = {
  totalCompleted: number;
  latestScore: number | null;
  previousScore: number | null;
  scoreChange: number | null;
  averageScore: number | null;
  direction: "improving" | "declining" | "steady" | "not_available";
};

type Evaluation = {
  actualScore: number;
  overallAssessment: string;
  strengths: string[];
  weaknesses: string[];
  improvementAreas: string[];
  actionableRecommendations: string[];
};

function ScoreChart({
  history,
}: {
  history: HistoryItem[];
}): ReactElement | null {
  const scored = history
    .filter(
      (item): item is HistoryItem & { actualScore: number } =>
        item.actualScore != null,
    )
    .slice(0, 8)
    .reverse();
  if (scored.length < 2) return null;

  const width = 640;
  const height = 120;
  const padding = 12;
  const step = (width - padding * 2) / (scored.length - 1);
  const points = scored.map((item, index) => {
    const x = padding + step * index;
    const y =
      height - padding - (item.actualScore / 100) * (height - padding * 2);
    return { x, y, score: item.actualScore };
  });
  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`)
    .join(" ");

  return (
    <svg
      className="progress-chart"
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      role="img"
      aria-label={`Actual score across your last ${scored.length} completed interviews`}
    >
      <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2" />
      {points.map((point) => (
        <circle
          key={point.x}
          cx={point.x}
          cy={point.y}
          r="3.2"
          fill="var(--accent-strong)"
        />
      ))}
    </svg>
  );
}

type Props = {
  apiBaseUrl: string;
  initialView?: "history" | "progress";
  onRePractice: () => void;
};

export function HistoryProgress({
  apiBaseUrl,
  initialView = "history",
  onRePractice,
}: Props): ReactElement {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [selected, setSelected] = useState<HistoryItem | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [view, setView] = useState<"history" | "progress">(initialView);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadHistory(): Promise<void> {
    setLoading(true);
    setError("");
    const response = await fetch(`${apiBaseUrl}/api/interview-history`, {
      credentials: "include",
    });
    const result = (await response.json()) as {
      history?: HistoryItem[];
      progress?: Progress;
      error?: string;
    };
    if (!response.ok || !result.history) {
      setError(result.error ?? "History could not be loaded.");
    } else {
      setHistory(result.history);
      setProgress(result.progress ?? null);
    }
    setLoading(false);
  }

  async function selectInterview(item: HistoryItem): Promise<void> {
    setSelected(item);
    setEvaluation(null);
    setError("");
    const response = await fetch(
      `${apiBaseUrl}/api/interview-sessions/${item.sessionId}/results`,
      { credentials: "include" },
    );
    const result = (await response.json()) as {
      evaluation?: Evaluation;
      error?: string;
    };
    if (!response.ok || !result.evaluation) {
      setError(result.error ?? "Previous results could not be loaded.");
      return;
    }
    setEvaluation(result.evaluation);
  }

  useEffect(() => {
    void loadHistory();
  }, []);

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  if (loading) return <p className="status">Loading interview history...</p>;

  return (
    <section className="journal" aria-labelledby="history-heading">
      <p className="eyebrow">Personal practice journal</p>
      <h2 id="history-heading">What have you practiced?</h2>
      <p className="note">
        Revisit the questions, results, and movement that shape your next
        attempt.
      </p>
      <div className="configuration-actions">
        <div className="journal-tabs">
          <button
            type="button"
            className={view === "history" ? "is-active" : ""}
            onClick={() => setView("history")}
          >
            History
          </button>
          <button
            type="button"
            className={view === "progress" ? "is-active" : ""}
            onClick={() => setView("progress")}
          >
            Progress
          </button>
        </div>
        <button
          type="button"
          className="secondary-button"
          onClick={onRePractice}
        >
          Start new interview
        </button>
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {view === "progress" && progress && (
        <div className="sheet progress-note">
          {history.length >= 2 && <ScoreChart history={history} />}
          <p>
            Completed interviews <strong>{progress.totalCompleted}</strong>
          </p>
          <p>
            Average actual score{" "}
            <strong>{progress.averageScore ?? "Not available"}</strong>
          </p>
          <p>
            Latest actual score{" "}
            <strong>{progress.latestScore ?? "Not available"}</strong>
          </p>
          <p>
            Compared with previous{" "}
            <strong>
              {progress.scoreChange == null
                ? "Not available"
                : `${progress.scoreChange > 0 ? "+" : ""}${progress.scoreChange}`}
            </strong>
          </p>
          <p>
            Performance trend{" "}
            <strong>{progress.direction.replace("_", " ")}</strong>
          </p>
        </div>
      )}

      {view === "progress" && !progress && (
        <p className="note">Progress is not available yet.</p>
      )}

      {view === "history" && history.length === 0 && (
        <p className="note">No completed interviews are available yet.</p>
      )}
      {view === "history" && history.length > 0 && (
        <ul className="sheet history-list row-list">
          {history.map((item) => (
            <li key={item.sessionId}>
              <button type="button" onClick={() => void selectInterview(item)}>
                <span className="history-topic">
                  <strong>{item.topic}</strong>
                  <span>
                    {item.interviewType} · {item.difficulty} ·{" "}
                    {new Date(item.completedAt).toLocaleDateString()}
                  </span>
                </span>
                <span className="history-score numeral">
                  {item.actualScore ?? "—"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && evaluation && (
        <div className="sheet" style={{ marginTop: 18, padding: "20px 22px" }}>
          <p className="eyebrow">Previous results review</p>
          <p className="journal-meta">
            {selected.interviewType} · {selected.difficulty} ·{" "}
            {new Date(selected.completedAt).toLocaleDateString()}
          </p>
          <h3>{selected.topic}</h3>
          <p>
            <strong>Actual score:</strong> {evaluation.actualScore}
          </p>
          <p>{evaluation.overallAssessment}</p>
          <p>
            <strong>Strengths:</strong> {evaluation.strengths.join("; ")}
          </p>
          <p>
            <strong>Weaknesses:</strong> {evaluation.weaknesses.join("; ")}
          </p>
          <p>
            <strong>Improvement areas:</strong>{" "}
            {evaluation.improvementAreas.join("; ")}
          </p>
          <p>
            <strong>Recommendations:</strong>{" "}
            {evaluation.actionableRecommendations.join("; ")}
          </p>
          <button type="button" onClick={onRePractice}>
            Re-practice this interview
          </button>
        </div>
      )}
    </section>
  );
}
