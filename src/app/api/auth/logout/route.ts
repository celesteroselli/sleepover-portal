import { COOKIE } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest) {
  const res = NextResponse.redirect(new URL("/", request.nextUrl.origin));
  res.cookies.set(COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
