/**
 * Validates `next` for post-login redirects. Blocks open redirects, encoded
 * slashes (`/%2f%2f…`), traversal hints, and control characters.
 */
export function safeNextPath(next: string | undefined): string | null {
  if (typeof next !== "string" || next.length === 0 || next.length > 2048) {
    return null;
  }
  if (!next.startsWith("/") || next.startsWith("//")) {
    return null;
  }
  if (next.includes("\\") || /[\u0000-\u001f\u007f]/.test(next)) {
    return null;
  }
  if (next.includes("://")) {
    return null;
  }

  let decoded = next;
  for (let i = 0; i < 6; i++) {
    try {
      const d = decodeURIComponent(decoded);
      if (d === decoded) break;
      decoded = d;
    } catch {
      return null;
    }
  }
  if (
    decoded.startsWith("//") ||
    decoded.includes("://") ||
    decoded.includes("\\") ||
    decoded.includes("\0")
  ) {
    return null;
  }
  if (decoded.includes("/../") || decoded.endsWith("/..")) {
    return null;
  }

  try {
    const u = new URL(next, "https://internal.invalid");
    if (u.hostname !== "internal.invalid") {
      return null;
    }
  } catch {
    return null;
  }
  return next;
}
