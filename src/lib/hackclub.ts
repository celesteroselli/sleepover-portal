import { logOAuthTrace, logOAuthError } from "@/lib/auth-oauth-debug";

const AUTH_BASE = "https://auth.hackclub.com";

export type HackClubMe = {
  identity?: {
    id?: string;
    primary_email?: string;
    first_name?: string;
    last_name?: string;
    slack_id?: string;
    verification_status?: string;
    [key: string]: unknown;
  };
  sub?: string;
  id?: string;
  name?: string;
  email?: string;
  slack_id?: string;
  slackId?: string;
  [key: string]: unknown;
};

export async function exchangeCodeForTokens(code: string) {
  // Must match the redirect_uri sent to /oauth/authorize and the OAuth app's allowlist.
  const redirect_uri = process.env.HACK_CLUB_REDIRECT_URI!;
  const client_id = process.env.HACK_CLUB_CLIENT_ID!;

  logOAuthTrace("token:request", {
    url: `${AUTH_BASE}/oauth/token`,
    redirect_uri,
    client_id_prefix: client_id ? `${client_id.slice(0, 10)}…` : "(missing)",
    client_id_length: client_id?.length ?? 0,
    client_secret_set: Boolean(process.env.HACK_CLUB_CLIENT_SECRET),
    code_length: code.length,
  });

  const body = {
    client_id,
    client_secret: process.env.HACK_CLUB_CLIENT_SECRET!,
    redirect_uri,
    code,
    grant_type: "authorization_code",
  };

  const res = await fetch(`${AUTH_BASE}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    logOAuthError("token:response_error", {
      httpStatus: res.status,
      responseBody: text.length > 2000 ? `${text.slice(0, 2000)}…` : text,
    });
    throw new Error(`Token exchange failed: ${res.status} ${text}`);
  }

  return res.json() as Promise<{
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token?: string;
    scope?: string;
  }>;
}

export async function fetchHackClubMe(accessToken: string): Promise<HackClubMe> {
  const res = await fetch(`${AUTH_BASE}/api/v1/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const text = await res.text();
    logOAuthError("me:response_error", {
      httpStatus: res.status,
      responseBody: text.length > 1500 ? `${text.slice(0, 1500)}…` : text,
    });
    throw new Error(`Hack Club /me failed: ${res.status} ${text}`);
  }

  return res.json() as Promise<HackClubMe>;
}

export function buildAuthorizeUrl(state: string) {
  const clientId = process.env.HACK_CLUB_CLIENT_ID!;
  const redirectUri = process.env.HACK_CLUB_REDIRECT_URI!;
  // Same value as token exchange; if prod still has localhost here, OAuth returns to localhost.
  const scope = [
    "openid",
    "profile",
    "email",
    "name",
    "slack_id",
    "verification_status",
  ].join(" ");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope,
    state,
  });

  return `${AUTH_BASE}/oauth/authorize?${params.toString()}`;
}
