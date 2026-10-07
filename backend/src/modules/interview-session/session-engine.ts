import { randomUUID } from "node:crypto";
import type { Database } from "sql.js";
import type { AppConfig } from "../../config.js";
import { createFreeLlmApiProvider } from "../ai/freellmapi-provider.js";
import {
  createAiProviderBoundary,
  type AiProvider,
  type AnswerAnalysis,
  type FollowUpDecision,
} from "../ai/ai-provider.js";
import {
  createEvaluationBoundary,
  type EvaluationResult,
} from "../evaluation/evaluation-boundary.js";
import {
  createQuestionProvider,
  type QuestionProvider,
} from "./question-provider.js";

export type SessionState =
  | "not_started"
  | "active"
  | "closing"
  | "completed"
  | "terminated";

export type SessionConfiguration = {
  interviewType: string;
  topic: string;
  difficulty: string;
  duration: number;
  language: string;
  mode: string;
};


export type SessionSnapshot = SessionConfiguration & {
  id: string;
  accountId: string;
  state: SessionState;
  currentQuestion: string | null;
  pendingFollowUpQuestion: string | null;
  questionIndex: number;
  turnCount: number;
  expectedScore: number | null;
  startedAt: string;
  completedAt: string | null;
};

export class SessionEngineError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

type SessionRow = Record<string, unknown>;

function firstRow(
  database: Database,
  query: string,
  params: (string | number | null)[] = [],
): SessionRow | null {
  const result = database.exec(query, params);
  const columns = result[0]?.columns;
  const values = result[0]?.values[0];
  if (!columns || !values) return null;
  return Object.fromEntries(
    columns.map((column, index) => [column, values[index]]),
  );
}

function toState(value: unknown): SessionState {
  if (
    value === "active" ||
    value === "closing" ||
    value === "completed" ||
    value === "terminated"
  )
    return value;
  return "not_started";
}

export class SessionEngine {

  constructor(
    private readonly database: Database,
    private readonly questions: QuestionProvider = createQuestionProvider(),
    private readonly now: () => Date = () => new Date(),
    private readonly aiProvider: AiProvider = createAiProviderBoundary(),
    private readonly evaluationBoundary = createEvaluationBoundary(),
  ) {}

  start(
    accountId: string,
    configuration: SessionConfiguration,
  ): SessionSnapshot {
    if (configuration.mode !== "Text" && configuration.mode !== "Voice") {
      throw new SessionEngineError(
        "UNSUPPORTED_MODE",
        "Only Text and Voice modes are supported.",
      );
    }
    const allowedDurations = [5, 10, 15, 20, 30];
    if (!allowedDurations.includes(configuration.duration)) {
      throw new SessionEngineError(
        "INVALID_DURATION",
        "Session duration must be one of 5, 10, 15, 20, or 30 minutes.",
      );
    }

    const id = randomUUID();
    const startedAt = this.now().toISOString();
    this.database.run(
      `INSERT INTO interview_sessions
        (id, account_id, interview_type, topic, difficulty, duration_minutes, language, mode, planned_question_index, pending_follow_up_question, pending_follow_up_parent_question, status, started_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, NULL, NULL, 'active', ?, ?)`,
      [
        id,
        accountId,
        configuration.interviewType,
        configuration.topic,
        configuration.difficulty,
        configuration.duration,
        configuration.language,
        configuration.mode,
        startedAt,
        startedAt,
      ],
    );
    return this.get(accountId, id);
  }

