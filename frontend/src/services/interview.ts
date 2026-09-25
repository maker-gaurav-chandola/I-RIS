import { apiRequest } from "./http";
import type {
  ExpectedScoreRequest,
  InterviewSession,
  InterviewSessionConfig,
  SubmitAnswerRequest,
} from "@/types/interview";

interface SessionResponse {
  session: InterviewSession;
}

// Session Engine. Every call here returns the session state as the backend
// currently sees it — pages render that state, they do not compute the next
// state client-side.
export const interviewService = {
  createSession: (config: InterviewSessionConfig) =>
    apiRequest<SessionResponse>("/api/interview-sessions", {
      method: "POST",
      body: config,
    }).then(({ session }) => session),

  getSession: (sessionId: string) =>
    apiRequest<SessionResponse>(`/api/interview-sessions/${sessionId}`).then(
      ({ session }) => session,
    ),

  submitAnswer: (sessionId: string, data: SubmitAnswerRequest) =>
    apiRequest<SessionResponse>(
      `/api/interview-sessions/${sessionId}/answers`,
      {
        method: "POST",
        body: data,
      },
    ).then(({ session }) => session),

  submitClosing: (sessionId: string) =>
    apiRequest<SessionResponse>(`/api/interview-sessions/${sessionId}/close`, {
      method: "POST",
    }).then(({ session }) => session),

  // Expected score is the candidate's self-assessment only — it is stored,
  // never fed into the evaluation algorithm as an input.
  submitExpectedScore: (sessionId: string, data: ExpectedScoreRequest) =>
    apiRequest<SessionResponse>(
      `/api/interview-sessions/${sessionId}/expected-score`,
      { method: "POST", body: data },
    ).then(({ session }) => session),

  terminate: (sessionId: string) =>
    apiRequest<SessionResponse>(
      `/api/interview-sessions/${sessionId}/terminate`,
      {
        method: "POST",
      },
    ).then(({ session }) => session),
};
