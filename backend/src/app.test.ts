import { afterEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Database } from "sql.js";
import type { OutgoingHttpHeaders } from "node:http";
import { buildApp } from "./app.js";
import { closeDatabase, createDatabase } from "./persistence/database.js";

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

async function createAuthTestApp(): Promise<void> {
  database = await createDatabase(":memory:");
  app = buildApp(database, config);
}

function sessionCookie(response: { headers: OutgoingHttpHeaders }): string {
  const value = response.headers["set-cookie"];
  return (Array.isArray(value) ? value[0] : value)?.split(";", 1)[0] ?? "";
}

describe("foundation API", () => {
  it("reports a healthy backend and database connection", async () => {
    database = await createDatabase(":memory:");
    app = buildApp(database, config);

    const response = await app.inject({ method: "GET", url: "/api/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      status: "ok",
      database: "connected",
    });
    await app.close();
  });

  it("persists a record across database reinitialization", async () => {
    const directory = mkdtempSync(join(tmpdir(), "i-ris-persistence-"));
    const databasePath = join(directory, "i-ris.sqlite");
    const firstDatabase = await createDatabase(databasePath);

    firstDatabase.run(
      "INSERT INTO accounts (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
      [
        "account-1",
        "persisted@example.com",
        "not-a-real-hash-for-fixture",
        "2026-09-09T00:00:00.000Z",
      ],
    );
    closeDatabase(firstDatabase, databasePath);

    const restartedDatabase = await createDatabase(databasePath);
    const result = restartedDatabase.exec(
      "SELECT id FROM accounts WHERE id = 'account-1'",
    );

    expect(result[0]?.values).toEqual([["account-1"]]);
    closeDatabase(restartedDatabase, databasePath);
    rmSync(directory, { recursive: true, force: true });
  });

  it("registers an account without storing or returning a plaintext password", async () => {
    await createAuthTestApp();

    const response = await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: {
        email: "candidate@example.com",
        password: "correct horse battery",
      },
    });
    const account = database.exec(
      "SELECT email, password_hash FROM accounts",
    )[0]?.values[0];

    expect(response.statusCode).toBe(201);
    expect(response.json().user).toMatchObject({
      email: "candidate@example.com",
    });
    expect(response.json().user.password).toBeUndefined();
    expect(response.json().user.passwordHash).toBeUndefined();
    expect(account?.[0]).toBe("candidate@example.com");
    expect(account?.[1]).not.toBe("correct horse battery");
  });

  it("rejects duplicate accounts", async () => {
    await createAuthTestApp();
    const payload = {
      email: "candidate@example.com",
      password: "correct horse battery",
    };

    await app.inject({ method: "POST", url: "/api/auth/register", payload });
    const response = await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload,
    });

    expect(response.statusCode).toBe(409);
  });

  it("logs in with valid credentials and rejects invalid credentials", async () => {
    await createAuthTestApp();
    const payload = {
      email: "candidate@example.com",
      password: "correct horse battery",
    };
    await app.inject({ method: "POST", url: "/api/auth/register", payload });

    const invalidResponse = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { ...payload, password: "wrong password" },
    });
    const validResponse = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload,
    });

    expect(invalidResponse.statusCode).toBe(401);
    expect(invalidResponse.json().error).toBe("Invalid email or password.");
    expect(validResponse.statusCode).toBe(200);
    expect(validResponse.json().user.email).toBe("candidate@example.com");
  });

  it("protects current-user access and supports logout", async () => {
    await createAuthTestApp();
    const payload = {
      email: "candidate@example.com",
      password: "correct horse battery",
    };
    const registration = await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload,
    });
    const cookie = sessionCookie(registration);

    const unauthenticated = await app.inject({
      method: "GET",
      url: "/api/auth/me",
    });
    const authenticated = await app.inject({
      method: "GET",
      url: "/api/auth/me",
      headers: { cookie },
    });
    const logout = await app.inject({
      method: "POST",
      url: "/api/auth/logout",
      headers: { cookie },
    });
    const afterLogout = await app.inject({
      method: "GET",
      url: "/api/auth/me",
      headers: { cookie },
    });

    expect(unauthenticated.statusCode).toBe(401);
    expect(authenticated.statusCode).toBe(200);
    expect(authenticated.json().user.email).toBe("candidate@example.com");
    expect(logout.statusCode).toBe(204);
    expect(afterLogout.statusCode).toBe(401);
  });
});
