# Security, user data, and API surface

This document describes how the Sleepover Portal handles authentication, what user data exists and where it flows, every HTTP API route’s access rules, and security controls in the codebase.

It is not a legal privacy policy; use it as engineering reference and for threat-modeling.

---

## 1. Threat model (short)

| Asset | Primary risks | Mitigations in repo |
|--------|----------------|----------------------|
| Session cookie (`hc_portal_session`) | Theft, forgery | HttpOnly, signed JWT (HS256), `secure` in production, `sameSite: lax` |
| SQLite `User` / `MemoryPhoto` | Unauthorized read/write | Session checks on APIs; admin Slack ID allowlist; Prisma (parameterized queries) |
| Uploaded images on disk | Disk fill, path traversal on delete | Max upload size; unlink path confined under `public/uploads/memories/` |
| OAuth authorization code | Interception, CSRF login | HTTPS in production; `state` + HttpOnly cookie validated on callback |
| Post-login redirect `next` | Open redirect | `safeNextPath()` validation |
| User PII in JSON (memories API) | Over-sharing to any logged-in user | `GET/POST` `/api/memories` omit uploader PII unless caller is admin (Slack allowlist) |

---

## 2. Authentication and session

### 2.1 Hack Club OAuth

- **Authorize**: `GET /api/auth/login` generates a random `state` (32 random bytes, base64url), stores it in HttpOnly cookie `hc_oauth_state`, redirects to `https://auth.hackclub.com/oauth/authorize` with `client_id`, `redirect_uri`, `response_type=code`, `scope`, and `state`.
- **Callback**: `GET /api/auth/callback` validates `state` matches `hc_oauth_state`, then exchanges `code` for tokens server-side (`HACK_CLUB_CLIENT_ID`, `HACK_CLUB_CLIENT_SECRET`, `HACK_CLUB_REDIRECT_URI`). It never exposes the refresh/access token to the browser.
- **Userinfo**: Server calls `https://auth.hackclub.com/api/v1/me` with the access token, then **upserts** a `User` row in SQLite.

### 2.2 Session JWT (`hc_portal_session`)

Created in `src/lib/auth.ts` with `jose` (`SignJWT` / `jwtVerify`).

**Cookie flags** (set in callback, cleared on logout):

- `httpOnly: true`
- `secure: process.env.NODE_ENV === "production"`
- `sameSite: "lax"`
- `path: "/"`
- `maxAge`: 7 days (session token expiration matches)

**JWT claims** (custom payload, plus `sub`):

| Claim | Source | Purpose |
|--------|--------|---------|
| `sub` | Hack Club subject (`hcSub`) | Stable identity from IdP |
| `userId` | Internal Prisma `User.id` | Foreign keys, uploads |
| `name` | Hack Club profile | UI (“Welcome …”) |
| `email` | Hack Club profile | Display / admin tables |
| `slackId` | Hack Club `slack_id` | Admin gate |

**Secret**: `SESSION_SECRET` must be set and at least 16 characters (`secretKey()` throws otherwise).

### 2.3 Logout

- **`POST /api/auth/logout`** only (no `GET`). Clears `hc_portal_session` and redirects to `/`. POST avoids trivial cross-site logout via `<img src="...">` while session remains `SameSite=Lax`.

### 2.4 Route protection

- **`src/middleware.ts`**: For paths under `/home`, `/schedule`, `/faq`, `/ticket`, `/memories`, `/admin`, requires a valid session JWT. Unauthenticated users redirect to `/login?next=<pathname>`.
- **`/api/*` is not in the middleware matcher**; each route handler calls `getSession()` (or equivalent) itself.
- **`/admin`**: Middleware also requires `session.slackId` ∈ `ADMIN_SLACK_IDS` (comma-separated env). **`src/app/(authenticated)/admin/page.tsx`** repeats the same check (defense in depth).

### 2.5 Post-login redirect (`next`)

`src/app/login/page.tsx` uses `safeNextPath()` (`src/lib/safe-redirect.ts`) so values like `//evil.com`, encoded `//`, `://`, control characters, and obvious `..` segments in the path are rejected. Safe values must be same-origin relative paths.

---

## 3. User data inventory

### 3.1 Database (`prisma/schema.prisma`)

**`User`**

| Field | Meaning |
|--------|---------|
| `id` | Internal cuid |
| `hcSub` | Unique Hack Club OAuth subject |
| `name`, `email`, `slackId` | From Hack Club `/me` (nullable strings) |
| `createdAt`, `updatedAt` | Audit |

**`MemoryPhoto`**

| Field | Meaning |
|--------|---------|
| `id` | cuid |
| `publicPath` | URL path served from `public/` (e.g. `/uploads/memories/<uuid>.jpg`) |
| `caption` | Optional user text |
| `createdAt` | Timestamp |
| `userId` | Uploader |

### 3.2 Filesystem

- **`public/uploads/memories/*`**: Binary uploads; filenames are `randomUUID()` + extension from allowed MIME list. Gitignored except `.gitkeep`.

### 3.3 Environment variables (secrets / config)

| Variable | Role |
|----------|------|
| `SESSION_SECRET` | JWT signing key |
| `DATABASE_URL` | SQLite connection string |
| `HACK_CLUB_CLIENT_ID`, `HACK_CLUB_CLIENT_SECRET`, `HACK_CLUB_REDIRECT_URI` | OAuth client — **`HACK_CLUB_REDIRECT_URI` must exactly match** the callback URL allowed in the Hack Club OAuth app and the URL the browser uses (scheme, host, path, no trailing slash unless registered). If it still says `localhost`, production login will send users to Hack Club with a localhost `redirect_uri`, and after auth the browser hits **localhost**, not your portal. |
| `PORTAL_PUBLIC_URL` | Optional, e.g. `https://portal.sleepover.hackclub.com` — used for same-origin redirects when `Host` / `nextUrl.origin` are wrong behind a reverse proxy (`X-Forwarded-Host` is also used when `PORTAL_PUBLIC_URL` is unset). |
| `ADMIN_SLACK_IDS` | Comma-separated Slack user IDs allowed into `/admin` |
| `NEXT_PUBLIC_HOME_ASTEROID_URL` | Optional public asset URL (no auth) |

