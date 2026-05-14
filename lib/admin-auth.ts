import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_COOKIE_NAME = "comeup_admin_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 14;

type AdminConfig = {
  password: string;
  secret: string;
  username: string;
};

function getAdminConfig(): AdminConfig {
  const username = process.env.ADMIN_LOGIN_USERNAME?.trim();
  const password = process.env.ADMIN_LOGIN_PASSWORD?.trim();
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();

  if (!username || !password || !secret) {
    throw new Error(
      "Admin auth is not configured. Set ADMIN_LOGIN_USERNAME, ADMIN_LOGIN_PASSWORD, and ADMIN_SESSION_SECRET.",
    );
  }

  return { username, password, secret };
}

function signPayload(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function encodeSessionToken(username: string, secret: string) {
  const payload = Buffer.from(
    JSON.stringify({
      expiresAt: Date.now() + SESSION_DURATION_MS,
      username,
    }),
  ).toString("base64url");

  return `${payload}.${signPayload(payload, secret)}`;
}

function decodeSessionToken(token: string, secret: string) {
  const [payload, signature] = token.split(".");

  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(payload, secret);
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    providedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as {
      expiresAt?: number;
      username?: string;
    };

    if (
      !parsed.username ||
      typeof parsed.expiresAt !== "number" ||
      parsed.expiresAt < Date.now()
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function isAdminAuthConfigured() {
  return Boolean(
    process.env.ADMIN_LOGIN_USERNAME?.trim() &&
      process.env.ADMIN_LOGIN_PASSWORD?.trim() &&
      process.env.ADMIN_SESSION_SECRET?.trim(),
  );
}

export async function createAdminSession() {
  const { secret, username } = getAdminConfig();
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_COOKIE_NAME, encodeSessionToken(username, secret), {
    httpOnly: true,
    maxAge: SESSION_DURATION_MS / 1000,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}

export async function hasValidAdminSession() {
  if (!isAdminAuthConfigured()) {
    return false;
  }

  const { secret, username } = getAdminConfig();
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!token) {
    return false;
  }

  const parsed = decodeSessionToken(token, secret);
  return parsed?.username === username;
}

export async function requireAdminAuth() {
  const isAuthenticated = await hasValidAdminSession();

  if (!isAuthenticated) {
    redirect("/admin/login");
  }
}

export function validateAdminCredentials(input: {
  password: string;
  username: string;
}) {
  const config = getAdminConfig();

  return (
    input.username.trim() === config.username &&
    input.password === config.password
  );
}
