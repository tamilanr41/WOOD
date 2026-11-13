import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "mp_session";

const secretKey =
  process.env.JWT_SECRET ||
  "mariya-plywoods-dev-secret-change-in-production-32chars";
const encodedKey = new TextEncoder().encode(secretKey);

export type SessionPayload = {
  userId: string;
  email: string;
  name: string;
  role: "customer" | "admin";
};

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedKey);
    if (
      typeof payload.userId === "string" &&
      typeof payload.email === "string" &&
      typeof payload.name === "string" &&
      (payload.role === "customer" || payload.role === "admin")
    ) {
      return {
        userId: payload.userId,
        email: payload.email,
        name: payload.name,
        role: payload.role,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export function sessionCookieOptions(maxAgeSeconds = 60 * 60 * 24 * 7) {
  return {
    name: SESSION_COOKIE,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

