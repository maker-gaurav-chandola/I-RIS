// History / Progress Boundary owns completed interview history, previous
// results, and the progress summary. Do not invent fields beyond what the
// backend actually returns from GET /api/interview-history.
export interface CompletedInterviewSummary {
  sessionId: string;
  interviewType: string;
  topic: string;
  difficulty: string;
  completedAt: string;
  actualScore: number | null;
  expectedScore: number | null;
  hasResults: boolean;
}

// No progress endpoint is documented explicitly — the architecture doc
// says progress is "available through the existing history/progress
// implementation." Confirm the real route and response shape, then adjust
// services/history.ts's getProgress() to match.
export interface ProgressSummary {
  totalCompleted: number;
  averageScore: number | null;
  latestScore: number | null;
  previousScore: number | null;
  scoreChange: number | null;
  direction: "improving" | "declining" | "steady" | "not_available";
}

export interface HistoryProgressResponse {
  history: CompletedInterviewSummary[];
  progress: ProgressSummary;
}
