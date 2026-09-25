// Session Engine owns interview session, configuration, current question,
// candidate answers, answer analysis state, follow-up, duration, completion,
// early exit, and closing. The frontend only displays whatever state comes
// back — it must never invent a transition between these states itself.
export type InterviewLifecycleState =
  | "not_started"
  | "active"
  | "closing"
  | "completed"
  | "terminated";

export type InterviewType = string;
export type InterviewLanguage = "Hinglish" | "English" | "Hindi";
// Only "Text" is implemented server-side today per the architecture doc;
// the type is kept open in case voice/mixed modes land later.
export type InterviewMode = string;

export interface InterviewSessionConfig {
  interviewType: InterviewType;
  topic: string;
  difficulty: string;
  duration: number; // minutes
  language: InterviewLanguage;
  mode: InterviewMode;
}

export interface AnswerAnalysis {
  category: "strong" | "partial" | "weak" | "irrelevant" | "unclear";
  technicalCorrectness: { assessment: string; uncertain: boolean };
  relevance: { assessment: string; uncertain: boolean };
  completeness: { assessment: string; uncertain: boolean };
  explanationQuality: { assessment: string; uncertain: boolean };
  reasoning: { assessment: string; uncertain: boolean };
  strengths: string[];
  missingImportantPoints: string[];
  improvementOpportunities: string[];
  analysisNotes: string;
}

// Generic envelope for GET /api/interview-sessions/:sessionId and any
// response that carries updated session state. Treat this as a starting
// point — inspect the backend's actual response body and correct field
// names/nesting before relying on it.
export interface InterviewSession {
  id: string;
  accountId: string;
  interviewType: string;
  topic: string;
  difficulty: string;
  duration: number;
  language: string;
  mode: string;
  state: InterviewLifecycleState;
  currentQuestion: string | null;
  pendingFollowUpQuestion: string | null;
  questionIndex: number;
  turnCount: number;
  expectedScore: number | null;
  lastTurnAnalysisStatus: "pending" | "completed" | "failed" | null;
  lastTurnAnalysis: AnswerAnalysis | null;
  startedAt: string;
  completedAt: string | null;
  // Phase 1.5/1.6 (answer analysis + follow-up decision) exist on the
  // backend already, but the exact field names/nesting for what the
  // session response exposes about the last analysis are NOT verified
  // against the real backend yet — this is a placeholder shape so the UI
  // has somewhere to show it once confirmed. Update to match the actual
  // response before relying on it.
  lastAnalysisSummary?: string | null;
}

export interface SubmitAnswerRequest {
  answer: string;
}

export interface ExpectedScoreRequest {
  expectedScore: number;
}
