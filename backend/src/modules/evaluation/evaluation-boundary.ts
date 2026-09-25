import type { AnswerAnalysis } from "../ai/ai-provider.js";

export type EvaluationEvidenceTurn = {
  question: string;
  answer: string;
  analysis: AnswerAnalysis | null;
};

export type EvaluationResult = {
  actualScore: number;
  overallAssessment: string;
  strengths: string[];
  weaknesses: string[];
  improvementAreas: string[];
  actionableRecommendations: string[];
  evidenceSummary: string;
  generatedAt: string;
};

export type EvaluationInput = {
  sessionId: string;
  topic: string;
  turns: EvaluationEvidenceTurn[];
};

export type EvaluationBoundary = {
  evaluate: (input: EvaluationInput) => EvaluationResult;
};

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

export function createEvaluationBoundary(): EvaluationBoundary {
  return {
    evaluate: ({ sessionId, topic, turns }) => {
      const normalizedTurns = turns.filter(
        (turn) => turn.answer.trim().length > 0 || turn.analysis,
      );

      if (normalizedTurns.length === 0) {
        const generatedAt = new Date().toISOString();
        return {
          actualScore: 0,
          overallAssessment:
            "The interview did not provide enough evidence for a meaningful evaluation.",
          strengths: [],
          weaknesses: ["No interview evidence was available for assessment."],
          improvementAreas: [
            "Provide a fuller answer set to improve evaluation.",
          ],
          actionableRecommendations: [
            "Answer the questions with concrete examples and reasoning.",
          ],
          evidenceSummary: `No evaluation evidence was captured for session ${sessionId} on topic ${topic}.`,
          generatedAt,
        };
      }

      const categoryWeight: Record<string, number> = {
        strong: 90,
        partial: 65,
        weak: 35,
        irrelevant: 18,
        unclear: 12,
      };

      let scoreTotal = 0;
      const strengths = new Set<string>();
      const weaknesses = new Set<string>();
      const improvementAreas = new Set<string>();
      const recommendations = new Set<string>();

      for (const turn of normalizedTurns) {
        const analysis = turn.analysis;
        if (!analysis) continue;

        scoreTotal += categoryWeight[analysis.category] ?? 40;

        for (const strength of analysis.strengths) {
          if (strength.trim()) strengths.add(strength.trim());
        }
        for (const missing of analysis.missingImportantPoints) {
          if (missing.trim()) weaknesses.add(missing.trim());
        }
        for (const opportunity of analysis.improvementOpportunities) {
          if (opportunity.trim()) improvementAreas.add(opportunity.trim());
        }

        if (analysis.category === "weak" || analysis.category === "partial") {
          recommendations.add(
            "Give more precise explanations and include a concrete example for each concept.",
          );
        }
        if (
          analysis.category === "irrelevant" ||
          analysis.category === "unclear"
        ) {
          recommendations.add(
            "Revisit the core question and answer directly with the relevant technical concept.",
          );
        }
        if (analysis.category === "strong") {
          recommendations.add(
            "Keep using structured reasoning and practical examples to maintain consistency.",
          );
        }
      }

      const averageScore = Math.round(scoreTotal / normalizedTurns.length);
      const actualScore = clamp(averageScore, 0, 100);
      const generatedAt = new Date().toISOString();

      const generatedStrengths = Array.from(strengths).slice(0, 4);
      const generatedWeaknesses = Array.from(weaknesses).slice(0, 4);
      const generatedImprovementAreas = Array.from(improvementAreas).slice(
        0,
        4,
      );
      const generatedRecommendations = Array.from(recommendations).slice(0, 3);

      let overallAssessment =
        "The candidate demonstrated a reasonable understanding of the interview topic with some areas to strengthen.";
      if (actualScore >= 80) {
        overallAssessment =
          "The candidate provided a strong, relevant set of answers with clear technical reasoning and practical examples.";
      } else if (actualScore >= 50) {
        overallAssessment =
          "The candidate showed useful understanding and relevant thinking, but a few answers would benefit from deeper detail and stronger structure.";
      } else if (actualScore >= 25) {
        overallAssessment =
          "The candidate showed some relevant awareness, but the interview evidence suggests incomplete understanding and limited depth.";
      }

      return {
        actualScore,
        overallAssessment,
        strengths:
          generatedStrengths.length > 0
            ? generatedStrengths
            : ["Consistent participation in the interview."],
        weaknesses:
          generatedWeaknesses.length > 0
            ? generatedWeaknesses
            : ["No major weaknesses were evident in the captured evidence."],
        improvementAreas:
          generatedImprovementAreas.length > 0
            ? generatedImprovementAreas
            : ["Add more depth and structure to future answers."],
        actionableRecommendations:
          generatedRecommendations.length > 0
            ? generatedRecommendations
            : ["Use examples and reasoning to answer more concretely."],
        evidenceSummary: `Evaluation for ${topic} used ${normalizedTurns.length} captured answer(s) and their stored analysis evidence.`,
        generatedAt,
      };
    },
  };
}
