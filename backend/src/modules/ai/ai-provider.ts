export type AnswerQualityCategory =
  | "strong"
  | "partial"
  | "weak"
  | "irrelevant"
  | "unclear";

export type AnswerAnalysisInput = {
  question: string;
  answer: string;
  interviewType: string;
  topic: string;
  difficulty: string;
  language: string;
  mode: string;
};

export type AnswerAnalysis = {
  category: AnswerQualityCategory;
  technicalCorrectness: {
    assessment: string;
    uncertain: boolean;
  };
  relevance: {
    assessment: string;
    uncertain: boolean;
  };
  completeness: {
    assessment: string;
    uncertain: boolean;
  };
  explanationQuality: {
    assessment: string;
    uncertain: boolean;
  };
  reasoning: {
    assessment: string;
    uncertain: boolean;
  };
  strengths: string[];
  missingImportantPoints: string[];
  improvementOpportunities: string[];
  analysisNotes: string;
};

export type FollowUpDecision = {
  shouldFollowUp: boolean;
  reason: string;
  followUpQuestion: string | null;
};

export type FollowUpInput = {
  question: string;
  answer: string;
  analysis: AnswerAnalysis;
  interviewType: string;
  topic: string;
  difficulty: string;
  language: string;
  mode: string;
};

export type AiProvider = {
  analyzeAnswer: (input: AnswerAnalysisInput) => Promise<AnswerAnalysis>;
  decideFollowUp: (input: FollowUpInput) => Promise<FollowUpDecision>;
};

function buildFallbackAnalysis(input: AnswerAnalysisInput): AnswerAnalysis {
  const answer = input.answer.trim();
  const hasAnswer = answer.length >= 12;
  const lowerAnswer = answer.toLowerCase();
  const hasRelevantKeyword =
    lowerAnswer.includes(input.topic.toLowerCase()) ||
    lowerAnswer.includes("because") ||
    lowerAnswer.includes("example") ||
    lowerAnswer.includes("reason") ||
    lowerAnswer.includes("understand") ||
    lowerAnswer.includes("when") ||
    lowerAnswer.includes("if");

  if (!hasAnswer) {
    return {
      category: "unclear",
      technicalCorrectness: {
        assessment: "The answer is too brief to assess meaningfully.",
        uncertain: true,
      },
      relevance: {
        assessment: "No clear answer was provided yet.",
        uncertain: true,
      },
      completeness: {
        assessment: "The response is incomplete.",
        uncertain: true,
      },
      explanationQuality: {
        assessment: "The explanation is not complete enough to judge.",
        uncertain: true,
      },
      reasoning: {
        assessment: "Reasoning is not yet sufficiently visible.",
        uncertain: true,
      },
      strengths: [],
      missingImportantPoints: [
        "A more complete response will help evaluation.",
      ],
      improvementOpportunities: [
        "Provide a more concrete explanation and one example.",
      ],
      analysisNotes:
        "The candidate answer was too brief to assess confidently.",
    };
  }

  const isStrong =
    hasRelevantKeyword &&
    (lowerAnswer.length > 120 ||
      /example|because|therefore|however/.test(lowerAnswer));
  const isWeak = /i dont know|not sure|maybe|unclear/.test(lowerAnswer);
  const isIrrelevant =
    !hasRelevantKeyword &&
    !lowerAnswer.includes(input.question.toLowerCase().split(" ")[0] ?? "");

  const category: AnswerQualityCategory = isStrong
    ? "strong"
    : isIrrelevant
      ? "irrelevant"
      : isWeak
        ? "weak"
        : "partial";

  return {
    category,
    technicalCorrectness: {
      assessment:
        category === "strong"
          ? "The answer demonstrates the main idea accurately."
          : category === "weak"
            ? "The answer shows uncertainty or gaps in technical understanding."
            : "The answer contains some relevant understanding but may need more detail.",
      uncertain: category === "partial",
    },
    relevance: {
      assessment:
        category === "irrelevant"
          ? "The answer does not meaningfully address the question."
          : "The answer addresses the requested topic with reasonable relevance.",
      uncertain: category === "partial",
    },
    completeness: {
      assessment:
        category === "strong"
          ? "The answer covers the key points needed for the question."
          : category === "weak"
            ? "The answer is missing important content needed to answer well."
            : "The answer covers some core points but leaves gaps.",
      uncertain: category === "partial",
    },
    explanationQuality: {
      assessment:
        category === "strong"
          ? "The explanation is clear and easy to follow."
          : category === "weak"
            ? "The explanation is not yet clear or precise enough."
            : "The explanation is understandable but could be more specific.",
      uncertain: category === "partial",
    },
    reasoning: {
      assessment:
        category === "strong"
          ? "The reasoning is sensible and appropriately justified."
          : category === "weak"
            ? "The reasoning is limited or weakly supported."
            : "The reasoning shows some understanding but needs more support.",
      uncertain: category === "partial",
    },
    strengths:
      category === "strong"
        ? [
            "Clear relevance to the question",
            "Useful supporting explanation",
            "Reasoning is grounded in the topic",
          ]
        : category === "partial"
          ? [
              "Some useful understanding is visible",
              "The answer touches the correct idea",
            ]
          : [],
    missingImportantPoints:
      category === "strong"
        ? ["No major missing points identified in the current answer."]
        : [
            "Add a more precise explanation of the core concept",
            "Include a practical example or key trade-off",
          ],
    improvementOpportunities:
      category === "strong"
        ? ["Add one edge case or deeper trade-off to strengthen the answer."]
        : [
            "Clarify the central concept",
            "Explain the reasoning with an example",
            "Add any missing crucial detail",
          ],
    analysisNotes:
      category === "strong"
        ? "This is a solid answer for the current question."
        : category === "irrelevant"
          ? "The answer does not closely address the asked question."
          : "The answer shows some understanding but needs more specificity and depth.",
  };
}

function buildFallbackFollowUpDecision(input: FollowUpInput): FollowUpDecision {
  const category = input.analysis.category;
  const shouldFollowUp = category === "weak" || category === "partial";

  if (!shouldFollowUp) {
    return {
      shouldFollowUp: false,
      reason:
        "The response is strong enough to continue to the next planned question.",
      followUpQuestion: null,
    };
  }

  const topic = input.topic.trim();
  const questionText = input.question.trim();
  const followUpQuestion = `Can you elaborate on the key point in your answer and explain how it applies to ${topic || "this topic"}?`;

  return {
    shouldFollowUp: true,
    reason:
      "The response needs a clarifying follow-up to probe the underlying reasoning.",
    followUpQuestion:
      questionText.length > 0
        ? followUpQuestion
        : "Could you explain that point more clearly?",
  };
}

export function createAiProviderBoundary(): AiProvider {
  return {
    async analyzeAnswer(input: AnswerAnalysisInput): Promise<AnswerAnalysis> {
      return buildFallbackAnalysis(input);
    },
    async decideFollowUp(input: FollowUpInput): Promise<FollowUpDecision> {
      return buildFallbackFollowUpDecision(input);
    },
  };
}
