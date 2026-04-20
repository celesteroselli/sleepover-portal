import { buildAuthorizeUrl } from "@/lib/hackclub";
import {
  OAUTH_STATE_COOKIE,
  OAUTH_STATE_MAX_AGE_SEC,
  oauthStateCookieBaseOptions,
} from "@/lib/oauth-csrf";
import { randomBytes } from "crypto";
import { NextResponse } from "next/server";

export async function GET() {
  const state = randomBytes(32).toString("base64url");
  const res = NextResponse.redirect(buildAuthorizeUrl(state));
  res.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, private"
  );
  res.cookies.set(OAUTH_STATE_COOKIE, state, {
    ...oauthStateCookieBaseOptions(),
    maxAge: OAUTH_STATE_MAX_AGE_SEC,
  });
  return res;
}
