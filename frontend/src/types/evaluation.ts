// Evaluation Boundary owns final evaluation, actual score, overall
// assessment, strengths, weaknesses, improvement areas, and recommendations.
// Expected score is stored separately as the candidate's self-assessment and
// must never be sent into the evaluation algorithm as an input.
export interface EvaluationResult {
  actualScore: number;
  overallAssessment: string;
  strengths: string[];
  weaknesses: string[];
  improvementAreas: string[];
  actionableRecommendations: string[];
  evidenceSummary: string;
  generatedAt: string;
}

export interface ExpectedScoreRecord {
  expectedScore: number;
}
