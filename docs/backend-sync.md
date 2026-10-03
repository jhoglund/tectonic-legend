# Backend sync: current state and pickup guide

> Read this first when resuming Tectonic and you need to remember how the backend
> works. It records the **live/operational** state after the Supabase -> Cloudflare
> Worker migration shipped (2026-07-04). The **decision** behind it is
> [ADR-0020](decisions/ADR-0020-sync-off-supabase-cloudflare-worker.md); the Worker's
> own build/deploy detail is [`sync-worker/README.md`](../sync-worker/README.md).
> This doc ties those together and does not duplicate them.

**Last updated:** 2026-10-03

## TL;DR

- Tectonic is local-first and single-user. Profile sync mirrors one profile blob so
  it follows the one user across web and iOS.
- The sync backend is a **Cloudflare Worker + KV**. **Supabase is fully gone** (Auth,
  the `profiles` table, and the project itself, deleted 2026-07-04). The migration is
  **one-way**, there is nothing to fall back to.
- Auth is **stubbed to one fixed local user**. There is no sign-in.
- When `VITE_SYNC_URL` / `VITE_SYNC_SECRET` are unset the app runs **local-only,
  gracefully** (`isSyncEnabled()` is false). Nothing breaks without the backend.

## What is running

| Piece | Value |
|-------|-------|
| Worker name | `tectonic-sync` |
| Worker URL | `https://tectonic-sync.jhoglund.workers.dev` |
| Worker source | [`sync-worker/`](../sync-worker/) (routes `GET` / `PUT /profile`, bearer auth, CORS) |
| Cloudflare account | `jonas@stixy.com` (id `65eb79bd36257fe1453480202d7f05d2`) |
| KV binding | `PROFILES` |
| KV namespace id | `357880cb70674e30b741fedfa3afb9c0` (committed in [`sync-worker/wrangler.toml`](../sync-worker/wrangler.toml)) |
| KV keys | one key, `profile` (single user) |
| Worker secret | `SYNC_SECRET` (set via `wrangler secret put`, never committed) |

### Client wiring

