import { afterEach, describe, expect, it } from "vitest";
import type { OutgoingHttpHeaders } from "node:http";
import type { Database } from "sql.js";
import { buildApp } from "./app.js";
import { createDatabase } from "./persistence/database.js";

const config = {
  port: 3000,
  databasePath: ":memory:",
  frontendOrigin: "http://localhost:5173",
};

let database: Database;
let app: ReturnType<typeof buildApp>;

afterEach(async () => {
  await app?.close();
  database?.close();
});

function cookieFrom(headers: OutgoingHttpHeaders): string {
  const value = headers["set-cookie"];
  return (Array.isArray(value) ? value[0] : value)?.split(";", 1)[0] ?? "";
}

describe("interview session API", () => {
  it("requires authentication, persists turns, and enforces ownership", async () => {
    database = await createDatabase(":memory:");
    app = buildApp(database, config);
    const firstAccount = {
      email: "first@example.com",
      password: "password-one",
    };
    const secondAccount = {
      email: "second@example.com",
      password: "password-two",
    };

    const unauthenticated = await app.inject({
      method: "POST",
      url: "/api/interview-sessions",
      payload: {
        interviewType: "Technical Interview",
        topic: "JavaScript",
        difficulty: "Medium",
        duration: 15,
        language: "Hinglish",
        mode: "Text",
      },
    });
    const firstRegistration = await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: firstAccount,
    });
    const firstCookie = cookieFrom(firstRegistration.headers);
    const start = await app.inject({
      method: "POST",
      url: "/api/interview-sessions",
      headers: { cookie: firstCookie },
      payload: {
        interviewType: "Technical Interview",
        topic: "JavaScript",
        difficulty: "Medium",
        duration: 15,
        language: "Hinglish",
        mode: "Text",
      },
    });
    const sessionId = start.json().session.id as string;
    const answer = await app.inject({
      method: "POST",
      url: `/api/interview-sessions/${sessionId}/answers`,
      headers: { cookie: firstCookie },
      payload: { answer: "A deterministic answer" },
    });
    const secondRegistration = await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: secondAccount,
    });
    const secondCookie = cookieFrom(secondRegistration.headers);
    const forbidden = await app.inject({
      method: "GET",
      url: `/api/interview-sessions/${sessionId}`,
      headers: { cookie: secondCookie },
    });

    expect(unauthenticated.statusCode).toBe(401);
    expect(start.statusCode).toBe(201);
    expect(start.json().session.state).toBe("active");
    expect(answer.statusCode).toBe(200);
    expect(answer.json().session.turnCount).toBe(1);
    expect(forbidden.statusCode).toBe(404);
    expect(
      database.exec("SELECT COUNT(*) FROM interview_turns")[0]?.values[0]?.[0],
    ).toBe(1);
  });
  it("moves an expired session to closing through the GET API", async () => {
    database = await createDatabase(":memory:");
    app = buildApp(database, config);

    const registration = await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: {
        email: "timer@example.com",
        password: "timer-password",
      },
    });
    const cookie = cookieFrom(registration.headers);

    const start = await app.inject({
      method: "POST",
      url: "/api/interview-sessions",
      headers: { cookie },
      payload: {
        interviewType: "Technical Interview",
        topic: "JavaScript",
        difficulty: "Medium",
        duration: 1,
        language: "Hinglish",
        mode: "Text",
      },
    });

    expect(start.statusCode).toBe(201);

    const sessionId = start.json().session.id as string;
    const expiredStartedAt = new Date(Date.now() - 60_001).toISOString();

    database.run(
      "UPDATE interview_sessions SET started_at = ? WHERE id = ?",
      [expiredStartedAt, sessionId],
    );

    const response = await app.inject({
      method: "GET",
      url: `/api/interview-sessions/${sessionId}`,
      headers: { cookie },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().session.state).toBe("closing");
    expect(response.json().session.currentQuestion).toBeNull();

    const persisted = database.exec(
      "SELECT status FROM interview_sessions WHERE id = ?",
      [sessionId],
    );

    expect(persisted[0]?.values[0]?.[0]).toBe("closing");
  });
  it("closes a session and captures expected score through the API", async () => {
    database = await createDatabase(":memory:");
    app = buildApp(database, config);

    const registration = await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: {
        email: "lifecycle@example.com",
        password: "lifecycle-password",
      },
    });

    const cookie = cookieFrom(registration.headers);

    const start = await app.inject({
      method: "POST",
      url: "/api/interview-sessions",
      headers: { cookie },
      payload: {
        interviewType: "Technical Interview",
        topic: "JavaScript",
        difficulty: "Medium",
        duration: 15,
        language: "Hinglish",
        mode: "Text",
      },
    });

    expect(start.statusCode).toBe(201);

    const sessionId = start.json().session.id as string;

    const close = await app.inject({
      method: "POST",
      url: `/api/interview-sessions/${sessionId}/close`,
      headers: { cookie },
      payload: {},
    });

    expect(close.statusCode).toBe(200);
    expect(close.json().session.state).toBe("closing");

    const expectedScore = await app.inject({
      method: "POST",
      url: `/api/interview-sessions/${sessionId}/expected-score`,
      headers: { cookie },
      payload: { expectedScore: 85 },
    });

    expect(expectedScore.statusCode).toBe(200);
    expect(expectedScore.json().session.state).toBe("completed");
    expect(expectedScore.json().session.expectedScore).toBe(85);

    const persisted = database.exec(
      "SELECT status, expected_score FROM interview_sessions WHERE id = ?",
      [sessionId],
    );

    expect(persisted[0]?.values[0]?.[0]).toBe("completed");
    expect(persisted[0]?.values[0]?.[1]).toBe(85);
  });
  it("generates and retrieves evaluation results through the API", async () => {
    database = await createDatabase(":memory:");
    app = buildApp(database, config);

    const registration = await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: {
        email: "evaluation@example.com",
        password: "evaluation-password",
      },
    });

    const cookie = cookieFrom(registration.headers);

    const start = await app.inject({
      method: "POST",
      url: "/api/interview-sessions",
      headers: { cookie },
      payload: {
        interviewType: "Technical Interview",
        topic: "JavaScript",
        difficulty: "Medium",
        duration: 15,
        language: "Hinglish",
        mode: "Text",
      },
    });

    expect(start.statusCode).toBe(201);

    const sessionId = start.json().session.id as string;

    const answer = await app.inject({
      method: "POST",
      url: `/api/interview-sessions/${sessionId}/answers`,
      headers: { cookie },
      payload: {
        answer:
          "JavaScript uses lexical scope and closures allow a function to remember variables from its outer scope.",
      },
    });

    expect(answer.statusCode).toBe(200);

    const close = await app.inject({
      method: "POST",
      url: `/api/interview-sessions/${sessionId}/close`,
      headers: { cookie },
      payload: {},
    });

    expect(close.statusCode).toBe(200);
    expect(close.json().session.state).toBe("closing");

    const expectedScore = await app.inject({
      method: "POST",
      url: `/api/interview-sessions/${sessionId}/expected-score`,
      headers: { cookie },
      payload: { expectedScore: 80 },
    });

    expect(expectedScore.statusCode).toBe(200);
    expect(expectedScore.json().session.state).toBe("completed");

    const evaluate = await app.inject({
      method: "POST",
      url: `/api/interview-sessions/${sessionId}/evaluate`,
      headers: { cookie },
      payload: {},
    });

    expect(evaluate.statusCode).toBe(200);
    expect(evaluate.json().evaluation.actualScore).toBeGreaterThan(0);
    expect(evaluate.json().evaluation.actualScore).toBeLessThanOrEqual(100);

    const results = await app.inject({
      method: "GET",
      url: `/api/interview-sessions/${sessionId}/results`,
      headers: { cookie },
    });

    expect(results.statusCode).toBe(200);
    expect(results.json().evaluation.actualScore).toBe(
      evaluate.json().evaluation.actualScore,
    );

    const persisted = database.exec(
      "SELECT actual_score FROM evaluation_results WHERE interview_session_id = ?",
      [sessionId],
    );

    expect(persisted[0]?.values[0]?.[0]).toBe(
      evaluate.json().evaluation.actualScore,
    );
  });
  it("terminates an active session through the API", async () => {
    database = await createDatabase(":memory:");
    app = buildApp(database, config);

    const registration = await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: {
        email: "terminate@example.com",
        password: "terminate-password",
      },
    });

    const cookie = cookieFrom(registration.headers);

    const start = await app.inject({
      method: "POST",
      url: "/api/interview-sessions",
      headers: { cookie },
      payload: {
        interviewType: "Technical Interview",
        topic: "JavaScript",
        difficulty: "Medium",
        duration: 15,
        language: "Hinglish",
        mode: "Text",
      },
    });

    expect(start.statusCode).toBe(201);

    const sessionId = start.json().session.id as string;

    const terminate = await app.inject({
      method: "POST",
      url: `/api/interview-sessions/${sessionId}/terminate`,
      headers: { cookie },
      payload: {},
    });

    expect(terminate.statusCode).toBe(200);
    expect(terminate.json().session.state).toBe("terminated");

    const persisted = database.exec(
      "SELECT status, completed_at FROM interview_sessions WHERE id = ?",
      [sessionId],
    );

    expect(persisted[0]?.values[0]?.[0]).toBe("terminated");
    expect(persisted[0]?.values[0]?.[1]).not.toBeNull();
  });
});
