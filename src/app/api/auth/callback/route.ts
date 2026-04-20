import { createSessionToken, COOKIE } from "@/lib/auth";
import { exchangeCodeForTokens, fetchHackClubMe } from "@/lib/hackclub";
import { OAUTH_STATE_COOKIE } from "@/lib/oauth-csrf";
import { getPublicOriginFromRequest } from "@/lib/public-origin";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

function clearOAuthStateCookie(res: NextResponse) {
  res.cookies.set(OAUTH_STATE_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
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

  if (oauthError) {
    const res = NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(oauthError)}`, origin)
    );
    clearOAuthStateCookie(res);
    return res;
  }
  if (!code) {
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
    const res = NextResponse.redirect(
      new URL("/login?error=invalid_state", origin)
    );
    clearOAuthStateCookie(res);
    return res;
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const me = await fetchHackClubMe(tokens.access_token);
    const identity =
      me.identity && typeof me.identity === "object" ? me.identity : undefined;

    const hcSub =
      (identity && typeof identity.id === "string" && identity.id) ||
      (typeof me.sub === "string" && me.sub) ||
      (typeof me.id === "string" && me.id) ||
      null;
    if (!hcSub) {
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
    return res;
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[auth/callback] callback_failed:", message);
    const res = NextResponse.redirect(
      new URL("/login?error=callback_failed", origin)
    );
    clearOAuthStateCookie(res);
    return res;
  }
}
