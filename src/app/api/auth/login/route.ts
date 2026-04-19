import { buildAuthorizeUrl } from "@/lib/hackclub";
import {
  OAUTH_STATE_COOKIE,
  OAUTH_STATE_MAX_AGE_SEC,
} from "@/lib/oauth-csrf";
import { randomBytes } from "crypto";
import { NextResponse } from "next/server";

export async function GET() {
  const state = randomBytes(32).toString("base64url");
  const res = NextResponse.redirect(buildAuthorizeUrl(state));
  res.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: OAUTH_STATE_MAX_AGE_SEC,
  });
  return res;
}
