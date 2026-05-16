# Accounts — build plan

The engineering plan behind [ADR-0013](decisions/ADR-0013-supabase-as-the-backend.md):
player accounts on **Supabase**, so progress survives uninstall and
follows the player across devices.

This is a **project**, not a task — it reverses the local-only v1, adds
a hosted dependency, and changes the App Store privacy posture. It is
written as a plan first, deliberately, so the data model and auth design
get a review before any client code is written.

Supabase makes this much lighter than the custom backend it replaces:
there is no server to host or secure, and no auth code to own — Supabase
manages Postgres, Auth, and Row-Level Security. The dev phase runs on
the **free tier**.

---

## 1. Platform

| Layer | Choice | Why |
|-------|--------|-----|
| Backend | **Supabase** (managed Postgres + Auth + RLS) | One platform for all backend needs. No server to host/secure/patch. Free tier covers the dev phase. |
| Client SDK | **`@supabase/supabase-js`** | Talks to Supabase directly — Postgres queries and auth from the app. No custom API layer. |
| Auth | **Supabase Auth**, email + password | Managed sign-up/login/refresh/reset. `Sign in with Apple` is a fast-follow (Supabase supports it as an OAuth provider once Apple enrolment lands). |
| Security | **Row-Level Security** | Every `profiles` row is readable/writable only by its owner. The anon key in the client bundle is public-safe — RLS is the boundary. |

No new repo: the Supabase integration lives in this repo. The schema is
checked in as a SQL migration under `supabase/`.

## 2. Data model

One table. The Supabase `auth.users` table (managed) holds identity;
`profiles` holds game state.

```
profiles
  id          uuid pk  →  auth.users.id   -- on delete cascade
  data        jsonb                       -- the PlayerProfile blob (schemaVersion'd)
  updated_at  timestamptz default now()   -- drives last-write-wins sync
```

The `data` blob is the existing `PlayerProfile` shape (`src/lib/profile.ts`)
— storing it whole keeps the table schema-stable as the profile evolves;
`schemaVersion` already lives inside it.

**RLS policies** (all four scoped to `auth.uid() = id`):

- `select` — a user reads only their own row.
- `insert` — a user inserts only a row with their own id.
- `update` — a user updates only their own row.
- A row is auto-created on first push (no trigger needed — the client
  upserts on first sign-in).

Schema + policies live in `supabase/schema.sql`, applied via the
Supabase SQL editor or the Supabase CLI.

## 3. Auth surface

All via `@supabase/supabase-js` — no endpoints to design:

| Call | Purpose |
|------|---------|
| `auth.signUp({ email, password })` | create an account |
| `auth.signInWithPassword(...)` | log in |
| `auth.signOut()` | log out — the original ask |
| `auth.getSession()` / `onAuthStateChange` | current session; token refresh is automatic |
| `auth.resetPasswordForEmail(...)` | password reset (email link) |

Supabase handles password hashing, token issue/refresh, and rate
limiting. Sessions persist via the SDK's storage adapter — Capacitor
Secure Storage on device, `localStorage` on web.

## 4. Sync model

The profile stays **local-first** — the app is fully playable signed
out, exactly as today. When signed in:

- **On sign-in:** fetch the server row. Reconcile with the local
  profile by `updatedAt`, last-write-wins. If the server has no row yet
  (first sign-in), `upsert` the local one — the player's existing local
  progress becomes their account.
- **On change:** the local profile is the working copy; a debounced
  `upsert` pushes it up.
- **Conflicts:** last-write-wins on the whole blob for v1. A
  field-level merge (e.g. take the max streak, union solve history) is
  a refinement, noted but not v1.

## 5. Client-side work (this repo)

- `src/lib/supabase.ts` — the env-driven Supabase client (created only
  when `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` are set; the app
  builds and runs with accounts simply absent when they are not).
- An **auth context/provider** — current session + user, sign-in /
  sign-up / sign-out actions.
- **Screens:** Sign in / Sign up, and an Account screen in Settings
  with the **Log out** row — which is what kicked this off.
- `ProfileProvider` gains the sync layer (pull on sign-in, debounced
  push on change, first-sign-in local-profile adoption).

## 6. Security checklist

- RLS enabled on `profiles`; every policy scoped to `auth.uid() = id`.
- The anon key is the only Supabase key in the client — never the
  service-role key.
- Auth email confirmations and rate limits configured in the Supabase
  dashboard.
- HTTPS only (Supabase default).
- A review of the RLS policies before launch — non-negotiable.

## 7. What Jonas must provide

- A **Supabase project** (free tier) — created in the Supabase
  dashboard.
- `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` — from the project's
  API settings, into `.env.local` for dev and the deploy
  variables/secrets for production.
- The `supabase/schema.sql` migration applied to the project.
- A **Privacy Policy URL** — now mandatory (data leaves the device).
- Apple Developer enrolment — needed for the Sign in with Apple
  follow-up.

## 8. Phasing

1. **Foundation** — `@supabase/supabase-js`, `src/lib/supabase.ts`,
   `supabase/schema.sql` (the `profiles` table + RLS), env wiring.
   *(client builds; accounts dormant until the project exists.)*
2. **Client auth** — auth context, Sign in / Sign up, the Account
   screen + **Log out** in Settings.
3. **Sync** — wire `ProfileProvider` to pull/push; the first-sign-in
   local-profile adoption.
4. **Privacy rework** — update `docs/app-store-launch.md`, the privacy
   manifest, and the App Store privacy labels.
5. **Sign in with Apple** — fast-follow, post Apple enrolment.

## 9. Open decision — launch timing

Accounts are a sizable chunk. Shipping them **before** the soft launch
(item 24) delays the launch; shipping **after** means migrating
already-launched local-only users (workable — first sign-in adopts the
local profile, §4). Recommendation: **soft-launch local-only as
planned, add accounts as the first post-launch feature** — it does not
gate the retention/conversion signal the soft launch is there to read,
and the sync model already handles the later migration cleanly.
