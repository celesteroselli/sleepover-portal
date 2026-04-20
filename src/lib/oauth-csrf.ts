/** HttpOnly cookie holding the OAuth `state` value until callback completes. */
export const OAUTH_STATE_COOKIE = "hc_oauth_state";

export const OAUTH_STATE_MAX_AGE_SEC = 600;

/**
 * After the IdP redirect, some browsers/proxies do not attach `SameSite=Lax`
 * cookies on the return navigation. `SameSite=None` + `Secure` is the usual
 * fix for OAuth state on HTTPS production. Local dev stays `Lax` + non-secure
 * for plain http://localhost.
 */
export function oauthStateCookieBaseOptions(): {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax" | "none";
  path: "/";
} {
  const isProduction = process.env.NODE_ENV === "production";
  if (isProduction) {
    return {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    };
  }
  return {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
  };
}
