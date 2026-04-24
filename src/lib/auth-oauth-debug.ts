/**
 * Verbose OAuth diagnostics for `/api/auth/login` and `/api/auth/callback`.
 * Extra steps (token_ok, success, etc.): set AUTH_DEBUG_LOG=1.
 */
export function oauthConsoleDebugEnabled(): boolean {
  return (
    process.env.AUTH_DEBUG_LOG === "1" ||
    process.env.AUTH_DEBUG_LOG === "true" ||
    /^yes$/i.test(process.env.AUTH_DEBUG_LOG ?? "")
  );
}

function clip(s: string, max: number): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max)}…[total ${s.length} chars]`;
}

/** Safe prefix for correlating URL vs cookie state (not a password). */
export function stateFingerprint(state: string | null | undefined): string {
  if (!state) return "(empty)";
  return `${state.length} chars, starts "${clip(state, 16)}"`;
}

/** High-signal lines (login, callback hit, token POST) — always logged */
export function logOAuthTrace(section: string, data: Record<string, unknown>) {
  console.log(
    `[oauth-trace] ${section}`,
    JSON.stringify({ ...data, at: new Date().toISOString() }, null, 2)
  );
}

/** Extra detail when AUTH_DEBUG_LOG=1 */
export function logOAuth(section: string, data: Record<string, unknown>) {
  if (!oauthConsoleDebugEnabled()) return;
  console.log(
    `[oauth-debug] ${section}`,
    JSON.stringify({ ...data, at: new Date().toISOString() }, null, 2)
  );
}

/** Always printed (failures) */
export function logOAuthError(section: string, data: Record<string, unknown>) {
  console.error(
    `[oauth-error] ${section}`,
    JSON.stringify({ ...data, at: new Date().toISOString() }, null, 2)
  );
}

export function clipStack(s: string, max = 1200): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max)}…[truncated]`;
}