### 3.4 Where user data appears in the UI

- **Home**: `session.name` in welcome text.
- **Memories**: Loads photos via `GET /api/memories` (caption, image, timestamps only—no uploader PII in JSON). Admin moderation uses server-rendered Prisma data on `/admin`, not this API.
- **Admin** (Slack allowlist only): Full user table including `hcSub`, email, Slack ID, photo counts; memory moderation.

### 3.5 Logging

- In **development**, Prisma logs queries (`query`, `warn`, `error`), which can include parameter values (e.g. emails in SQL). Production logs only `error`. Avoid copying production DB logs to untrusted parties.

---

## 4. API endpoints (complete list)

All routes live under `src/app/api/`.

### `GET /api/auth/login`

| | |
|--|--|
| **Auth** | None |
| **Behavior** | Sets `hc_oauth_state` cookie; **302** to Hack Club authorize URL with matching `state`. |
| **Response body** | Redirect (no JSON). |
| **Risks mitigated** | OAuth CSRF via `state`. |

### `GET /api/auth/callback`

| | |
|--|--|
| **Auth** | None (OAuth redirect target; uses `code` + `state`) |
| **Query** | `code`, `state`; optional `error` from IdP |
| **Behavior** | Validates `state` vs cookie; exchanges code; fetches `/me`; upserts `User`; sets `hc_portal_session`; clears `hc_oauth_state`; **302** to `/home` or `/login?error=…`. |
| **Response body** | Redirect. |
| **Errors** | Generic `callback_failed` on thrown errors (details in server log only). |

### `POST /api/auth/logout`

| | |
|--|--|
| **Auth** | None required (clears session if present) |
| **Behavior** | Clears `hc_portal_session`; **302** to `/`. |
| **Note** | Intended to be called via same-origin HTML form (`PortalNav`). |

### `GET /api/memories`

| | |
|--|--|
| **Auth** | **Required** — valid session JWT |
| **Behavior** | `findMany` on all `MemoryPhoto`, ordered by `createdAt` desc. |
| **Response** | `{ photos: { id, publicPath, caption, createdAt }[] }` — **no** `userId`, **no** `user`, **no** name, email, or Slack ID. |
| **Status** | `401` if no session |

### `POST /api/memories`

| | |
|--|--|
| **Auth** | **Required** |
| **Body** | `multipart/form-data`: field `photo` (File), optional `caption` (string) |
| **Validation** | `photo` must exist; `file.type` ∈ `{ image/jpeg, image/png, image/gif, image/webp }`; buffer **≤ 12 MB** |
| **Behavior** | Writes file under `public/uploads/memories/`; creates `MemoryPhoto` with `userId = session.userId`. |
| **Response** | If `session.slackId` is in `ADMIN_SLACK_IDS`: `{ photo }` with `user: { id, name, slackId, email }` (for admin UI). Otherwise `{ photo: { id, publicPath, caption, createdAt } }` only. |
| **Status** | `400` missing/invalid file; `413` too large; `401` unauthorized |
| **Security note** | MIME type is **client-reported**; extension follows declared type. For stronger guarantees, add server-side magic-byte sniffing. |

### `DELETE /api/memories/[id]`

| | |
|--|--|
| **Auth** | **Required** + **`session.slackId` must be in `ADMIN_SLACK_IDS`** |
| **Behavior** | Loads photo by `id`; resolves `publicPath` on disk under `public/uploads/memories/` only; `unlink` if safe; deletes DB row. |
| **Response** | `{ ok: true }` or JSON error |
| **Status** | `401`, `403`, `404`, `400` (invalid storage path) |
| **Note** | Path guard prevents deleting arbitrary files even if DB were tampered with. |

---

## 5. Non-API exposure

### Static files (`public/`)

Anything under `public/` is **world-readable** without a session if the URL is known. Memory images use **unguessable UUID** filenames; there is **no** directory listing API. Caption text is not in the filename.

### Next.js global headers (`next.config.ts`)

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

(Strict CSP was not added to avoid breaking existing inline/styles; consider tightening later.)

---

## 6. What this document does not guarantee

- **No rate limiting** on auth or uploads (DoS / brute force is an operational concern).
- **No magic-byte** validation on uploads.
- **Memories images** remain guessable only by UUID URL under `public/`; captions are in the API/DB, not filenames.
- **Dependency vulnerabilities**: run `npm audit` / Dependabot on your own schedule.
- **Host / TLS / WAF** configuration is outside this repo.

---

## 7. Change log (security-related edits)

- OAuth **`state`** + HttpOnly cookie; validated on callback.
- **`safeNextPath`** for post-login `next` parameter.
- Memory upload **12 MB** cap; delete path **confined** to `uploads/memories/`.
- **Admin page** server-side `isAdminSlackId` check in addition to middleware.
- **Global security headers** in `next.config.ts`.
- **Logout** changed from `GET` to **`POST`** only.
- **`GET/POST` `/api/memories`**: non-admin responses omit uploader PII (`userId`, name, email, Slack ID); admins still get full `user` on **`POST`** responses only for moderation UI.
