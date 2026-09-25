import type { Database } from "sql.js";

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

export type ProgressSummary = {
  totalCompleted: number;
  latestScore: number | null;
  previousScore: number | null;
  scoreChange: number | null;
  averageScore: number | null;
  direction: "improving" | "declining" | "steady" | "not_available";
};

export type HistoryProgressBoundary = {
  listHistory: (accountId: string) => HistoryItem[];
  compareProgress: (accountId: string) => ProgressSummary;
};

export function createHistoryProgressBoundary(
  database: Database,
): HistoryProgressBoundary {
  const listHistory = (accountId: string): HistoryItem[] => {
    const result = database.exec(
      `SELECT s.id, s.topic, s.interview_type, s.difficulty, s.completed_at,
              s.expected_score, e.actual_score, e.id
       FROM interview_sessions s
       LEFT JOIN evaluation_results e ON e.interview_session_id = s.id
       WHERE s.account_id = ? AND s.status = 'completed'
       ORDER BY s.completed_at DESC`,
      [accountId],
    );
    return (result[0]?.values ?? []).map((row) => ({
      sessionId: String(row[0]),
      topic: String(row[1]),
      interviewType: String(row[2]),
      difficulty: String(row[3]),
      completedAt: String(row[4]),
      expectedScore: row[5] == null ? null : Number(row[5]),
      actualScore: row[6] == null ? null : Number(row[6]),
      hasResults: row[7] != null,
    }));
  };

  const compareProgress = (accountId: string): ProgressSummary => {
    const history = listHistory(accountId);
    const scores = history
      .map((item) => item.actualScore)
      .filter((score): score is number => score != null);
    const latestScore = scores[0] ?? null;
    const previousScore = scores[1] ?? null;
    const scoreChange =
      latestScore != null && previousScore != null
        ? latestScore - previousScore
        : null;
    return {
      totalCompleted: history.length,
      latestScore,
      previousScore,
      scoreChange,
      averageScore:
        scores.length > 0
          ? Math.round(
              scores.reduce((total, score) => total + score, 0) / scores.length,
            )
          : null,
      direction:
        scoreChange == null
          ? "not_available"
          : scoreChange > 0
            ? "improving"
            : scoreChange < 0
              ? "declining"
              : "steady",
    };
  };

  return { listHistory, compareProgress };
}
