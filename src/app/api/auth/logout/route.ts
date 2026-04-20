import { COOKIE } from "@/lib/auth";
import { getPublicOriginFromRequest } from "@/lib/public-origin";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST-only so cross-site GET (e.g. embedded images) cannot clear the session
 * while SameSite=Lax cookies are withheld on cross-site POSTs from other sites.
 */
export async function POST(request: NextRequest) {
  const origin = getPublicOriginFromRequest(request);
  const res = NextResponse.redirect(new URL("/", origin));
  res.cookies.set(COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
