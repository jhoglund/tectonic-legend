# Accounts — build plan

The engineering plan behind [ADR-0013](decisions/ADR-0013-accounts-on-a-custom-backend.md):
player accounts on a custom backend, so progress survives uninstall and
follows the player across devices.

This is a **project**, not a task — it reverses the local-only v1, adds
a security-critical service, and changes the App Store privacy posture.
It is written as a plan first, deliberately, so the stack, data model,
and auth design get a review before any auth code is written. Auth done
wrong is a serious vulnerability; this is not a thing to autonomously
hand-roll and walk away from.

---

## 1. Stack (recommended — confirm before build)

| Layer | Choice | Why |
|-------|--------|-----|
| API | **Hono** on Node (or Cloudflare Workers) | Tiny, modern, portable. Lighter than Next.js for an API-only service; runs where Jonas already deploys (the diet-app uses a Cloudflare Worker). |
| DB | **Postgres + Drizzle ORM** | Mirrors the Mimir stack exactly — same ORM, same migration tooling, one mental model for Jonas's infra. |
| Hosting | Jonas's call | Worker + a hosted Postgres (Neon, or his own), or a small Node host (Fly.io / Railway). Confirm at build time. |
| Repo | **New private repo** `tectonic-api` | Per Jonas's new-project convention. The backend is its own deploy unit. |

Auth: **email + password**, argon2id hashing, a short-lived access
token (~15 min) + a refresh token. **Sign in with Apple** is a
fast-follow — it needs Apple Developer enrolment and is the cleaner
default for the iOS app, but email/password is the portable baseline.

## 2. Data model

```
users
  id            uuid pk
  email         citext unique
  password_hash text            -- argon2id
  created_at    timestamptz
  apple_sub     text unique null -- reserved for Sign in with Apple

profiles
  user_id       uuid pk → users.id
  data          jsonb           -- the PlayerProfile blob (schemaVersion'd)
  updated_at    timestamptz     -- drives last-write-wins sync

refresh_tokens
  id            uuid pk
  user_id       uuid → users.id
  token_hash    text
  expires_at    timestamptz
  revoked       boolean
```

The `profiles.data` blob is the existing `PlayerProfile` shape
(`src/lib/profile.ts`) — storing it whole keeps the server schema-stable
as the profile evolves; `schemaVersion` already lives inside it.

## 3. API surface

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/auth/signup` | email + password → tokens |
| POST | `/auth/login` | → tokens |
| POST | `/auth/refresh` | refresh token → new access token |
| POST | `/auth/logout` | revoke the refresh token |
| GET | `/profile` | the signed-in user's profile blob + `updatedAt` |
| PUT | `/profile` | replace the blob (carries the client `updatedAt`) |

All over HTTPS; auth endpoints rate-limited.

## 4. Sync model

The profile stays **local-first** — the app is fully playable signed
out, exactly as today. When signed in:

- **On sign-in:** fetch the server profile. Reconcile with the local
  one by `updatedAt`, last-write-wins. If the server has no profile
  yet (first sign-in), push the local one — the player's existing
  local progress becomes their account.
- **On change:** the local profile is the working copy; a debounced
  `PUT /profile` pushes it up.
- **Conflicts:** last-write-wins on the whole blob for v1. A
  field-level merge (e.g. take the max streak, union solve history) is
  a refinement, noted but not v1.

## 5. Client-side work (this repo)

- `src/lib/accountsApi.ts` — typed API client + DTOs (the contract).
- An **auth context/provider** — current user, tokens (Capacitor
  Secure Storage on device; in-memory + httpOnly cookie on web).
- **Screens:** Sign in / Sign up, and an Account screen in Settings
  with the **Log out** row — which is what kicked this off.
- `ProfileProvider` gains the sync layer (pull on sign-in, debounced
  push on change).
- Token-refresh handling on 401.

## 6. Security checklist

- argon2id for password hashing; never store or log plaintext.
- Access tokens short-lived; refresh tokens hashed at rest, revocable.
- Rate-limit `/auth/*`; generic error messages (no "email exists").
- HTTPS only; secrets server-side only, never in the client bundle.
- The client never sends a password anywhere but `/auth/{signup,login}`.
- A security review of the auth flow before launch — non-negotiable.

## 7. What Jonas must provide

- A hosting target for the API + a Postgres instance.
- The `tectonic-api` repo (or confirm a monorepo subdir instead).
- Production secrets (JWT signing key, DB URL) — set in the host, not git.
- A **Privacy Policy URL** — now mandatory (data leaves the device).
- Apple Developer enrolment — needed for the Sign in with Apple follow-up.

## 8. Phasing

1. **Backend** — `tectonic-api`: schema + migrations, `/auth/*`,
   `/profile`. Runnable locally on docker Postgres (Mimir pattern).
2. **Client auth** — `accountsApi`, auth context, Sign in / Sign up,
   the Account screen + **Log out** in Settings.
3. **Sync** — wire `ProfileProvider` to pull/push; the first-sign-in
   local-profile adoption.
4. **Privacy rework** — update `docs/app-store-launch.md`, the privacy
   manifest, and the App Store privacy labels.
5. **Sign in with Apple** — fast-follow, post Apple enrolment.

## 9. Open decision — launch timing

Accounts are a big chunk. Shipping them **before** the soft launch
(item 24) delays the launch; shipping **after** means migrating
already-launched local-only users (workable — first sign-in adopts the
local profile, §4). Recommendation: **soft-launch local-only as
planned, add accounts as the first post-launch feature** — it does not
gate the retention/conversion signal the soft launch is there to read,
and the sync model already handles the later migration cleanly.
