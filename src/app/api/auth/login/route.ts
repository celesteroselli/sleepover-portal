import { buildAuthorizeUrl } from "@/lib/hackclub";
import { logOAuthTrace } from "@/lib/auth-oauth-debug";
import {
  OAUTH_STATE_COOKIE,
  OAUTH_STATE_MAX_AGE_SEC,
  oauthStateCookieBaseOptions,
} from "@/lib/oauth-csrf";
import { getPublicOriginFromRequest } from "@/lib/public-origin";
import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const state = randomBytes(32).toString("base64url");
  const authorizeUrl = buildAuthorizeUrl(state);
  const cookieOpts = oauthStateCookieBaseOptions();

  logOAuthTrace("login:start", {
    requestUrl: request.url,
    host: request.headers.get("host"),
    forwardedHost: request.headers.get("x-forwarded-host"),
    forwardedProto: request.headers.get("x-forwarded-proto"),
    nextUrlOrigin: request.nextUrl.origin,
    computedPublicOrigin: getPublicOriginFromRequest(request),
    nodeEnv: process.env.NODE_ENV,
    HACK_CLUB_REDIRECT_URI: process.env.HACK_CLUB_REDIRECT_URI ?? "(MISSING — token + authorize will fail)",
    clientIdSet: Boolean(process.env.HACK_CLUB_CLIENT_ID),
    clientSecretSet: Boolean(process.env.HACK_CLUB_CLIENT_SECRET),
    PORTAL_PUBLIC_URL: process.env.PORTAL_PUBLIC_URL ?? "(unset)",
    oauthStateCookie: { ...cookieOpts, maxAge: OAUTH_STATE_MAX_AGE_SEC },
    stateFingerprint: `${state.length} chars (base64url)`,
    authorizeUrlPreview: authorizeUrl.slice(0, 280) + (authorizeUrl.length > 280 ? "…" : ""),
    authorizeUrlLength: authorizeUrl.length,
  });

  const res = NextResponse.redirect(authorizeUrl);
  res.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, private"
  );
  res.cookies.set(OAUTH_STATE_COOKIE, state, {
    ...cookieOpts,
    maxAge: OAUTH_STATE_MAX_AGE_SEC,
  });
  return res;
}
