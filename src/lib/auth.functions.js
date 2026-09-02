import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import bcrypt from "bcryptjs";
import { and, eq, gt } from "drizzle-orm";
import { getDatabase } from "@/db";
import { profiles, sessions, userRoles, users } from "@/db/schema";
import { z } from "zod";

export const SESSION_COOKIE = "pm_session";
export const TERMS_VERSION = "2026-08-30";

const sessionMaxAge = 60 * 60 * 24 * 7;

const readCookie = createServerOnlyFn(async (name) => {
  const { getCookie } = await import("@tanstack/react-start/server");
  return getCookie(name);
});

const writeCookie = createServerOnlyFn(async (name, value, options) => {
  const { setCookie } = await import("@tanstack/react-start/server");
  setCookie(name, value, options);
});

const removeCookie = createServerOnlyFn(async (name, options) => {
  const { deleteCookie } = await import("@tanstack/react-start/server");
  deleteCookie(name, options);
});

function readRuntimeEnv(name) {
  return globalThis.process?.env?.[name] ?? globalThis.__env__?.[name] ?? globalThis.env?.[name];
}

function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: readRuntimeEnv("NODE_ENV") === "production",
    sameSite: "lax",
    maxAge: sessionMaxAge,
    path: "/",
  };
}

function createToken() {
  if (!globalThis.crypto?.randomUUID) {
    throw new Error("Secure random token generation is unavailable.");
  }
  return globalThis.crypto.randomUUID() + globalThis.crypto.randomUUID();
}

function getSessionSecret() {
  const secret = readRuntimeEnv("SESSION_SECRET");
  if (!secret && readRuntimeEnv("NODE_ENV") === "production") {
    throw new Error("SESSION_SECRET is required in production.");
  }
  return secret || "development-only-session-secret";
}

async function hashToken(token) {
  const bytes = new TextEncoder().encode(token + getSessionSecret());
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function createSession(database, userId) {
  const token = createToken();
  await database.insert(sessions).values({
    userId,
    tokenHash: await hashToken(token),
    expiresAt: new Date(Date.now() + sessionMaxAge * 1000),
  });
  await writeCookie(SESSION_COOKIE, token, sessionCookieOptions());
}

export async function getCurrentUser() {
  const token = await readCookie(SESSION_COOKIE);
  if (!token) return null;

  const database = getDatabase();
  const [session] = await database
    .select({ user: users, session: sessions })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(
      and(
        eq(sessions.tokenHash, await hashToken(token)),
        gt(sessions.expiresAt, new Date()),
        eq(users.status, "ACTIVE"),
      ),
    )
    .limit(1);

  if (!session || session.session.revokedAt) return null;

  const roles = await database
    .select({ role: userRoles.role })
    .from(userRoles)
    .where(eq(userRoles.userId, session.user.id));
  const [profile] = await database
    .select()
    .from(profiles)
    .where(eq(profiles.userId, session.user.id))
    .limit(1);

  return {
    id: session.user.id,
    email: session.user.email,
    status: session.user.status,
    roles: roles.map(({ role }) => role),
    profile: profile || null,
  };
}

export async function requireUser(requiredRole) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Authentication required.");
  if (requiredRole && !user.roles.includes(requiredRole)) {
    throw new Error("You do not have permission for this action.");
  }
  return user;
}

const registrationSchema = z.object({
  email: z
    .string()
    .email()
    .transform((value) => value.trim().toLowerCase()),
  password: z.string().min(8),
  displayName: z.string().trim().min(2).max(160),
  roles: z
    .array(z.enum(["SEEKER", "LANDLORD"]))
    .min(1)
    .max(2),
  termsAccepted: z.literal(true),
});

export const register = createServerFn({ method: "POST" })
  .validator((data) => registrationSchema.parse(data))
  .handler(async ({ data }) => {
    const database = getDatabase();
    const passwordHash = await bcrypt.hash(data.password, 12);
    const now = new Date();

    let result;
    try {
      [result] = await database
        .insert(users)
        .values({
          email: data.email,
          passwordHash,
          termsAcceptedAt: now,
          termsVersion: TERMS_VERSION,
        })
        .returning({ id: users.id, email: users.email });

      await database
        .insert(userRoles)
        .values(data.roles.map((role) => ({ userId: result.id, role })));
      await database.insert(profiles).values({ userId: result.id, displayName: data.displayName });
    } catch (error) {
      if (result?.id) {
        await database.delete(users).where(eq(users.id, result.id));
      }
      throw error;
    }

    await createSession(database, result.id);
    return { user: result };
  });

const loginSchema = z.object({
  email: z
    .string()
    .email()
    .transform((value) => value.trim().toLowerCase()),
  password: z.string().min(1),
});

export const login = createServerFn({ method: "POST" })
  .validator((data) => loginSchema.parse(data))
  .handler(async ({ data }) => {
    const database = getDatabase();
    const [user] = await database.select().from(users).where(eq(users.email, data.email)).limit(1);
    if (!user || user.status !== "ACTIVE" || !user.passwordHash) {
      throw new Error("Invalid email or password.");
    }
    const matches = await bcrypt.compare(data.password, user.passwordHash);
    if (!matches) throw new Error("Invalid email or password.");
    await createSession(database, user.id);
    const roles = await database
      .select({ role: userRoles.role })
      .from(userRoles)
      .where(eq(userRoles.userId, user.id));
    return { userId: user.id, roles: roles.map(({ role }) => role) };
  });

export const logout = createServerFn({ method: "POST" }).handler(async () => {
  const token = await readCookie(SESSION_COOKIE);
  if (token) {
    const database = getDatabase();
    await database
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(eq(sessions.tokenHash, await hashToken(token)));
  }
  await removeCookie(SESSION_COOKIE, { path: "/" });
  return { success: true };
});

export const currentUser = createServerFn({ method: "GET" }).handler(async () => {
  return getCurrentUser();
});
