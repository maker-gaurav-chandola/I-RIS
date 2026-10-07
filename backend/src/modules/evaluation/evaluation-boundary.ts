import type { AnswerAnalysis } from "../ai/ai-provider.js";

export type EvaluationEvidenceTurn = {
  question: string;
  answer: string;
  analysis?: AnswerAnalysis | null;
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

function scoreAnswer(question: string, answer: string): number {
  const normalizedQuestion = question.trim().toLowerCase();
  const normalizedAnswer = answer.trim();

  if (!normalizedAnswer) return 0;

  const words = normalizedAnswer.split(/\s+/).filter(Boolean).length;

  let score = 35;

  if (words >= 8) score += 10;
  if (words >= 20) score += 10;
  if (words >= 40) score += 10;

  if (normalizedQuestion.length > 0) {
    const questionWords = new Set(
      normalizedQuestion
        .split(/[^a-z0-9+#.]+/)
        .map((word) => word.trim())
        .filter((word) => word.length >= 4),
    );

    const answerWords = new Set(
      normalizedAnswer
        .toLowerCase()
        .split(/[^a-z0-9+#.]+/)
        .map((word) => word.trim())
        .filter((word) => word.length >= 4),
    );

    let relevantWords = 0;
    for (const word of questionWords) {
      if (answerWords.has(word)) relevantWords += 1;
    }

    if (relevantWords > 0) score += 10;
    if (relevantWords >= 2) score += 10;
  }

  if (/[.!?]/.test(normalizedAnswer)) score += 5;

  return clamp(score, 0, 100);
}

export function createEvaluationBoundary(): EvaluationBoundary {
  return {
    evaluate: ({ sessionId, topic, turns }) => {
      const normalizedTurns = turns.filter(
        (turn) => turn.answer.trim().length > 0,
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

      const scores = normalizedTurns.map((turn) =>
        scoreAnswer(turn.question, turn.answer),
      );

      const actualScore = clamp(
        Math.round(scores.reduce((total, score) => total + score, 0) / scores.length),
        0,
        100,
      );

      const strengths = new Set<string>();
      const weaknesses = new Set<string>();
      const improvementAreas = new Set<string>();
      const recommendations = new Set<string>();

      const averageWords =
        normalizedTurns.reduce(
          (total, turn) =>
            total +
            turn.answer.trim().split(/\s+/).filter(Boolean).length,
          0,
        ) / normalizedTurns.length;

      strengths.add("The candidate completed and attempted the captured interview questions.");

      if (actualScore >= 70) {
        strengths.add("Answers were generally relevant and sufficiently detailed.");
        recommendations.add(
          "Keep using structured reasoning and practical examples.",
        );
      } else {
        weaknesses.add("Some answers need more depth and precision.");
        improvementAreas.add(
          "Explain concepts with clearer reasoning and concrete examples.",
        );
        recommendations.add(
          "Give direct answers first, then support them with reasoning or examples.",
        );
      }

      if (averageWords < 8) {
        weaknesses.add("Several answers were too brief to demonstrate full understanding.");
        improvementAreas.add(
          "Expand short answers with explanation, reasoning, and examples.",
        );
      } else if (averageWords >= 30) {
        strengths.add("Answers contained enough detail to demonstrate reasoning.");
      }

      const generatedAt = new Date().toISOString();

      return {
        actualScore,
        overallAssessment:
          actualScore >= 80
            ? "The candidate demonstrated strong understanding with relevant and reasonably detailed answers."
            : actualScore >= 60
              ? "The candidate demonstrated a useful understanding of the topic, with some areas that need deeper explanation."
              : "The candidate showed some relevant understanding, but the captured answers need more depth, precision, and structure.",
        strengths: Array.from(strengths).slice(0, 4),
        weaknesses: Array.from(weaknesses).slice(0, 4),
        improvementAreas: Array.from(improvementAreas).slice(0, 4),
        actionableRecommendations: Array.from(recommendations).slice(0, 3),
        evidenceSummary: `Evaluation for ${topic} used ${normalizedTurns.length} captured answer(s) from the completed interview.`,
        generatedAt,
      };
    },
  };
}


