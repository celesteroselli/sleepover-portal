import {
  clipStack,
  logOAuth,
  logOAuthError,
  logOAuthTrace,
  oauthConsoleDebugEnabled,
  stateFingerprint,
} from "@/lib/auth-oauth-debug";
import { createSessionToken, COOKIE } from "@/lib/auth";
import { exchangeCodeForTokens, fetchHackClubMe } from "@/lib/hackclub";
import {
  OAUTH_STATE_COOKIE,
  oauthStateCookieBaseOptions,
} from "@/lib/oauth-csrf";
import { getPublicOriginFromRequest } from "@/lib/public-origin";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

function clearOAuthStateCookie(res: NextResponse) {
  res.cookies.set(OAUTH_STATE_COOKIE, "", {
    ...oauthStateCookieBaseOptions(),
    maxAge: 0,
  });
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const origin = getPublicOriginFromRequest(request);
  const code = url.searchParams.get("code");
  const oauthError = url.searchParams.get("error");
  const stateParam = url.searchParams.get("state");
  const expectedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value;
  const rawCookieHeader = request.headers.get("cookie") ?? "";

  logOAuthTrace("callback:incoming", {
    requestUrl: request.url,
    nextUrlHref: url.href,
    nextUrlOrigin: url.origin,
    computedRedirectOrigin: origin,
    host: request.headers.get("host"),
    forwardedHost: request.headers.get("x-forwarded-host"),
    forwardedProto: request.headers.get("x-forwarded-proto"),
    userAgent: request.headers.get("user-agent")?.slice(0, 160),
    idpError: oauthError,
    idpErrorDescription: url.searchParams.get("error_description"),
    hasCode: Boolean(code),
    codeLength: code?.length ?? 0,
    stateFromQuery: stateFingerprint(stateParam),
    stateFromCookie: stateFingerprint(expectedState),
    stateLengthsMatch:
      stateParam != null &&
      expectedState != null &&
      stateParam.length === expectedState.length,
    stateValuesMatch: stateParam === expectedState,
    rawCookieHeaderLength: rawCookieHeader.length,
    rawCookieHeaderContainsStateCookieName: rawCookieHeader.includes(
      `${OAUTH_STATE_COOKIE}=`
    ),
    cookieJarNames: request.cookies.getAll().map((c) => c.name),
    HACK_CLUB_REDIRECT_URI: process.env.HACK_CLUB_REDIRECT_URI ?? "(MISSING)",
    PORTAL_PUBLIC_URL: process.env.PORTAL_PUBLIC_URL ?? "(unset)",
    NODE_ENV: process.env.NODE_ENV,
    oauthStateCookieOptions: oauthStateCookieBaseOptions(),
  });

  if (oauthError) {
    logOAuthError("callback:idp_error_redirect", {
      oauthError,
      error_description: url.searchParams.get("error_description"),
    });
    const res = NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(oauthError)}`, origin)
    );
    clearOAuthStateCookie(res);
    return res;
  }
  if (!code) {
    logOAuthError("callback:missing_code", {
      queryKeys: [...url.searchParams.keys()],
    });
    const res = NextResponse.redirect(
      new URL("/login?error=missing_code", origin)
    );
    clearOAuthStateCookie(res);
    return res;
  }
  if (
    !stateParam ||
    !expectedState ||
    stateParam.length > 256 ||
    expectedState.length > 256 ||
    stateParam !== expectedState
  ) {
    logOAuthError("callback:invalid_state", {
      hasStateQuery: Boolean(stateParam),
      hasStateCookie: Boolean(expectedState),
      stateQueryLen: stateParam?.length ?? 0,
      stateCookieLen: expectedState?.length ?? 0,
      over256:
        (stateParam?.length ?? 0) > 256 || (expectedState?.length ?? 0) > 256,
      stateFromQuery: stateFingerprint(stateParam),
      stateFromCookie: stateFingerprint(expectedState),
      hint:
        !expectedState && rawCookieHeader.length === 0
          ? "No Cookie header — browser did not send cookies (SameSite/domain/https, or login was not same-site)."
          : !expectedState
            ? "Cookie header present but hc_oauth_state missing from parsed cookies — name/path/domain mismatch or stripped by proxy."
            : !stateParam
              ? "IdP did not return state query param."
              : stateParam !== expectedState
                ? "state query and cookie differ (second login tab, expired flow, or encoding mismatch)."
                : "unknown",
    });
    const res = NextResponse.redirect(
      new URL("/login?error=invalid_state", origin)
    );
    clearOAuthStateCookie(res);
    return res;
  }

  try {
    if (oauthConsoleDebugEnabled()) {
      logOAuth("callback:token_exchange_start", {
        redirect_uri: process.env.HACK_CLUB_REDIRECT_URI,
      });
    }
    const tokens = await exchangeCodeForTokens(code);
    if (oauthConsoleDebugEnabled()) {
      logOAuth("callback:token_ok", {
        token_type: tokens.token_type,
        expires_in: tokens.expires_in,
        access_token_present: Boolean(tokens.access_token),
      });
    }
    const me = await fetchHackClubMe(tokens.access_token);
    const identity =
      me.identity && typeof me.identity === "object" ? me.identity : undefined;

    const hcSub =
      (identity && typeof identity.id === "string" && identity.id) ||
      (typeof me.sub === "string" && me.sub) ||
      (typeof me.id === "string" && me.id) ||
      null;
    if (!hcSub) {
      logOAuthError("callback:no_subject", {
        meTopLevelKeys: me && typeof me === "object" ? Object.keys(me) : [],
        hasIdentity: Boolean(
          me.identity && typeof me.identity === "object"
        ),
      });
      const res = NextResponse.redirect(
        new URL("/login?error=no_subject", origin)
      );
      clearOAuthStateCookie(res);
      return res;
    }

    const slackRaw =
      (identity && "slack_id" in identity ? identity.slack_id : undefined) ??
      me.slack_id ??
      me.slackId;
    const slackId =
      slackRaw !== undefined && slackRaw !== null ? String(slackRaw) : null;
    const identityName =
      identity &&
      typeof identity.first_name === "string" &&
      typeof identity.last_name === "string"
        ? `${identity.first_name} ${identity.last_name}`.trim()
        : null;
    const name = identityName
      ? identityName
      : me.name !== undefined && me.name !== null
        ? String(me.name)
        : null;
    const identityEmail =
      identity && "primary_email" in identity ? identity.primary_email : undefined;
    const email =
      identityEmail !== undefined && identityEmail !== null
        ? String(identityEmail)
        : me.email !== undefined && me.email !== null
          ? String(me.email)
          : null;

    const user = await prisma.user.upsert({
      where: { hcSub },
      create: { hcSub, name, email, slackId },
      update: { name, email, slackId },
    });

    const jwt = await createSessionToken({
      sub: hcSub,
      userId: user.id,
      name: user.name,
      email: user.email,
      slackId: user.slackId,
    });

    const res = NextResponse.redirect(new URL("/home", origin));
    clearOAuthStateCookie(res);
    res.cookies.set(COOKIE, jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    logOAuth("callback:success", {
      userId: user.id,
      hcSubLength: hcSub.length,
      redirectTo: "/home",
    });
    return res;
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const stack = e instanceof Error ? e.stack : undefined;
    logOAuthError("callback:callback_failed", {
      message,
      stack: stack ? clipStack(stack) : undefined,
      redirect_uri_at_failure: process.env.HACK_CLUB_REDIRECT_URI,
      sessionSecretConfigured: Boolean(process.env.SESSION_SECRET),
      sessionSecretLength: process.env.SESSION_SECRET?.length ?? 0,
    });
    const res = NextResponse.redirect(
      new URL("/login?error=callback_failed", origin)
    );
    clearOAuthStateCookie(res);
    return res;
  }
}
