import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "node:crypto";

const COOKIE = "admin_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 днів

// Секрети НЕ мають дефолтів у продакшені: якщо змінна загубиться на Vercel,
// адмінка має бути недоступною, а не відкритися з відомим паролем "admin".
// Локальна розробка (NODE_ENV !== production) використовує зручні дефолти.
function getPassword(): string {
  const p = process.env.ADMIN_PASSWORD;
  if (p) return p;
  if (process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_PASSWORD не задано — вхід в адмінку вимкнено.");
  }
  return "admin";
}

function getSecret(): string {
  const s = process.env.SESSION_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET не задано — вхід в адмінку вимкнено.");
  }
  return "dev-secret-change-me";
}

// Порівняння за сталий час — щоб не дати підбирати пароль/токен за таймінгом.
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

// Токен сесії: "<exp>.<hmac>", де exp — unix-час (сек) закінчення, а
// hmac = HMAC-SHA256(secret, "admin:<exp>"). На відміну від старого
// sha256(пароль:секрет), який був вічним, цей токен:
//  • має термін дії (скопійований cookie перестане діяти після exp);
//  • анулюється зміною SESSION_SECRET (миттєвий «розлогін усіх»).
function sign(exp: number): string {
  const hmac = crypto
    .createHmac("sha256", getSecret())
    .update(`admin:${exp}`)
    .digest("hex");
  return `${exp}.${hmac}`;
}

function createToken(): string {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  return sign(exp);
}

function verifyToken(value: string | undefined): boolean {
  if (!value) return false;
  const dot = value.indexOf(".");
  if (dot <= 0) return false;
  const exp = Number(value.slice(0, dot));
  if (!Number.isFinite(exp) || exp * 1000 <= Date.now()) return false;
  // Перепідписуємо з тим самим exp і звіряємо за сталий час.
  return safeEqual(value, sign(exp));
}

// --- Обмеження частоти спроб входу (захист від онлайн-перебору пароля) ---
// Лічильник у пам'яті інстансу: best-effort (на serverless інстансів кілька,
// тож ліміт не абсолютний), але суттєво сповільнює автоматичний перебір.
const MAX_ATTEMPTS = 8;
const LOCK_MS = 10 * 60 * 1000; // 10 хв
const attempts = new Map<string, { count: number; first: number }>();

async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || "unknown";
}

function isLocked(ip: string): boolean {
  const rec = attempts.get(ip);
  if (!rec) return false;
  if (Date.now() - rec.first > LOCK_MS) {
    attempts.delete(ip); // вікно минуло — скидаємо
    return false;
  }
  return rec.count >= MAX_ATTEMPTS;
}

function recordFailure(ip: string): void {
  const rec = attempts.get(ip);
  if (!rec || Date.now() - rec.first > LOCK_MS) {
    attempts.set(ip, { count: 1, first: Date.now() });
  } else {
    rec.count += 1;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifyToken(store.get(COOKIE)?.value);
}

/** Викликається на початку кожної захищеної admin-сторінки / дії. */
export async function requireAuth(): Promise<void> {
  if (!(await isAuthenticated())) redirect("/admin/login");
}

export type LoginResult = "ok" | "invalid" | "locked";

export async function login(password: string): Promise<LoginResult> {
  const ip = await clientIp();
  if (isLocked(ip)) return "locked";

  if (!safeEqual(password, getPassword())) {
    recordFailure(ip);
    return "invalid";
  }

  attempts.delete(ip); // успішний вхід — скидаємо лічильник
  const store = await cookies();
  store.set(COOKIE, createToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
  return "ok";
}

export async function logout(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}
