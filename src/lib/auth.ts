/**
 * Simple session-based auth using httpOnly cookies.
 * Good enough for a single-user admin panel.
 */
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "./db";

// In-memory session store (resets on server restart — fine for MVP)
const sessions = new Map<string, { expires: number }>();

const SESSION_COOKIE = "portfolio_session";
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function login(password: string): Promise<boolean> {
  const db = getDb();
  const row = db
    .prepare("SELECT value FROM settings WHERE key = 'admin_password'")
    .get() as { value: string } | undefined;

  if (!row) return false;

  const valid = bcrypt.compareSync(password, row.value);
  if (!valid) return false;

  // Create session
  const sessionId = uuidv4();
  sessions.set(sessionId, { expires: Date.now() + SESSION_DURATION });

  // Set cookie
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000,
    path: "/",
  });

  return true;
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (sessionId) {
    sessions.delete(sessionId);
    cookieStore.delete(SESSION_COOKIE);
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return false;

  const session = sessions.get(sessionId);
  if (!session || session.expires < Date.now()) {
    sessions.delete(sessionId);
    return false;
  }

  return true;
}

export async function changePassword(newPassword: string): Promise<void> {
  const db = getDb();
  const hash = bcrypt.hashSync(newPassword, 12);
  db.prepare("UPDATE settings SET value = ? WHERE key = 'admin_password'").run(
    hash
  );
}
