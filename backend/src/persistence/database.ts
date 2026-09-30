import initSqlJs, { type Database as SqlJsDatabase } from "sql.js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";

const require = createRequire(import.meta.url);

const schema = `
  CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS interview_sessions (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL REFERENCES accounts(id),
    interview_type TEXT NOT NULL,
    topic TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    language TEXT NOT NULL,
    mode TEXT NOT NULL,
    expected_score REAL,
    actual_score REAL,
    status TEXT NOT NULL,
    started_at TEXT,
    completed_at TEXT,
    planned_question_index INTEGER NOT NULL DEFAULT 0,
    pending_follow_up_question TEXT,
    pending_follow_up_parent_question TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS interview_turns (
    id TEXT PRIMARY KEY,
    interview_session_id TEXT NOT NULL REFERENCES interview_sessions(id),
    turn_number INTEGER NOT NULL,
    question TEXT,
    answer TEXT,
    analysis_status TEXT,
    analysis_json TEXT,
    analysis_error TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS evaluation_results (
    id TEXT PRIMARY KEY,
    interview_session_id TEXT NOT NULL UNIQUE REFERENCES interview_sessions(id),
    actual_score REAL,
    feedback TEXT,
    created_at TEXT NOT NULL
  );
`;

function migrateAccountsTable(database: SqlJsDatabase): void {
  const columns = database.exec("PRAGMA table_info(accounts)")[0]?.values ?? [];
  const columnNames = new Set(columns.map(([_, name]) => name));

  if (!columnNames.has("email")) {
    database.exec("ALTER TABLE accounts ADD COLUMN email TEXT");
  }

  if (!columnNames.has("password_hash")) {
    database.exec("ALTER TABLE accounts ADD COLUMN password_hash TEXT");
  }

  database.exec(
    "CREATE UNIQUE INDEX IF NOT EXISTS accounts_email_unique ON accounts(email)",
  );
}

function migrateInterviewSessionsTable(database: SqlJsDatabase): void {
  const columns =
    database.exec("PRAGMA table_info(interview_sessions)")[0]?.values ?? [];
  const columnNames = new Set(columns.map(([_, name]) => name));

  if (!columnNames.has("planned_question_index")) {
    database.exec(
      "ALTER TABLE interview_sessions ADD COLUMN planned_question_index INTEGER NOT NULL DEFAULT 0",
    );
  }

  if (!columnNames.has("pending_follow_up_question")) {
    database.exec(
      "ALTER TABLE interview_sessions ADD COLUMN pending_follow_up_question TEXT",
    );
  }

  if (!columnNames.has("pending_follow_up_parent_question")) {
    database.exec(
      "ALTER TABLE interview_sessions ADD COLUMN pending_follow_up_parent_question TEXT",
    );
  }
}

function migrateInterviewTurnsTable(database: SqlJsDatabase): void {
  const columns =
    database.exec("PRAGMA table_info(interview_turns)")[0]?.values ?? [];
  const columnNames = new Set(columns.map(([_, name]) => name));

  if (!columnNames.has("analysis_status")) {
    database.exec(
      "ALTER TABLE interview_turns ADD COLUMN analysis_status TEXT",
    );
  }

  if (!columnNames.has("analysis_json")) {
    database.exec("ALTER TABLE interview_turns ADD COLUMN analysis_json TEXT");
  }

  if (!columnNames.has("analysis_error")) {
    database.exec("ALTER TABLE interview_turns ADD COLUMN analysis_error TEXT");
  }
}

export async function createDatabase(
  databasePath: string,
): Promise<SqlJsDatabase> {
  const SQL = await initSqlJs({
    locateFile: () => require.resolve("sql.js/dist/sql-wasm.wasm"),
  });
  const resolvedPath =
    databasePath === ":memory:" ? databasePath : resolve(databasePath);
  const database =
    resolvedPath === ":memory:"
      ? new SQL.Database()
      : existsSync(resolvedPath)
        ? new SQL.Database(new Uint8Array(readFileSync(resolvedPath)))
        : new SQL.Database();
  database.exec(schema);
  migrateAccountsTable(database);
  migrateInterviewSessionsTable(database);
  migrateInterviewTurnsTable(database);
  return database;
}

export function closeDatabase(
  database: SqlJsDatabase,
  databasePath: string,
): void {
  if (databasePath !== ":memory:") {
    const resolvedPath = resolve(databasePath);
    mkdirSync(dirname(resolvedPath), { recursive: true });
    writeFileSync(resolvedPath, Buffer.from(database.export()));
  }
  database.close();
}
