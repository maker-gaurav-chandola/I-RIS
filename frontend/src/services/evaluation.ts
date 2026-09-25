import { apiRequest } from "./http";
import type { EvaluationResult } from "@/types/evaluation";

interface EvaluationResponse {
  evaluation: EvaluationResult;
}

// Evaluation Boundary. Starting evaluation and reading results are separate
// calls per the documented API surface — the frontend never computes a
// score itself.
export const evaluationService = {
  evaluate: (sessionId: string) =>
    apiRequest<EvaluationResponse>(
      `/api/interview-sessions/${sessionId}/evaluate`,
      {
        method: "POST",
      },
    ).then(({ evaluation }) => evaluation),

  getResults: (sessionId: string) =>
    apiRequest<EvaluationResponse>(
      `/api/interview-sessions/${sessionId}/results`,
    ).then(({ evaluation }) => evaluation),
};
