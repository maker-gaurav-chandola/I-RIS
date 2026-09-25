import {
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import type { Database } from "sql.js";

export type PublicAccount = {
  id: string;
  email: string;
  createdAt: string;
};

export type AuthResult = {
  account: PublicAccount;
  sessionToken: string;
};

type StoredAccount = PublicAccount & { passwordHash: string };

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, encodedHash: string): boolean {
  const [salt, expectedHex] = encodedHash.split(":");
  if (!salt || !expectedHex) return false;

  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHex, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function readAccount(database: Database, email: string): StoredAccount | null {
  const result = database.exec(
    "SELECT id, email, password_hash, created_at FROM accounts WHERE email = ? LIMIT 1",
    [normalizeEmail(email)],
  );
  const row = result[0]?.values[0];
  if (
    !row ||
    typeof row[0] !== "string" ||
    typeof row[1] !== "string" ||
    typeof row[2] !== "string" ||
    typeof row[3] !== "string"
  ) {
    return null;
  }

  return {
    id: row[0],
    email: row[1],
    passwordHash: row[2],
    createdAt: row[3],
  };
}

function toPublicAccount(account: StoredAccount): PublicAccount {
  return {
    id: account.id,
    email: account.email,
    createdAt: account.createdAt,
  };
}

export function validateCredentials(
  email: unknown,
  password: unknown,
): string | null {
  if (typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email.trim())) {
    return "Enter a valid email address.";
  }
  if (
    typeof password !== "string" ||
    password.length < 8 ||
    password.length > 128
  ) {
    return "Password must be between 8 and 128 characters.";
  }
  return null;
}

export function registerAccount(
  database: Database,
  email: string,
  password: string,
): AuthResult {
  const normalizedEmail = normalizeEmail(email);
  if (readAccount(database, normalizedEmail)) {
    throw new Error("ACCOUNT_ALREADY_EXISTS");
  }

  const id = randomUUID();
  const createdAt = new Date().toISOString();
  database.run(
    "INSERT INTO accounts (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
    [id, normalizedEmail, hashPassword(password), createdAt],
  );

  return {
    account: { id, email: normalizedEmail, createdAt },
    sessionToken: randomBytes(32).toString("hex"),
  };
}

export function loginAccount(
  database: Database,
  email: string,
  password: string,
): AuthResult | null {
  const account = readAccount(database, email);
  if (!account || !verifyPassword(password, account.passwordHash)) return null;

  return {
    account: toPublicAccount(account),
    sessionToken: randomBytes(32).toString("hex"),
  };
}

export function findAccountById(
  database: Database,
  id: string,
): PublicAccount | null {
  const result = database.exec(
    "SELECT id, email, created_at FROM accounts WHERE id = ? LIMIT 1",
    [id],
  );
  const row = result[0]?.values[0];
  if (
    !row ||
    typeof row[0] !== "string" ||
    typeof row[1] !== "string" ||
    typeof row[2] !== "string"
  )
    return null;
  return { id: row[0], email: row[1], createdAt: row[2] };
}