  get(accountId: string, sessionId: string): SessionSnapshot {
    const row = firstRow(
      this.database,
      "SELECT * FROM interview_sessions WHERE id = ? AND account_id = ?",
      [sessionId, accountId],
    );
    if (!row)
      throw new SessionEngineError(
        "SESSION_NOT_FOUND",
        "Interview session was not found.",
      );

    let state = toState(row.status);
    if (
      state === "active" &&
      this.hasExpired(row.started_at, row.duration_minutes)
    ) {
      this.database.run(
      "UPDATE interview_sessions SET status = 'closing', completed_at = NULL, pending_follow_up_question = NULL, pending_follow_up_parent_question = NULL WHERE id = ? AND account_id = ? AND status IN ('active', 'closing')",
      [sessionId, accountId],
      );
      state = "closing";
    }

    const turns = this.database.exec(
      "SELECT COUNT(*) AS count FROM interview_turns WHERE interview_session_id = ?",
      [sessionId],
    );
    const turnCount = Number(turns[0]?.values[0]?.[0] ?? 0);
    const plannedQuestionIndex = Number(row.planned_question_index ?? 0);
    const pendingFollowUpQuestion =
      row.pending_follow_up_question != null
        ? String(row.pending_follow_up_question)
        : null;


    return {
      id: String(row.id),
      accountId: String(row.account_id),
      interviewType: String(row.interview_type),
      topic: String(row.topic),
      difficulty: String(row.difficulty),
      duration: Number(row.duration_minutes),
      language: String(row.language),
      mode: String(row.mode),
      state,
      currentQuestion:
        state === "active"
          ? (pendingFollowUpQuestion ??
            this.questions.getQuestion(plannedQuestionIndex))
          : null,
      pendingFollowUpQuestion,
      questionIndex: turnCount,
      turnCount,
      expectedScore:
        row.expected_score != null ? Number(row.expected_score) : null,
      startedAt: String(row.started_at),
      completedAt: row.completed_at ? String(row.completed_at) : null,
    };
  }

