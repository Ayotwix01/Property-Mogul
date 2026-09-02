import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { and, eq, isNull, gt } from "drizzle-orm";
import { z } from "zod";
import { getDatabase } from "@/db";
import { oauthAccounts, oauthStates, profiles, userRoles, users } from "@/db/schema";
import { createSession, TERMS_VERSION } from "@/lib/auth.functions";
import { normalizeGoogleRoles, parseGoogleIdentity } from "@/lib/google-oauth.logic";

const stateCookie = "pm_google_oauth_state";
const stateLifetime = 10 * 60 * 1000;
const env = (name) =>
  globalThis.process?.env?.[name] ?? globalThis.__env__?.[name] ?? globalThis.env?.[name];

function googleConfig() {
  const clientId = env("GOOGLE_CLIENT_ID");
  const clientSecret = env("GOOGLE_CLIENT_SECRET");
  const redirectUri = env("GOOGLE_REDIRECT_URI");
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Google OAuth is not configured on the server.");
  }
  return { clientId, clientSecret, redirectUri };
}

function sessionSecret() {
  return env("SESSION_SECRET") || "development-only-session-secret";
}

async function hashState(state) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(state + sessionSecret()),
  );
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function createState() {
  return crypto.randomUUID() + crypto.randomUUID();
}

const writeStateCookie = createServerOnlyFn(async (value) => {
  const { setCookie } = await import("@tanstack/react-start/server");
  setCookie(stateCookie, value, {
    httpOnly: true,
    secure: env("NODE_ENV") === "production",
    sameSite: "lax",
    maxAge: stateLifetime / 1000,
    path: "/",
  });
});

export const readStateCookie = createServerOnlyFn(async () => {
  const { getCookie } = await import("@tanstack/react-start/server");
  return getCookie(stateCookie);
});

export const clearStateCookie = createServerOnlyFn(async () => {
  const { deleteCookie } = await import("@tanstack/react-start/server");
  deleteCookie(stateCookie, { path: "/" });
});

export const startGoogleOAuth = createServerFn({ method: "GET" }).handler(async () => {
  const { clientId, redirectUri } = googleConfig();
  const state = createState();
  const database = getDatabase();
  await database.insert(oauthStates).values({
    provider: "GOOGLE",
    stateHash: await hashState(state),
    expiresAt: new Date(Date.now() + stateLifetime),
  });
  await writeStateCookie(state);
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });
  return { authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth?" + params };
});

function callbackRedirect(request, path) {
  return new Response(null, {
    status: 302,
    headers: { location: new URL(path, request.url).toString() },
  });
}

export async function handleGoogleCallback(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const storedState = await readStateCookie();
  await clearStateCookie();
  if (error || !code || !state || !storedState || state !== storedState) {
    return callbackRedirect(request, "/login?google=invalid_request");
  }

  const database = getDatabase();
  const stateHash = await hashState(state);
  const [oauthState] = await database
    .select()
    .from(oauthStates)
    .where(
      and(
        eq(oauthStates.provider, "GOOGLE"),
        eq(oauthStates.stateHash, stateHash),
        isNull(oauthStates.usedAt),
        gt(oauthStates.expiresAt, new Date()),
      ),
    )
    .limit(1);
  if (!oauthState) return callbackRedirect(request, "/login?google=expired_request");

  const { clientId, clientSecret, redirectUri } = googleConfig();
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenResponse.ok) return callbackRedirect(request, "/login?google=exchange_failed");
  const token = await tokenResponse.json();
  if (!token.access_token) return callbackRedirect(request, "/login?google=identity_failed");
  const identityResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: "Bearer " + token.access_token },
  });
  if (!identityResponse.ok) return callbackRedirect(request, "/login?google=identity_failed");
  const identity = await identityResponse.json();
  const parsedIdentity = parseGoogleIdentity(identity);
  if (!parsedIdentity) {
    return callbackRedirect(request, "/login?google=unverified_email");
  }
  const email = parsedIdentity.email;
  await database
    .update(oauthStates)
    .set({
      providerAccountId: parsedIdentity.providerAccountId,
      email,
      displayName: parsedIdentity.displayName,
      profileImageUrl: parsedIdentity.profileImageUrl,
    })
    .where(eq(oauthStates.id, oauthState.id));

  const [account] = await database
    .select({ userId: oauthAccounts.userId })
    .from(oauthAccounts)
    .where(
      and(
        eq(oauthAccounts.provider, "GOOGLE"),
        eq(oauthAccounts.providerAccountId, parsedIdentity.providerAccountId),
      ),
    )
    .limit(1);
  if (account) {
    await database
      .update(oauthStates)
      .set({ usedAt: new Date() })
      .where(eq(oauthStates.id, oauthState.id));
    await createSession(database, account.userId);
    return callbackRedirect(request, "/browse");
  }

  const [existingUser] = await database
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existingUser) {
    await database
      .update(oauthStates)
      .set({ usedAt: new Date() })
      .where(eq(oauthStates.id, oauthState.id));
    return callbackRedirect(request, "/login?google=account_exists");
  }
  return callbackRedirect(request, "/auth/google/complete?state=" + encodeURIComponent(state));
}

const completionInput = z.object({
  state: z.string().min(20).max(100),
  roles: z
    .array(z.enum(["SEEKER", "LANDLORD"]))
    .min(1)
    .max(2),
  termsAccepted: z.literal(true),
});

export const completeGoogleSignup = createServerFn({ method: "POST" })
  .validator((data) => completionInput.parse(data))
  .handler(async ({ data }) => {
    const database = getDatabase();
    const [oauthState] = await database
      .select()
      .from(oauthStates)
      .where(
        and(
          eq(oauthStates.provider, "GOOGLE"),
          eq(oauthStates.stateHash, await hashState(data.state)),
          isNull(oauthStates.usedAt),
          gt(oauthStates.expiresAt, new Date()),
        ),
      )
      .limit(1);
    if (!oauthState?.providerAccountId || !oauthState.email) {
      throw new Error("Google signup session is invalid or expired.");
    }
    const roles = normalizeGoogleRoles(data.roles);
    const [collision] = await database
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, oauthState.email))
      .limit(1);
    if (collision)
      throw new Error(
        "An account with this email already exists. Sign in with your password first.",
      );
    const [user] = await database
      .insert(users)
      .values({ email: oauthState.email, termsAcceptedAt: new Date(), termsVersion: TERMS_VERSION })
      .returning({ id: users.id });
    await database.insert(userRoles).values(roles.map((role) => ({ userId: user.id, role })));
    await database.insert(profiles).values({
      userId: user.id,
      displayName: oauthState.displayName,
      profileImageUrl: oauthState.profileImageUrl,
    });
    await database.insert(oauthAccounts).values({
      provider: "GOOGLE",
      providerAccountId: oauthState.providerAccountId,
      userId: user.id,
    });
    await database
      .update(oauthStates)
      .set({ usedAt: new Date() })
      .where(eq(oauthStates.id, oauthState.id));
    await createSession(database, user.id);
    return { userId: user.id, roles };
  });
