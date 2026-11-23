import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "crypto";
import { query } from "./db";
import { SESSION_COOKIE as COOKIE_NAME, SESSION_SECRET } from "./session-cookie";
const SEVEN_DAYS_SECONDS = 7 * 24 * 60 * 60;

export interface SessionUser {
  id: string;
  orgId: string;
  orgName: string;
  name: string;
  email: string;
  role: "CLIENT" | "STAFF" | "ADMIN";
  orgRole: "OWNER" | "MEMBER";
  phone?: string;
  timezone?: string;
  welcomeCompleted?: boolean;
}

interface StoredSessionPayload {
  user: SessionUser;
  exp: number;
}

// ==========================================
// 1. Password Hashing (scrypt + random salt)
// ==========================================
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, combinedHash: string): boolean {
  try {
    const [salt, key] = combinedHash.split(":");
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, "hex");
    const derivedBuffer = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedBuffer);
  } catch {
    return false;
  }
}

// ==========================================
// 2. Cookie Signing & Verification (HMAC)
// ==========================================
function sign(value: string): string {
  const hmac = crypto.createHmac("sha256", SESSION_SECRET).update(value).digest("hex");
  return `${Buffer.from(value).toString("base64url")}.${hmac}`;
}

function verifyAndDecode(signed: string): string | null {
  try {
    const [encodedData, signature] = signed.split(".");
    if (!encodedData || !signature) return null;
    const rawData = Buffer.from(encodedData, "base64url").toString("utf8");
    const expectedHmac = crypto.createHmac("sha256", SESSION_SECRET).update(rawData).digest("hex");
    const sigBuffer = Buffer.from(signature, "hex");
    const expBuffer = Buffer.from(expectedHmac, "hex");
    if (sigBuffer.length !== expBuffer.length || !crypto.timingSafeEqual(sigBuffer, expBuffer)) {
      return null;
    }
    return rawData;
  } catch {
    return null;
  }
}

// ==========================================
// 3. Session Management
// ==========================================
export async function createSession(user: SessionUser): Promise<void> {
  const cookieStore = await cookies();
  const payload: StoredSessionPayload = {
    user,
    exp: Math.floor(Date.now() / 1000) + SEVEN_DAYS_SECONDS,
  };
  const token = sign(JSON.stringify(payload));

  // Host-only cookie (no `domain`): portal and admin logins stay separate.
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SEVEN_DAYS_SECONDS,
    path: "/",
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  // Re-send the same attributes: browsers ignore a __Host- cookie update without Secure.
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(COOKIE_NAME);
    if (!cookie?.value) return null;

    const raw = verifyAndDecode(cookie.value);
    if (!raw) return null;

    const parsed: StoredSessionPayload = JSON.parse(raw);
    if (parsed.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return parsed.user;
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    redirect("/sign-in");
  }
  return user;
}

export async function requireOrgScope(orgId: string): Promise<SessionUser> {
  const user = await requireUser();
  // Staff and Admin can view any org, clients can only access their own org
  if (user.role === "CLIENT" && user.orgId !== orgId) {
    const memberCheck = await query(
      "SELECT 1 FROM memberships WHERE user_id = $1 AND org_id = $2 LIMIT 1",
      [user.id, orgId]
    );
    if (memberCheck.rowCount === 0) {
      // J8 Security Checklist: Foreign or unknown IDs return 404, never 403 or data leaks
      const notFoundError = new Error("Resource not found");
      (notFoundError as any).digest = "NEXT_NOT_FOUND";
      throw notFoundError;
    }
  }
  return user;
}

// ==========================================
// 4. Rate Limiter (5 attempts / 15 mins per IP)
// ==========================================
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

export function checkLoginRateLimit(ip: string): { allowed: boolean; retryAfterMinutes?: number } {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record) {
    return { allowed: true };
  }
  if (now > record.resetAt) {
    loginAttempts.delete(ip);
    return { allowed: true };
  }
  if (record.count >= 5) {
    const retryAfter = Math.ceil((record.resetAt - now) / 60000);
    return { allowed: false, retryAfterMinutes: retryAfter };
  }
  return { allowed: true };
}

export function recordFailedLogin(ip: string): void {
  const now = Date.now();
  const fifteenMinutes = 15 * 60 * 1000;
  const record = loginAttempts.get(ip);
  if (!record || now > record.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + fifteenMinutes });
  } else {
    record.count += 1;
  }
}

export function resetLoginAttempts(ip: string): void {
  loginAttempts.delete(ip);
}

// ==========================================
// 5. Audit Logging
// ==========================================
export async function logAudit(
  orgId: string,
  userId: string | null,
  action: string,
  entity: string,
  entityId: string | null = null,
  metadata: any = {}
): Promise<void> {
  try {
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const userAgent = headerList.get("user-agent") || "unknown";

    await query(
      `INSERT INTO audit_logs (org_id, user_id, action, entity, entity_id, metadata, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [orgId, userId, action, entity, entityId, JSON.stringify(metadata), ip, userAgent]
    );
  } catch (err) {
    console.error("[Audit Log Failed]", err);
  }
}