  async submitAnswer(
    accountId: string,
    sessionId: string,
    answer: string,
  ): Promise<SessionSnapshot> {
    const session = this.get(accountId, sessionId);
    if (session.state !== "active") {
      throw new SessionEngineError(
        "INVALID_STATE",
        "Answers can only be submitted to an active session.",
      );
    }
    if (!answer.trim())
      throw new SessionEngineError("INVALID_ANSWER", "Answer cannot be empty.");
    if (!session.currentQuestion)
      throw new SessionEngineError("NO_QUESTION", "No question is available.");

    const turnId = randomUUID();
    const safeAnswer = answer.trim();
    const isFollowUpAnswer = session.pendingFollowUpQuestion !== null;
    const questionToPersist = session.currentQuestion ?? null;
    this.database.run(
      `INSERT INTO interview_turns (id, interview_session_id, turn_number, question, answer, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        turnId,
        sessionId,
        session.turnCount + 1,
        questionToPersist,
        safeAnswer,
        this.now().toISOString(),
      ],
    );

    let plannedQuestionIndex = Number(
      firstRow(
        this.database,
        "SELECT planned_question_index FROM interview_sessions WHERE id = ? AND account_id = ?",
        [sessionId, accountId],
      )?.planned_question_index ?? 0,
    );
    let followUpDecision: FollowUpDecision | null = null;

    try {
const analysis = await this.aiProvider.analyzeAnswer({
        question: questionToPersist ?? "",
        answer: safeAnswer,
        interviewType: session.interviewType,
        topic: session.topic,
        difficulty: session.difficulty,
        language: session.language,
        mode: session.mode,
      });
this.validateAnalysis(analysis);

      if (!isFollowUpAnswer) {
        try {
followUpDecision = await this.aiProvider.decideFollowUp({
            question: questionToPersist ?? "",
            answer: safeAnswer,
            analysis,
            interviewType: session.interviewType,
            topic: session.topic,
            difficulty: session.difficulty,
            language: session.language,
            mode: session.mode,
          });
this.validateFollowUpDecision(followUpDecision);
          if (
            followUpDecision.shouldFollowUp &&
            followUpDecision.followUpQuestion
          ) {
            this.database.run(
              "UPDATE interview_sessions SET pending_follow_up_question = ?, pending_follow_up_parent_question = ? WHERE id = ? AND account_id = ?",
              [
                followUpDecision.followUpQuestion,
                questionToPersist ?? "",
                sessionId,
                accountId,
              ],
            );
          } else {
            plannedQuestionIndex += 1;
            this.database.run(
              "UPDATE interview_sessions SET planned_question_index = ?, pending_follow_up_question = NULL, pending_follow_up_parent_question = NULL WHERE id = ? AND account_id = ?",
              [plannedQuestionIndex, sessionId, accountId],
            );
          }
        } catch {
          plannedQuestionIndex += 1;
          this.database.run(
            "UPDATE interview_sessions SET planned_question_index = ?, pending_follow_up_question = NULL, pending_follow_up_parent_question = NULL WHERE id = ? AND account_id = ?",
            [plannedQuestionIndex, sessionId, accountId],
          );
        }
      } else {
        plannedQuestionIndex += 1;
        this.database.run(
          "UPDATE interview_sessions SET planned_question_index = ?, pending_follow_up_question = NULL, pending_follow_up_parent_question = NULL WHERE id = ? AND account_id = ?",
          [plannedQuestionIndex, sessionId, accountId],
        );
      }
    } catch (error) {
      if (!isFollowUpAnswer) {
        plannedQuestionIndex += 1;
        this.database.run(
          "UPDATE interview_sessions SET planned_question_index = ?, pending_follow_up_question = NULL, pending_follow_up_parent_question = NULL WHERE id = ? AND account_id = ?",
          [plannedQuestionIndex, sessionId, accountId],
        );
      } else {
        plannedQuestionIndex += 1;
        this.database.run(
          "UPDATE interview_sessions SET planned_question_index = ?, pending_follow_up_question = NULL, pending_follow_up_parent_question = NULL WHERE id = ? AND account_id = ?",
          [plannedQuestionIndex, sessionId, accountId],
        );
      }
    }

    return this.get(accountId, sessionId);
  }

  beginClosing(accountId: string, sessionId: string): SessionSnapshot {
    const session = this.get(accountId, sessionId);
    if (session.state !== "active" && session.state !== "closing") {
      throw new SessionEngineError(
        "INVALID_STATE",
        "Only an active or closing session can move to the closing flow.",
      );
    }
    this.database.run(
      "UPDATE interview_sessions SET status = 'closing', completed_at = NULL WHERE id = ? AND status IN ('active', 'closing')",
      [sessionId],
    );
    return this.get(accountId, sessionId);
  }

  submitExpectedScore(
    accountId: string,
    sessionId: string,
    expectedScore: number,
  ): SessionSnapshot {
    const session = this.get(accountId, sessionId);
    if (session.state !== "closing") {
      throw new SessionEngineError(
        "INVALID_STATE",
        "Expected score can only be submitted while a session is closing.",
      );
    }
    if (
      !Number.isFinite(expectedScore) ||
      expectedScore < 0 ||
      expectedScore > 100
    ) {
      throw new SessionEngineError(
        "INVALID_EXPECTED_SCORE",
        "Expected score must be a number between 0 and 100.",
      );
    }
    this.database.run(
      "UPDATE interview_sessions SET expected_score = ?, status = 'completed', completed_at = ? WHERE id = ? AND status = 'closing'",
      [expectedScore, this.now().toISOString(), sessionId],
    );
    return this.get(accountId, sessionId);
  }

  generateEvaluation(accountId: string, sessionId: string): EvaluationResult {
    const session = this.get(accountId, sessionId);
    if (session.state !== "completed") {
      throw new SessionEngineError(
        "INVALID_STATE",
        "Final evaluation is only available for completed sessions.",
      );
    }

    const existingRow = firstRow(
      this.database,
      "SELECT actual_score, feedback FROM evaluation_results WHERE interview_session_id = ?",
      [sessionId],
    );
    if (existingRow && existingRow.feedback) {
      const parsed = JSON.parse(
        String(existingRow.feedback),
      ) as EvaluationResult;
      return parsed;
    }

    const rows = this.database.exec(
      "SELECT question, answer FROM interview_turns WHERE interview_session_id = ? ORDER BY turn_number",
      [sessionId],
    );
    const values = rows[0]?.values ?? [];
    const turns = values.map((row) => {
      const question = String(row[0] ?? "");
      const answer = String(row[1] ?? "");
      const analysis = row[2]
        ? (JSON.parse(String(row[2])) as AnswerAnalysis)
        : null;
      return { question, answer, analysis };
    });

    const evaluation = this.evaluationBoundary.evaluate({
      sessionId,
      topic: session.topic,
      turns,
    });

    this.database.run(
      "INSERT INTO evaluation_results (id, interview_session_id, actual_score, feedback, created_at) VALUES (?, ?, ?, ?, ?)",
      [
        randomUUID(),
        sessionId,
        evaluation.actualScore,
        JSON.stringify(evaluation),
        this.now().toISOString(),
      ],
    );

    return evaluation;
  }

  getEvaluationResult(accountId: string, sessionId: string): EvaluationResult {
    const session = this.get(accountId, sessionId);
    if (session.state !== "completed") {
      throw new SessionEngineError(
        "INVALID_STATE",
        "Final evaluation is only available for completed sessions.",
      );
    }

    const row = firstRow(
      this.database,
      "SELECT actual_score, feedback FROM evaluation_results WHERE interview_session_id = ?",
      [sessionId],
    );
    if (!row || !row.feedback) {
      throw new SessionEngineError(
        "EVALUATION_NOT_FOUND",
        "Evaluation could not be generated yet.",
      );
    }

    return JSON.parse(String(row.feedback)) as EvaluationResult;
  }

  terminate(accountId: string, sessionId: string): SessionSnapshot {
    const session = this.get(accountId, sessionId);
    if (session.state !== "active") {
      throw new SessionEngineError(
        "INVALID_STATE",
        "Only an active session can be terminated.",
      );
    }
    this.database.run(
      "UPDATE interview_sessions SET status = 'terminated', completed_at = ? WHERE id = ? AND status = 'active'",
      [this.now().toISOString(), sessionId],
    );
    return this.get(accountId, sessionId);
  }

  private validateAnalysis(
    analysis: unknown,
  ): asserts analysis is AnswerAnalysis {
    if (!analysis || typeof analysis !== "object") {
      throw new SessionEngineError(
        "INVALID_ANALYSIS",
        "AI analysis response was invalid.",
      );
    }

    const record = analysis as Partial<AnswerAnalysis> & {
      category?: string;
      strengths?: unknown;
      missingImportantPoints?: unknown;
      improvementOpportunities?: unknown;
    };

    const validCategory = [
      "strong",
      "partial",
      "weak",
      "irrelevant",
      "unclear",
    ].includes(String(record.category ?? ""));
    const validStrengths = Array.isArray(record.strengths);
    const validMissing = Array.isArray(record.missingImportantPoints);
    const validImprovements = Array.isArray(record.improvementOpportunities);

    if (
      !validCategory ||
      !validStrengths ||
      !validMissing ||
      !validImprovements ||
      typeof record.analysisNotes !== "string"
    ) {
      throw new SessionEngineError(
        "INVALID_ANALYSIS",
        "AI analysis response was invalid.",
      );
    }
  }

  private validateFollowUpDecision(
    decision: unknown,
  ): asserts decision is FollowUpDecision {
    if (!decision || typeof decision !== "object") {
      throw new SessionEngineError(
        "INVALID_FOLLOW_UP",
        "AI follow-up response was invalid.",
      );
    }

    const record = decision as Partial<FollowUpDecision>;
    if (
      typeof record.shouldFollowUp !== "boolean" ||
      typeof record.reason !== "string" ||
      (record.shouldFollowUp && typeof record.followUpQuestion !== "string") ||
      (!record.shouldFollowUp &&
        record.followUpQuestion !== null &&
        typeof record.followUpQuestion !== "string")
    ) {
      throw new SessionEngineError(
        "INVALID_FOLLOW_UP",
        "AI follow-up response was invalid.",
      );
    }
  }

  private hasExpired(startedAt: unknown, durationMinutes: unknown): boolean {
    return (
      new Date(String(startedAt)).getTime() +
        Number(durationMinutes) * 60_000 <=
      this.now().getTime()
    );
  }
}

export function createSessionEngine(database: Database, config?: AppConfig): SessionEngine {
  const aiProvider =
    config?.aiProvider === "freellmapi" && config.aiBaseUrl
      ? createFreeLlmApiProvider({
          baseUrl: config.aiBaseUrl,
          apiKey: config.aiApiKey ?? "",
          model: config.aiModel ?? "auto",
        })
      : undefined;

  return new SessionEngine(database, undefined, undefined, aiProvider);
}



