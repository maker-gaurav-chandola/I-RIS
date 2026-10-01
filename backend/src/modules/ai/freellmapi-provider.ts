import type {
  AiProvider,
  AnswerAnalysis,
  AnswerAnalysisInput,
  FollowUpDecision,
  FollowUpInput,
} from "./ai-provider.js";

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: unknown;
    };
  }>;
};

export type FreeLlmApiProviderOptions = {
  baseUrl: string;
  apiKey: string;
  model: string;
};

function parseJson<T>(content: string): T {
  const cleaned = content
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start >= 0 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1)) as T;
    }

    throw new Error("FreeLLMAPI returned invalid JSON.");
  }
}

function extractContent(data: ChatCompletionResponse): string {
  const content = data.choices?.[0]?.message?.content;

  if (typeof content !== "string" || !content.trim()) {
    throw new Error("FreeLLMAPI returned an empty response.");
  }

  return content.trim();
}

export function createFreeLlmApiProvider(
  options: FreeLlmApiProviderOptions,
): AiProvider {
  const endpoint =
    `${options.baseUrl.replace(/\/+$/, "")}/chat/completions`;

  async function complete(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<string> {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: options.model,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(
        `FreeLLMAPI request failed with HTTP ${response.status}${
          errorText ? `: ${errorText.slice(0, 500)}` : ""
        }`,
      );
    }

    return extractContent(
      (await response.json()) as ChatCompletionResponse,
    );
  }

  return {
    async analyzeAnswer(
      input: AnswerAnalysisInput,
    ): Promise<AnswerAnalysis> {
      const systemPrompt = `
You are the answer-analysis engine for I-RIS.

Analyze the candidate's answer against the interview question.

Return ONLY valid JSON. No markdown and no code fences.

Required structure:
{
  "category": "strong|partial|weak|irrelevant|unclear",
  "technicalCorrectness": {
    "assessment": "string",
    "uncertain": false
  },
  "relevance": {
    "assessment": "string",
    "uncertain": false
  },
  "completeness": {
    "assessment": "string",
    "uncertain": false
  },
  "explanationQuality": {
    "assessment": "string",
    "uncertain": false
  },
  "reasoning": {
    "assessment": "string",
    "uncertain": false
  },
  "strengths": ["string"],
  "missingImportantPoints": ["string"],
  "improvementOpportunities": ["string"],
  "analysisNotes": "string"
}

Do not invent facts.
If correctness cannot be established confidently, mark the relevant uncertain field true.
`.trim();

      const userPrompt = `
Interview type: ${input.interviewType}
Topic: ${input.topic}
Difficulty: ${input.difficulty}
Language: ${input.language}
Mode: ${input.mode}

Question:
${input.question}

Candidate answer:
${input.answer}
`.trim();

      return parseJson<AnswerAnalysis>(
        await complete(systemPrompt, userPrompt),
      );
    },

    async decideFollowUp(
      input: FollowUpInput,
    ): Promise<FollowUpDecision> {
      const systemPrompt = `
You are the contextual follow-up engine for I-RIS.

Decide whether one focused follow-up question is useful.

Return ONLY valid JSON. No markdown and no code fences.

Required structure:
{
  "shouldFollowUp": true,
  "reason": "string",
  "followUpQuestion": "string or null"
}

Ask a follow-up when the answer has an important gap,
unclear reasoning, or partial understanding.

Do not ask a follow-up when the answer is already strong
and sufficiently complete.

Ask at most one follow-up.
Respect the requested interview language.
`.trim();

      const userPrompt = `
Interview type: ${input.interviewType}
Topic: ${input.topic}
Difficulty: ${input.difficulty}
Language: ${input.language}
Mode: ${input.mode}

Question:
${input.question}

Candidate answer:
${input.answer}

Analysis:
${JSON.stringify(input.analysis)}
`.trim();

      return parseJson<FollowUpDecision>(
        await complete(systemPrompt, userPrompt),
      );
    },
  };
}
