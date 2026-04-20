import type { NextRequest } from "next/server";

/**
 * Origin for same-site redirects (OAuth callback errors, logout).
 *
 * Set `PORTAL_PUBLIC_URL` in production (e.g. `https://portal.sleepover.hackclub.com`)
 * if `request.nextUrl.origin` is wrong behind a reverse proxy. Do not set it in local
 * dev unless you intend redirects to use that host.
 */
export function getPublicOriginFromRequest(request: NextRequest): string {
  const explicit = process.env.PORTAL_PUBLIC_URL?.trim();
  if (explicit) {
    try {
      const href = /^https?:\/\//i.test(explicit)
        ? explicit
        : `https://${explicit}`;
      return new URL(href).origin;
    } catch {
      /* fall through */
    }
  }

  const xfHost = request.headers.get("x-forwarded-host");
  if (xfHost) {
    const host = xfHost.split(",")[0]?.trim();
    if (host) {
      const proto =
        request.headers
          .get("x-forwarded-proto")
          ?.split(",")[0]
          ?.trim() ?? "https";
      return `${proto}://${host}`;
    }
  }

  return request.nextUrl.origin;
}
