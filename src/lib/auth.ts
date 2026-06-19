import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "node:crypto";

const COOKIE = "admin_session";
const PASSWORD = process.env.ADMIN_PASSWORD || "admin";
const SECRET = process.env.SESSION_SECRET || "dev-secret-change-me";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 днів

// Значення cookie не можна підробити, не знаючи паролю й секрету.
function sessionToken(): string {
  return crypto.createHash("sha256").update(`${PASSWORD}:${SECRET}`).digest("hex");
}

// Порівняння за сталий час — щоб не дати підбирати пароль/токен за таймінгом.
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const value = store.get(COOKIE)?.value;
  return value !== undefined && safeEqual(value, sessionToken());
}

/** Викликається на початку кожної захищеної admin-сторінки / дії. */
export async function requireAuth(): Promise<void> {
  if (!(await isAuthenticated())) redirect("/admin/login");
}

export async function login(password: string): Promise<boolean> {
  if (!safeEqual(password, PASSWORD)) return false;
  const store = await cookies();
  store.set(COOKIE, sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
  return true;
}

export async function logout(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}
