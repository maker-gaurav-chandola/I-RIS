import { afterEach, describe, expect, it } from "vitest";
import type { Database } from "sql.js";
import { createDatabase } from "../../persistence/database.js";
import type { AiProvider } from "../ai/ai-provider.js";
import {
  SessionEngine,
  SessionEngineError,
  type SessionConfiguration,
} from "./session-engine.js";

const configuration: SessionConfiguration = {
  interviewType: "Technical Interview",
  topic: "JavaScript",
  difficulty: "Medium",
  duration: 15,
  language: "Hinglish",
  mode: "Text",
};

let database: Database;

afterEach(() => database?.close());

async function setup(): Promise<SessionEngine> {
  database = await createDatabase(":memory:");
  database.run(
    "INSERT INTO accounts (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
    [
      "account-1",
      "candidate@example.com",
      "test-hash",
      "2026-09-11T00:00:00.000Z",
    ],
  );
  return new SessionEngine(database);
}

function expectEngineError(action: () => unknown, code: string): void {
  try {
    action();
    throw new Error("Expected SessionEngineError");
  } catch (error) {
    expect(error).toBeInstanceOf(SessionEngineError);
    expect((error as SessionEngineError).code).toBe(code);
  }
}

describe("Interview Session Engine", () => {
  it("starts and persists an owned session with its configuration", async () => {
    const engine = await setup();
    const session = engine.start("account-1", configuration);

    expect(session.state).toBe("active");
    expect(session.currentQuestion).toContain("main concept");
    expect(session.accountId).toBe("account-1");
    expect(
      database.exec("SELECT COUNT(*) FROM interview_sessions")[0]
        ?.values[0]?.[0],
    ).toBe(1);
  });

  it("persists answers with consistent turns and advances questions", async () => {
    const engine = await setup();
    const session = engine.start("account-1", configuration);

    const next = await engine.submitAnswer(
      "account-1",
      session.id,
      "A clear answer",
    );
    const turn = database.exec(
      "SELECT turn_number, question, answer FROM interview_turns",
    )[0]?.values[0];

    expect(next.state).toBe("active");
    expect(next.questionIndex).toBe(1);
    expect(next.currentQuestion).toContain("practical example");
    expect(turn).toEqual([1, session.currentQuestion, "A clear answer"]);
  });

  it("moves to closing after all mock questions and waits for expected score", async () => {
    const engine = await setup();
    const session = engine.start("account-1", configuration);

    await engine.submitAnswer("account-1", session.id, "One");
    await engine.submitAnswer("account-1", session.id, "Two");
    const closing = await engine.submitAnswer("account-1", session.id, "Three");

    expect(closing.state).toBe("closing");
    expect(
      database.exec("SELECT COUNT(*) FROM interview_turns")[0]?.values[0]?.[0],
    ).toBe(3);
    await expect(
      engine.submitAnswer("account-1", session.id, "Again"),
    ).rejects.toMatchObject({ code: "INVALID_STATE" });
    const completed = engine.submitExpectedScore("account-1", session.id, 8.5);
    expect(completed.state).toBe("completed");
    expect(
      database.exec("SELECT COUNT(*) FROM evaluation_results")[0]
        ?.values[0]?.[0],
    ).toBe(0);
  });

  it("rejects invalid transitions and preserves early termination", async () => {
    const engine = await setup();
    await expect(
      engine.submitAnswer("account-1", "missing", "Answer"),
    ).rejects.toMatchObject({ code: "SESSION_NOT_FOUND" });

    const session = engine.start("account-1", configuration);
    const terminated = engine.terminate("account-1", session.id);
    expect(terminated.state).toBe("terminated");
    await expect(
      engine.submitAnswer("account-1", session.id, "Answer"),
    ).rejects.toMatchObject({ code: "INVALID_STATE" });
    expectEngineError(
      () => engine.terminate("account-1", session.id),
      "INVALID_STATE",
    );
  });

  it("prevents another account from reading or changing the session", async () => {
    const engine = await setup();
    database.run(
      "INSERT INTO accounts (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
      [
        "account-2",
        "other@example.com",
        "test-hash",
        "2026-09-11T00:00:00.000Z",
      ],
    );
    const session = engine.start("account-1", configuration);

    expectEngineError(
      () => engine.get("account-2", session.id),
      "SESSION_NOT_FOUND",
    );
    await expect(
      engine.submitAnswer("account-2", session.id, "No"),
    ).rejects.toMatchObject({ code: "SESSION_NOT_FOUND" });
  });

  it("marks an expired active session as closing through the engine", async () => {
    let current = new Date("2026-09-11T00:00:00.000Z");
    database = await createDatabase(":memory:");
    database.run(
      "INSERT INTO accounts (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
      [
        "account-1",
        "candidate@example.com",
        "test-hash",
        current.toISOString(),
      ],
    );
    const engine = new SessionEngine(database, undefined, () => current);
    const session = engine.start("account-1", {
      ...configuration,
      duration: 1,
    });

    current = new Date(current.getTime() + 60_001);
    const expired = engine.get("account-1", session.id);

    expect(expired.state).toBe("closing");
    expect(expired.currentQuestion).toBeNull();
  });

  it("stores structured answer analysis for a valid response", async () => {
    const engine = await setup();
    const session = engine.start("account-1", configuration);
    const provider: AiProvider = {
      async analyzeAnswer() {
        return {
          category: "strong",
          technicalCorrectness: {
            assessment: "Correct and relevant.",
            uncertain: false,
          },
          relevance: {
            assessment: "Directly answers the question.",
            uncertain: false,
          },
          completeness: {
            assessment: "Covers the essential points.",
            uncertain: false,
          },
          explanationQuality: {
            assessment: "Clear and well explained.",
            uncertain: false,
          },
          reasoning: { assessment: "Good reasoning shown.", uncertain: false },
          strengths: ["Clear explanation", "Relevant example"],
          missingImportantPoints: [],
          improvementOpportunities: ["Add one real-world edge case"],
          analysisNotes: "Strong answer overall.",
        };
      },
      async decideFollowUp() {
        return {
          shouldFollowUp: false,
          reason: "Strong answer.",
          followUpQuestion: null,
        };
      },
    };

    const withAnalysis = new SessionEngine(
      database,
      undefined,
      undefined,
      provider,
    );
    const next = await withAnalysis.submitAnswer(
      "account-1",
      session.id,
      "A solid answer with a practical example and reasoning.",
    );

    expect(next.lastTurnAnalysisStatus).toBe("completed");
    expect(next.lastTurnAnalysis?.category).toBe("strong");
    expect(next.currentQuestion).toContain("practical example");
    expect(
      database.exec(
        "SELECT analysis_status FROM interview_turns WHERE turn_number = 1",
      )[0]?.values[0]?.[0],
    ).toBe("completed");
  });

  it("generates a single bounded follow-up for a weak answer and continues from it", async () => {
    const engine = await setup();
    const session = engine.start("account-1", configuration);
    const provider: AiProvider = {
      async analyzeAnswer() {
        return {
          category: "partial",
          technicalCorrectness: {
            assessment: "Some understanding.",
            uncertain: true,
          },
          relevance: { assessment: "Mostly relevant.", uncertain: true },
          completeness: { assessment: "Missing key detail.", uncertain: true },
          explanationQuality: {
            assessment: "Underdeveloped explanation.",
            uncertain: true,
          },
          reasoning: { assessment: "Reasoning is thin.", uncertain: true },
          strengths: ["Relevant idea"],
          missingImportantPoints: ["Need one concrete example"],
          improvementOpportunities: ["Add more depth"],
          analysisNotes: "Needs follow-up.",
        };
      },
      async decideFollowUp() {
        return {
          shouldFollowUp: true,
          reason: "Need clarification.",
          followUpQuestion:
            "Can you explain the main trade-off behind that idea?",
        };
      },
    };

    const withFollowUp = new SessionEngine(
      database,
      undefined,
      undefined,
      provider,
    );
    const afterAnswer = await withFollowUp.submitAnswer(
      "account-1",
      session.id,
      "A short answer that needs clarification.",
    );

    expect(afterAnswer.pendingFollowUpQuestion).toBe(
      "Can you explain the main trade-off behind that idea?",
    );
    expect(afterAnswer.currentQuestion).toBe(
      "Can you explain the main trade-off behind that idea?",
    );

    const afterFollowUp = await withFollowUp.submitAnswer(
      "account-1",
      session.id,
      "The trade-off is that the approach is simpler but less scalable.",
    );

    expect(afterFollowUp.pendingFollowUpQuestion).toBeNull();
    expect(afterFollowUp.currentQuestion).toContain("practical example");
  });

  it("falls back to the next planned question when follow-up generation fails", async () => {
    const engine = await setup();
    const session = engine.start("account-1", configuration);
    const provider: AiProvider = {
      async analyzeAnswer() {
        return {
          category: "weak",
          technicalCorrectness: { assessment: "Thin answer.", uncertain: true },
          relevance: { assessment: "Somewhat relevant.", uncertain: true },
          completeness: { assessment: "Not enough depth.", uncertain: true },
          explanationQuality: { assessment: "Unclear.", uncertain: true },
          reasoning: { assessment: "Reasoning is weak.", uncertain: true },
          strengths: [],
          missingImportantPoints: ["Add reasoning"],
          improvementOpportunities: ["Use an example"],
          analysisNotes: "Weak answer.",
        };
      },
      async decideFollowUp() {
        throw new Error("AI follow-up unavailable");
      },
    };

    const withFallback = new SessionEngine(
      database,
      undefined,
      undefined,
      provider,
    );
    const next = await withFallback.submitAnswer(
      "account-1",
      session.id,
      "A weak answer that triggers fallback behavior.",
    );

    expect(next.pendingFollowUpQuestion).toBeNull();
    expect(next.currentQuestion).toContain("practical example");
    expect(next.lastTurnAnalysisStatus).toBe("completed");
    expect(
      database.exec("SELECT COUNT(*) FROM interview_turns")[0]?.values[0]?.[0],
    ).toBe(1);
  });

  it("handles a malformed AI analysis response as a failed turn", async () => {
    const engine = await setup();
    const session = engine.start("account-1", configuration);

    const malformedProvider: AiProvider = {
      async analyzeAnswer() {
        return null as never;
      },
      async decideFollowUp() {
        return {
          shouldFollowUp: false,
          reason: "Not reached because analysis response was malformed.",
          followUpQuestion: null,
        };
      },
    };

    const withValidation = new SessionEngine(
      database,
      undefined,
      undefined,
      malformedProvider,
    );

    const next = await withValidation.submitAnswer(
      "account-1",
      session.id,
      "A candidate answer with an invalid AI analysis response.",
    );

    expect(next.state).toBe("active");
    expect(next.currentQuestion).toContain("practical example");
    expect(next.lastTurnAnalysisStatus).toBe("failed");

    expect(
      database.exec(
        "SELECT analysis_status FROM interview_turns WHERE turn_number = 1",
      )[0]?.values[0]?.[0],
    ).toBe("failed");
  });

  it("handles a malformed follow-up response through the fallback path", async () => {
    const engine = await setup();
    const session = engine.start("account-1", configuration);

    const malformedProvider: AiProvider = {
      async analyzeAnswer() {
        return {
          category: "weak",
          technicalCorrectness: { assessment: "Thin answer.", uncertain: true },
          relevance: { assessment: "Relevant.", uncertain: true },
          completeness: { assessment: "Incomplete.", uncertain: true },
          explanationQuality: { assessment: "Needs detail.", uncertain: true },
          reasoning: { assessment: "Weak reasoning.", uncertain: true },
          strengths: [],
          missingImportantPoints: ["Add reasoning"],
          improvementOpportunities: ["Explain the trade-off"],
          analysisNotes: "Needs follow-up.",
        };
      },
      async decideFollowUp() {
        return {
          shouldFollowUp: true,
          reason: "Needs clarification.",
          followUpQuestion: null,
        } as never;
      },
    };

    const withValidation = new SessionEngine(
      database,
      undefined,
      undefined,
      malformedProvider,
    );

    const next = await withValidation.submitAnswer(
      "account-1",
      session.id,
      "A weak answer with a malformed follow-up response.",
    );

    expect(next.state).toBe("active");
    expect(next.pendingFollowUpQuestion).toBeNull();
    expect(next.currentQuestion).toContain("practical example");
    expect(next.lastTurnAnalysisStatus).toBe("completed");

    expect(
      database.exec(
        "SELECT analysis_status FROM interview_turns WHERE turn_number = 1",
      )[0]?.values[0]?.[0],
    ).toBe("completed");
  });
  it("keeps the answer and session active when AI analysis fails", async () => {
    const engine = await setup();
    const session = engine.start("account-1", configuration);
    const failingProvider: AiProvider = {
      async analyzeAnswer() {
        throw new Error("AI unavailable");
      },
      async decideFollowUp() {
        return {
          shouldFollowUp: false,
          reason: "Not reached because analysis failed.",
          followUpQuestion: null,
        };
      },
    };

    const withAnalysis = new SessionEngine(
      database,
      undefined,
      undefined,
      failingProvider,
    );
    const next = await withAnalysis.submitAnswer(
      "account-1",
      session.id,
      "A candidate answer that was saved but could not be analyzed.",
    );

    expect(next.state).toBe("active");
    expect(next.lastTurnAnalysisStatus).toBe("failed");
    expect(
      database.exec("SELECT COUNT(*) FROM interview_turns")[0]?.values[0]?.[0],
    ).toBe(1);
    expect(
      database.exec(
        "SELECT analysis_status, analysis_error FROM interview_turns WHERE turn_number = 1",
      )[0]?.values[0]?.[0],
    ).toBe("failed");
  });

  it("moves expired sessions into closing before the expected score is captured", async () => {
    let current = new Date("2026-09-11T00:00:00.000Z");
    database = await createDatabase(":memory:");
    database.run(
      "INSERT INTO accounts (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
      [
        "account-1",
        "candidate@example.com",
        "test-hash",
        current.toISOString(),
      ],
    );
    const engine = new SessionEngine(database, undefined, () => current);
    const session = engine.start("account-1", {
      ...configuration,
      duration: 1,
    });

    current = new Date(current.getTime() + 60_001);
    const expired = engine.get("account-1", session.id);

    expect(expired.state).toBe("closing");
    expect(expired.currentQuestion).toBeNull();
    await expect(
      engine.submitAnswer(
        "account-1",
        session.id,
        "This answer should not be accepted.",
      ),
    ).rejects.toMatchObject({ code: "INVALID_STATE" });
  });

  it("captures expected score and completes the interview only after closing", async () => {
    const engine = await setup();
    const session = engine.start("account-1", configuration);
    const closing = engine.beginClosing("account-1", session.id);

    expect(closing.state).toBe("closing");
    await expect(
      engine.submitAnswer("account-1", session.id, "Not allowed in closing."),
    ).rejects.toMatchObject({ code: "INVALID_STATE" });

    const completed = engine.submitExpectedScore("account-1", session.id, 8.5);

    expect(completed.state).toBe("completed");
    expect(completed.expectedScore).toBe(8.5);
    expect(
      database.exec(
        "SELECT expected_score FROM interview_sessions WHERE id = ?",
        [session.id],
      )[0]?.values[0]?.[0],
    ).toBe(8.5);
  });

  it("generates final evaluation from stored interview evidence and keeps expected score separate", async () => {
    const engine = await setup();
    const session = engine.start("account-1", configuration);

    await engine.submitAnswer(
      "account-1",
      session.id,
      "A strong answer with clear reasoning and a practical example.",
    );
    engine.beginClosing("account-1", session.id);
    engine.submitExpectedScore("account-1", session.id, 95);

    const evaluation = engine.generateEvaluation("account-1", session.id);

    expect(evaluation.actualScore).toBeGreaterThan(0);
    expect(evaluation.actualScore).toBeLessThanOrEqual(100);
    expect(evaluation.actualScore).not.toBe(95);
    expect(evaluation.overallAssessment.length).toBeGreaterThan(0);
    expect(evaluation.strengths.length).toBeGreaterThan(0);
    expect(evaluation.weaknesses.length).toBeGreaterThanOrEqual(0);
    expect(
      database.exec(
        "SELECT actual_score FROM evaluation_results WHERE interview_session_id = ?",
        [session.id],
      )[0]?.values[0]?.[0],
    ).toBeCloseTo(evaluation.actualScore, 2);
  });

  it("blocks final evaluation for active and closing sessions", async () => {
    const engine = await setup();
    const session = engine.start("account-1", configuration);

    expectEngineError(
      () => engine.generateEvaluation("account-1", session.id),
      "INVALID_STATE",
    );

    engine.beginClosing("account-1", session.id);
    expectEngineError(
      () => engine.generateEvaluation("account-1", session.id),
      "INVALID_STATE",
    );
  });

  it("recovers persisted question state after a SessionEngine restart", async () => {
    database = await createDatabase(":memory:");

    database.run(
      "INSERT INTO accounts (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
      [
        "account-1",
        "candidate@example.com",
        "test-hash",
        "2026-09-11T00:00:00.000Z",
      ],
    );

    const provider: AiProvider = {
      async analyzeAnswer() {
        return {
          category: "partial",
          technicalCorrectness: {
            assessment: "Some understanding.",
            uncertain: true,
          },
          relevance: {
            assessment: "Mostly relevant.",
            uncertain: true,
          },
          completeness: {
            assessment: "Missing key detail.",
            uncertain: true,
          },
          explanationQuality: {
            assessment: "Underdeveloped explanation.",
            uncertain: true,
          },
          reasoning: {
            assessment: "Reasoning is thin.",
            uncertain: true,
          },
          strengths: ["Relevant idea"],
          missingImportantPoints: ["Need one concrete example"],
          improvementOpportunities: ["Add more depth"],
          analysisNotes: "Needs follow-up.",
        };
      },
      async decideFollowUp() {
        return {
          shouldFollowUp: true,
          reason: "Need clarification.",
          followUpQuestion:
            "Can you explain the main trade-off behind that idea?",
        };
      },
    };

    const firstEngine = new SessionEngine(
      database,
      undefined,
      undefined,
      provider,
    );

    const session = firstEngine.start("account-1", configuration);

    const afterAnswer = await firstEngine.submitAnswer(
      "account-1",
      session.id,
      "A short answer that needs clarification.",
    );

    expect(afterAnswer.pendingFollowUpQuestion).toBe(
      "Can you explain the main trade-off behind that idea?",
    );

    const persisted = database.exec(
      "SELECT planned_question_index, pending_follow_up_question, pending_follow_up_parent_question FROM interview_sessions WHERE id = ?",
      [session.id],
    )[0]?.values[0];

    expect(persisted?.[0]).toBe(0);
    expect(persisted?.[1]).toBe(
      "Can you explain the main trade-off behind that idea?",
    );
    expect(persisted?.[2]).toBe(session.currentQuestion);

    const restartedEngine = new SessionEngine(
      database,
      undefined,
      undefined,
      provider,
    );

    const recovered = restartedEngine.get("account-1", session.id);

    expect(recovered.state).toBe("active");
    expect(recovered.pendingFollowUpQuestion).toBe(
      "Can you explain the main trade-off behind that idea?",
    );
    expect(recovered.currentQuestion).toBe(
      "Can you explain the main trade-off behind that idea?",
    );

    const afterFollowUp = await restartedEngine.submitAnswer(
      "account-1",
      session.id,
      "The trade-off is simplicity versus scalability.",
    );

    expect(afterFollowUp.pendingFollowUpQuestion).toBeNull();
    expect(afterFollowUp.currentQuestion).toContain("practical example");

    const finalPersisted = database.exec(
      "SELECT planned_question_index, pending_follow_up_question, pending_follow_up_parent_question FROM interview_sessions WHERE id = ?",
      [session.id],
    )[0]?.values[0];

    expect(finalPersisted?.[0]).toBe(1);
    expect(finalPersisted?.[1]).toBeNull();
    expect(finalPersisted?.[2]).toBeNull();
  });
  it("rejects Voice mode without pretending voice is implemented", async () => {
    const engine = await setup();
    expectEngineError(
      () => engine.start("account-1", { ...configuration, mode: "Voice" }),
      "VOICE_UNSUPPORTED",
    );
  });
});