- The client reads `VITE_SYNC_URL` (the Worker origin, no trailing slash) and
  `VITE_SYNC_SECRET` (must match the Worker's `SYNC_SECRET`). It calls
  `${VITE_SYNC_URL}/profile`.
- **Local:** both live in `.env.local` (gitignored; a backup sits at `.env.local.bak`).
- **Prod (GitHub Pages):** `vars.VITE_SYNC_URL` + `secrets.VITE_SYNC_SECRET` in GitHub
  Actions, consumed by [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml).
  The old `VITE_SUPABASE_*` CI entries were deleted.

### Auth (stubbed)

`AuthProvider.tsx` reports one constant, always-signed-in user (`id: 'local'`). Supabase
Auth, OAuth, magic-link, and the `AuthSheet` UI were all removed. The `useAuth` /
`authContext` shape is unchanged, so `ProfileProvider` and the Settings / DevTools
consumers still compile untouched.

Consequence: the developer-email elevation path (ADR-0014) is now inert (the local user
has no email). The **7-tap Version unlock** is the live way to elevate.

## Shipped

- **iOS build 7** uploaded to TestFlight, verified working and syncing on Jonas's phone.
- **Web** deploys to GitHub Pages on push to `main`.

## Runbook (resuming dev)

Run Worker / KV commands from `sync-worker/`.

**Local dev**

```bash
npm run dev
```

Sync is active because `.env.local` carries `VITE_SYNC_URL` / `VITE_SYNC_SECRET`. Remove
or blank them and the app runs local-only (graceful).

**Change / redeploy the Worker**

```bash
cd sync-worker && npx wrangler deploy
```

**Inspect / edit the stored profile**

```bash
npx wrangler kv key get --namespace-id 357880cb70674e30b741fedfa3afb9c0 profile --remote
# kv key put / kv key delete take the same --namespace-id + key form
```

**Rotate the bearer secret**

```bash
npx wrangler secret put SYNC_SECRET
```

Then update `VITE_SYNC_SECRET` in **both** `.env.local` **and** the GitHub Actions secret
so client and Worker match. A mismatch shows up as `401` from the Worker.

**Ship a new iOS build**

**TestFlight builds expire 90 days after upload.** Build 7 went up 2026-07-04 and expired
2026-10-02, which is what triggers a renewal.

1. Bump `CURRENT_PROJECT_VERSION` (two spots in
   [`ios/App/App.xcodeproj/project.pbxproj`](../ios/App/App.xcodeproj/project.pbxproj)).
2. `npm run sync:ios`.
3. Archive the **`.xcodeproj`** (not a workspace, the project is SPM-based):

   ```bash
   xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Release \
     -destination 'generic/platform=iOS' -archivePath /tmp/Tectonic.xcarchive archive
   ```

4. Export the IPA with [`ios/ExportOptions.plist`](../ios/ExportOptions.plist)
   (`-exportArchive ... -allowProvisioningUpdates`), then re-export with a copy of that
   plist whose `destination` is `upload`.
5. Verify before archiving, since both are silent failures: the built bundle should
   contain the sync Worker host, and must **not** contain `mimir.test` (the local
   analytics host never belongs in a device build).

**Gotchas, both hit on 2026-10-03:**

- **`Signing for "App" requires a development team`.** The project had `CODE_SIGN_STYLE =
  Automatic` but no `DEVELOPMENT_TEAM`, so archiving worked from the Xcode GUI (which
  supplies the team interactively) and failed from the CLI. Fixed by setting
  `DEVELOPMENT_TEAM = S4UF72BD94` in both build configurations, so the CLI path above now
  works unattended.
- **`Failed to Use Accounts: App Store Connect access for "S4UF72BD94" is required`.** The
  cached Xcode account expires, so **do not use `destination=upload` as the primary path**.
  Upload with the API key instead, which needs no interactive sign-in:

  ```bash
  xcrun altool --upload-app -f <ipa> -t ios \
    --apiKey T74H52U428 --apiIssuer 88e1de5f-a151-4e8b-a2e5-cc711d842ed4
  ```

  Key id, issuer id and team id are recorded in
  `/Users/jonashoglund/work/hybris-fed/hybris/CREDENTIALS.md`, the federation's credential
  store. The issuer id is an account identifier, not a secret; the `.p8` is the secret half
  and lives at `~/.appstoreconnect/private_keys/`.
- **Build processes fine but never appears in TestFlight.** Check
  `buildBetaDetail.internalBuildState`: `MISSING_EXPORT_COMPLIANCE` means Apple is waiting
  on the encryption question. `ITSAppUsesNonExemptEncryption = false` is now in
  `Info.plist`, so new builds answer it automatically. The app qualifies for the exemption
  because it uses only OS-provided HTTPS (`crypto.randomUUID()` generates ids, it does not
  encrypt). To clear an already-uploaded build, PATCH `usesNonExemptEncryption: false` onto
  `/v1/builds/{id}`. Internal groups receive builds automatically once this clears, so do
  not try to assign a build to one: the API rejects it with
  `Cannot add internal group to a build`.

- **`Missing required icon file ... 120x120 / 152x152 / 167x167`.** The app icon is a
  source asset and is now committed. If it ever goes missing again the build still
  *succeeds*, silently, producing an iconless app that only fails at upload. Note also
  that a lone universal 1024x1024 entry is **not** enough: `actool` ignores sized entries
  beside it and never emits 167x167, which iPad requires. The catalogue therefore carries
  every size explicitly. Check the compiled catalogue, not the loose files in the bundle,
  since most sizes live inside `Assets.car`:

  ```bash
  xcrun assetutil --info <App.app>/Assets.car | grep -c 167
  ```

- **`FORBIDDEN.REQUIRED_AGREEMENTS_MISSING_OR_EXPIRED`** (altool reports it as
  `CONTRACT_NOT_VALID`, or unhelpfully as `Unable to find Apple ID for Bundle ID ...` and
  `No applications found`, because an unsigned agreement hides every app from the API). An
  Apple agreement needs accepting at https://appstoreconnect.apple.com/business (the
  **Free Apps Agreement**; Paid Apps is not needed for TestFlight on a free app). Only
  Jonas can accept it. Hit on 2026-10-03. Expect a lag: the REST API cleared about three
  minutes before the upload pipeline did, so retry rather than assuming a second
  agreement is outstanding.

## If Tectonic ever goes multi-user

The stubbed single-user identity and the single-bearer-secret model must be revisited:
real auth and per-user isolation have to come back, and ADR-0020 would then be superseded
in turn. See [ADR-0020](decisions/ADR-0020-sync-off-supabase-cloudflare-worker.md) for the
trade that was accepted here (a bundle-inspectable bearer secret, acceptable only while
single-user).

## See also

- [ADR-0020](decisions/ADR-0020-sync-off-supabase-cloudflare-worker.md) - the decision and
  its consequences.
- [`sync-worker/README.md`](../sync-worker/README.md) - the Worker's routes, deploy steps,
  and client wiring in full.
