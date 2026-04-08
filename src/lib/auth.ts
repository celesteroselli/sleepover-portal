import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE = "hc_portal_session";

export type SessionUser = {
  sub: string;
  userId: string;
  name: string | null;
  email: string | null;
  slackId: string | null;
};

function secretKey() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error("SESSION_SECRET must be set (min 16 characters)");
  }
  return new TextEncoder().encode(s);
}

export async function createSessionToken(user: SessionUser, maxAgeSec = 60 * 60 * 24 * 7) {
  return new SignJWT({
    userId: user.userId,
    name: user.name,
    email: user.email,
    slackId: user.slackId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.sub)
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSec}s`)
    .sign(secretKey());
}

export async function verifySessionToken(
  token: string
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    const sub = typeof payload.sub === "string" ? payload.sub : null;
    const userId = typeof payload.userId === "string" ? payload.userId : null;
    if (!sub || !userId) return null;
    return {
      sub,
      userId,
      name: typeof payload.name === "string" ? payload.name : null,
      email: typeof payload.email === "string" ? payload.email : null,
      slackId: typeof payload.slackId === "string" ? payload.slackId : null,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return null;
  return verifySessionToken(raw);
}

export function parseAdminSlackIds(): Set<string> {
  const raw = process.env.ADMIN_SLACK_IDS ?? "";
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );
}

export function isAdminSlackId(slackId: string | null | undefined): boolean {
  if (!slackId) return false;
  return parseAdminSlackIds().has(slackId);
}

export { COOKIE };
