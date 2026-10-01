import { describe, expect, it, vi } from "vitest";
import { createFreeLlmApiProvider } from "./freellmapi-provider.js";

const baseOptions = {
  baseUrl: "http://localhost:3001/v1",
  apiKey: "test-key",
  model: "auto",
};

describe("FreeLLMAPI provider", () => {
  it("sends analyzeAnswer requests to the OpenAI-compatible chat endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  category: "strong",
                  technicalCorrectness: {
                    assessment: "Correct",
                    uncertain: false,
                  },
                  relevance: {
                    assessment: "Relevant",
                    uncertain: false,
                  },
                  completeness: {
                    assessment: "Complete",
                    uncertain: false,
                  },
                  explanationQuality: {
                    assessment: "Clear",
                    uncertain: false,
                  },
                  reasoning: {
                    assessment: "Sound",
                    uncertain: false,
                  },
                  strengths: ["Clear explanation"],
                  missingImportantPoints: [],
                  improvementOpportunities: ["Add an edge case"],
                  analysisNotes: "Good answer.",
                }),
              },
            },
          ],
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

    vi.stubGlobal("fetch", fetchMock);

    const provider = createFreeLlmApiProvider(baseOptions);

    const result = await provider.analyzeAnswer({
      question: "What is a closure in JavaScript?",
      answer: "A closure allows a function to remember variables from its outer scope.",
      interviewType: "Technical",
      topic: "JavaScript",
      difficulty: "medium",
      language: "Hinglish",
      mode: "text",
    });

    expect(result.category).toBe("strong");

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, request] = fetchMock.mock.calls[0];

    expect(url).toBe("http://localhost:3001/v1/chat/completions");
    expect(request.method).toBe("POST");
    expect(request.headers.Authorization).toBe("Bearer test-key");
    expect(request.headers["Content-Type"]).toBe("application/json");

    const body = JSON.parse(request.body);

    expect(body.model).toBe("auto");
    expect(body.temperature).toBe(0.2);
    expect(body.messages).toHaveLength(2);
    expect(body.messages[0].role).toBe("system");
    expect(body.messages[1].role).toBe("user");
    expect(body.messages[1].content).toContain(
      "What is a closure in JavaScript?",
    );

    vi.unstubAllGlobals();
  });

  it("parses JSON wrapped in a markdown code fence", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: `\`\`\`json
{
  "category": "partial",
  "technicalCorrectness": {
    "assessment": "Mostly correct",
    "uncertain": false
  },
  "relevance": {
    "assessment": "Relevant",
    "uncertain": false
  },
  "completeness": {
    "assessment": "Some gaps",
    "uncertain": true
  },
  "explanationQuality": {
    "assessment": "Understandable",
    "uncertain": false
  },
  "reasoning": {
    "assessment": "Needs more support",
    "uncertain": true
  },
  "strengths": ["Relevant concept"],
  "missingImportantPoints": ["Example"],
  "improvementOpportunities": ["Add an example"],
  "analysisNotes": "Partial answer."
}
\`\`\``,
              },
            },
          ],
        }),
      ),
    );

    vi.stubGlobal("fetch", fetchMock);

    const provider = createFreeLlmApiProvider(baseOptions);

    const result = await provider.analyzeAnswer({
      question: "Explain promises.",
      answer: "Promises represent a future result.",
      interviewType: "Technical",
      topic: "JavaScript",
      difficulty: "easy",
      language: "English",
      mode: "text",
    });

    expect(result.category).toBe("partial");
    expect(result.missingImportantPoints).toEqual(["Example"]);

    vi.unstubAllGlobals();
  });

  it("returns a follow-up decision from the AI response", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  shouldFollowUp: true,
                  reason: "The answer needs clarification.",
                  followUpQuestion:
                    "Can you explain why closures are useful in practice?",
                }),
              },
            },
          ],
        }),
      ),
    );

    vi.stubGlobal("fetch", fetchMock);

    const provider = createFreeLlmApiProvider(baseOptions);

    const result = await provider.decideFollowUp({
      question: "What is a closure?",
      answer: "It remembers variables.",
      analysis: {
        category: "partial",
        technicalCorrectness: {
          assessment: "Partially correct",
          uncertain: true,
        },
        relevance: {
          assessment: "Relevant",
          uncertain: false,
        },
        completeness: {
          assessment: "Incomplete",
          uncertain: true,
        },
        explanationQuality: {
          assessment: "Brief",
          uncertain: true,
        },
        reasoning: {
          assessment: "Limited",
          uncertain: true,
        },
        strengths: ["Basic understanding"],
        missingImportantPoints: ["Practical use"],
        improvementOpportunities: ["Give an example"],
        analysisNotes: "Needs probing.",
      },
      interviewType: "Technical",
      topic: "JavaScript",
      difficulty: "medium",
      language: "Hinglish",
      mode: "text",
    });

    expect(result.shouldFollowUp).toBe(true);
    expect(result.followUpQuestion).toContain("closures");

    vi.unstubAllGlobals();
  });

  it("throws a useful error when FreeLLMAPI returns an HTTP error", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("Unauthorized", {
        status: 401,
        statusText: "Unauthorized",
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    const provider = createFreeLlmApiProvider(baseOptions);

    await expect(
      provider.analyzeAnswer({
        question: "What is JavaScript?",
        answer: "A programming language.",
        interviewType: "Technical",
        topic: "JavaScript",
        difficulty: "easy",
        language: "English",
        mode: "text",
      }),
    ).rejects.toThrow("FreeLLMAPI request failed with HTTP 401");

    vi.unstubAllGlobals();
  });

  it("throws when FreeLLMAPI returns invalid JSON content", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: "This is not valid JSON",
              },
            },
          ],
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

    vi.stubGlobal("fetch", fetchMock);

    const provider = createFreeLlmApiProvider(baseOptions);

    await expect(
      provider.analyzeAnswer({
        question: "What is a promise?",
        answer: "It handles asynchronous results.",
        interviewType: "Technical",
        topic: "JavaScript",
        difficulty: "medium",
        language: "English",
        mode: "text",
      }),
    ).rejects.toThrow("FreeLLMAPI returned invalid JSON.");

    vi.unstubAllGlobals();
  });
});
