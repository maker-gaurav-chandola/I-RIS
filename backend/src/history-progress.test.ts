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

function cookieFrom(headers: OutgoingHttpHeaders): string {
  const value = headers["set-cookie"];
  return (Array.isArray(value) ? value[0] : value)?.split(";", 1)[0] ?? "";
}

afterEach(async () => {
  await app?.close();
  database?.close();
});

describe("history and progress API", () => {
  it("lists only completed owned interviews and compares actual scores", async () => {
    database = await createDatabase(":memory:");
    app = buildApp(database, config);
    const registration = await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: { email: "candidate@example.com", password: "password-one" },
    });
    const cookie = cookieFrom(registration.headers);
    const accountId = String(
      database.exec(
        "SELECT id FROM accounts WHERE email = 'candidate@example.com'",
      )[0]?.values[0]?.[0],
    );
    const olderSession = "session-older";
    const newerSession = "session-newer";
    database.run(
      `INSERT INTO interview_sessions
        (id, account_id, interview_type, topic, difficulty, duration_minutes, language, mode, expected_score, status, started_at, completed_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?, ?, ?)`,
      [
        olderSession,
        accountId,
        "Technical Interview",
        "JavaScript",
        "Medium",
        15,
        "Hinglish",
        "Text",
        70,
        "2026-09-10T10:00:00.000Z",
        "2026-09-10T10:15:00.000Z",
        "2026-09-10T10:00:00.000Z",
      ],
    );
    database.run(
      `INSERT INTO interview_sessions
        (id, account_id, interview_type, topic, difficulty, duration_minutes, language, mode, expected_score, status, started_at, completed_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?, ?, ?)`,
      [
        newerSession,
        accountId,
        "Technical Interview",
        "JavaScript",
        "Medium",
        15,
        "Hinglish",
        "Text",
        80,
        "2026-09-11T10:00:00.000Z",
        "2026-09-11T10:15:00.000Z",
        "2026-09-11T10:00:00.000Z",
      ],
    );
    database.run(
      "INSERT INTO evaluation_results (id, interview_session_id, actual_score, feedback, created_at) VALUES (?, ?, ?, ?, ?)",
      ["evaluation-older", olderSession, 60, "{}", "2026-09-10T10:15:00.000Z"],
    );
    database.run(
      "INSERT INTO evaluation_results (id, interview_session_id, actual_score, feedback, created_at) VALUES (?, ?, ?, ?, ?)",
      ["evaluation-newer", newerSession, 85, "{}", "2026-09-11T10:15:00.000Z"],
    );

    const response = await app.inject({
      method: "GET",
      url: "/api/interview-history",
      headers: { cookie },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().history).toHaveLength(2);
    expect(response.json().progress).toMatchObject({
      totalCompleted: 2,
      latestScore: 85,
      previousScore: 60,
      scoreChange: 25,
      direction: "improving",
    });
  });

  it("returns an empty history without exposing another account's records", async () => {
    database = await createDatabase(":memory:");
    app = buildApp(database, config);
    const first = await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: { email: "first@example.com", password: "password-one" },
    });
    const second = await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: { email: "second@example.com", password: "password-two" },
    });

    const unauthenticated = await app.inject({
      method: "GET",
      url: "/api/interview-history",
    });
    const empty = await app.inject({
      method: "GET",
      url: "/api/interview-history",
      headers: { cookie: cookieFrom(second.headers) },
    });

    expect(unauthenticated.statusCode).toBe(401);
    expect(empty.statusCode).toBe(200);
    expect(empty.json()).toMatchObject({
      history: [],
      progress: { totalCompleted: 0, direction: "not_available" },
    });
    expect(cookieFrom(first.headers)).not.toBe(cookieFrom(second.headers));
  });
});
