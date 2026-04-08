import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken, COOKIE } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const protectedPrefixes = [
    "/home",
    "/schedule",
    "/faq",
    "/ticket",
    "/memories",
    "/admin",
  ] as const;
  const isProtected = protectedPrefixes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get(COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const raw = process.env.ADMIN_SLACK_IDS ?? "";
    const admins = new Set(
      raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    );
    if (!session.slackId || !admins.has(session.slackId)) {
      return NextResponse.redirect(new URL("/home", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/home",
    "/home/:path*",
    "/schedule",
    "/schedule/:path*",
    "/faq",
    "/faq/:path*",
    "/ticket",
    "/ticket/:path*",
    "/memories",
    "/memories/:path*",
    "/admin",
    "/admin/:path*",
  ],
};
