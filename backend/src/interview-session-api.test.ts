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
});
