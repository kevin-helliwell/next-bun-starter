# Production deployment troubleshooting history

Chronicle of CI and runtime issues hit while standing up **Production Deployment** (`.github/workflows/deploy-production.yml`) with Neon, Vercel, and Clerk. Commits are on `main` from 2026-06-21 unless noted; entries through 2026-06-23 cover follow-up CI and preview Neon hygiene.

---

## Summary

| # | Symptom | Root cause | Fix (commit) |
| --- | --- | --- | --- |
| 1 | ESLint fails on `sign-in.cy.ts` | Unused `PASSWORD_INPUT` constant | [`6690522`](../commit/6690522) |
| 2 | Risk of committing local env files | `.env*` variants not all gitignored | [`fd58209`](../commit/fd58209) |
| 3 | CI: `DATABASE_URL is not set` after `vercel pull` | Neon marks `DATABASE_URL` **Sensitive**; `vercel pull` writes key with empty value | [`db3deb8`](../commit/db3deb8) |
| 4 | CI: migrations hit `localhost:5433` | Tracked `.env.development` merged over production vars | [`08f670f`](../commit/08f670f) |
| 5 | CI: build fails `DATABASE_URL is not set` | `vercel build` ignores GitHub step env; only reads `.vercel/` files | [`f001fdc`](../commit/f001fdc), [`118b067`](../commit/118b067) |
| 6 | Live: `Missing publishableKey` | `NEXT_PUBLIC_*` baked at **build** time on Actions; Clerk key not in build env | [`cf13acc`](../commit/cf13acc) |
| 7 | Live: **Failed to create note** | No local `User` row — Clerk webhook not configured for production (or migrations ran on wrong DB — see §9) | _Operational_ (see §8) |
| 8 | CI: migrations green; live app missing `User`/`Note` tables | `prisma migrate deploy` used GitHub `DATABASE_URL` while Vercel runtime used a different Production URL | [`d8e6c3a`](../commit/d8e6c3a) |
| 9 | CI: `vercel env run` has empty `DATABASE_URL` for migrations | Neon marketplace injects `DATABASE_URL` at Vercel runtime only; CI `vercel env run` often sees empty value | [`3a9d017`](../commit/3a9d017) |
| 10 | Orphaned Neon `preview/pr-*` branches accumulate | PR-close delete missed (failed workflow, force-close, idle period) | [`691bb4c`](../commit/691bb4c) |

---

## 1. ESLint: unused Cypress selector

**Workflow:** Tests / lint CI  
**Commit:** `6690522` — fix(cypress): remove unused PASSWORD_INPUT selector from sign-in E2E

**Symptom**

```
cypress/e2e/sign-in.cy.ts
  7:7  error  'PASSWORD_INPUT' is assigned a value but never used
```

**Cause**

`PASSWORD_INPUT` was left over from manual password-field tests. The suite uses `cy.clerkSignIn()` for the happy path and only types into the identifier field for the wrong-username case.

**Fix**

Remove the unused constant.

---

## 2. Gitignore: catch-all for env files

**Commit:** `fd58209` — chore(gitignore): ignore all .env\* files to block secret leaks

**Symptom**

Local env files created after `vercel pull` or manual copies could be staged accidentally.

**Cause**

`.gitignore` covered `.env`, `.env*.local`, and `.env.sentry-build-plugin` but not other suffixes (e.g. `.env.production`).

**Fix**

Add `.env*` wildcard. Already-tracked `.env.example` and `.env.development` remain in the repo.

---

## 3. Sensitive `DATABASE_URL` not available from `vercel pull`

**Workflow:** Production Deployment #15  
**Commits:** `57255d9` (preflight), `db3deb8` (env run)

**Symptom**

```
Error: DATABASE_URL is not set in Vercel Production env vars.
```

Neon was connected in Vercel with `DATABASE_URL` visible in the dashboard.

**Cause**

Neon/Vercel Marketplace integrations mark `DATABASE_URL` as **Sensitive**. Sensitive production variables:

- Work at **runtime** on Vercel
- Are **not** exported by `vercel pull` / `vercel env pull` (value is empty in `.vercel/.env.production.local`)

The workflow sourced that file and treated an empty value as “missing.”

**Fix**

- Use `vercel env run --environment=production` for migration checks and `prisma migrate deploy` (injects secrets at runtime without writing to disk).
- Add preflight that fails fast with a clear message instead of retrying migrations on an empty connection string (`57255d9`).

**Lesson**

GitHub Actions secrets and Vercel dashboard env vars are separate systems. Neon on Vercel ≠ automatically available to external CI via `vercel pull`.

---

## 4. Tracked `.env.development` overrode production database URL

**Workflow:** Production Deployment #16  
**Commit:** `08f670f` — fix(ci): stop tracked .env.development from overriding production DATABASE_URL

**Symptom**

```
Datasource "db": PostgreSQL at "localhost:5433"
Error: P1001: Can't reach database server at `localhost:5433`
```

CI logs also showed:

```
Loaded env from .../.env.development
```

**Cause**

Repo ships `.env.development` with `DATABASE_URL=postgresql://...@localhost:5433/myapp` for local Docker. After `vercel env run` downloaded production vars, Vercel CLI and Prisma (`dotenv` in `prisma.config.ts`) still merged `.env.development`, winning over Neon.

The verify step passed because `DATABASE_URL` was non-empty — just pointed at localhost.

**Fix**

- Remove `.env.development`, `.env`, and `.env.local` in CI before verify/migrate.
- Reject `localhost` / `127.0.0.1` in `DATABASE_URL` checks.
- `prisma.config.ts`: `dotenv` with `override: false` so shell-provided `DATABASE_URL` wins.
- Optional `DATABASE_URL` GitHub secret for migrations (Neon main branch).

---

## 5. `vercel build` does not read GitHub step environment

**Workflow:** Production Deployment #17  
**Commits:** `f001fdc`, `118b067`

**Symptom**

Migrations succeeded; build failed:

```
Error: DATABASE_URL environment variable is not set
Failed to collect page data for /notes/[id]/edit
◇ injected env (0) from .env
```

**Cause**

Two different env mechanisms in the same workflow:

| Step | Env source |
| --- | --- |
| `prisma migrate deploy` | GitHub Actions step `env:` → works |
| `vercel build` | `.vercel/.env.production.local` only → no `DATABASE_URL` |

Passing `DATABASE_URL` in the build step’s `env:` block does **not** propagate into `vercel build`’s subprocess.

**Fix**

- **Prepare production env for vercel build:** write GitHub `DATABASE_URL` into `.vercel/.env.production.local` (replace empty Sensitive placeholder).
- Document that migrations use step env; build uses the `.vercel` file.

---

## 6. Clerk `NEXT_PUBLIC_*` missing from prebuilt bundle

**Workflow:** Production Deployment (live runtime)  
**Commit:** `cf13acc` — fix(ci): bake Clerk publishable key into prebuilt production builds

**Symptom**

Deploy succeeded; site returned 500:

```
Error: @clerk/nextjs: Missing publishableKey
```

**Cause**

`vercel deploy --prebuilt` runs `vercel build` on **GitHub Actions**, not on Vercel. `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is inlined into the client bundle at **build time**.

Setting Clerk keys only on Vercel Production does not update an artifact already built without them. When `DATABASE_URL` was a GitHub secret, CI skipped `vercel env run` and ran plain `vercel build` with only `DATABASE_URL` patched into `.vercel/` — not Clerk.

**Fix**

- Merge `DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, and `CLERK_SECRET_KEY` from GitHub secrets into `.vercel/.env.production.local` when set.
- Verify publishable key exists before build (secret, pulled file, or `vercel env run`).
- **Always** run `vercel build` inside `vercel env run --environment=production`.
- Document optional GitHub secrets for prebuilt CI in README.

**Required GitHub Actions secrets (prebuilt deploy)**

| Secret | Purpose |
| --- | --- |
| `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `VERCEL_TOKEN` | Vercel CLI auth |
| `DATABASE_URL` | Neon main — migrations + build env file |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | **Required at build time** |
| `CLERK_SECRET_KEY` | Recommended for build env file |

**Required Vercel Production env vars (runtime)**

Same Clerk keys, `DATABASE_URL` (Neon), `WEBHOOK_SECRET`, `NEXT_PUBLIC_BASE_URL`.

---

## 7. Empty commit to retrigger deploy

**Commit:** `78ad07e` — chore: empty commit to retrigger production deployment

After updating Vercel Production environment variables, pushed an empty commit to rerun the workflow without a code change.

---

## 8. Runtime: “Failed to create note” (no commit)

**Symptom**

App loads and sign-in works; creating a note shows **Failed to create note**.

**Cause**

Notes require a row in Postgres `User` linked by `clerk_id`. Users are created via Clerk webhook `POST /api/webhooks/user-create` on `user.created`. If the webhook was never configured for production, or the user signed up before it existed, Clerk auth succeeds but `getLocalUserId()` returns empty → server action catches and shows generic failure.

If migrations ran against a **different** database than Vercel Production (see §9), tables may be missing on the live Neon branch even when CI reported success — same symptom.

**Fix (operational)**

1. Set `WEBHOOK_SECRET` on Vercel Production.
2. Clerk Dashboard → Webhook → `https://<production-url>/api/webhooks/user-create` with `user.created`, `user.updated`, `user.deleted`.
3. For existing accounts: sign up again after webhook is live, or backfill `User` in Neon.
4. Confirm production migrations target the same Neon main branch Vercel uses (§9–§10).

---

## 9. Migrations used GitHub secret, not Vercel Production database

**Workflow:** Production Deployment  
**Commit:** `d8e6c3a` — fix(ci): migrate production DB via Vercel env, not GitHub secret

**Symptom**

Deploy succeeded and migrations logged success, but the live app behaved as if schema were missing — e.g. errors creating notes, missing `User` / `Note` tables on the database Vercel actually connected to.

**Cause**

The workflow ran `prisma migrate deploy` with `secrets.DATABASE_URL` from GitHub Actions while the deployed app read `DATABASE_URL` from **Vercel Production** (Neon integration). If those values pointed at different databases (or the GitHub secret was stale/wrong), CI could migrate database A while production served database B.

**Fix**

Run migrations inside `vercel env run --environment=production` so CI uses the same Production `DATABASE_URL` as runtime. Reserve the GitHub `DATABASE_URL` secret primarily for patching `.vercel/.env.production.local` at **build** time (§5).

**Lesson**

Green migration logs are meaningless unless the connection string matches what the deployed app uses.

---

## 10. `vercel env run` returns empty `DATABASE_URL` for Neon marketplace

**Workflow:** Production Deployment  
**Commit:** `3a9d017` — fix(ci): fall back to GitHub DATABASE_URL when vercel env run is empty

**Symptom**

After §9, migrations failed or could not run because `vercel env run` injected an empty `DATABASE_URL` even though Neon showed a connection string on the Vercel dashboard.

**Cause**

Neon/Vercel marketplace integrations often inject `DATABASE_URL` at **Vercel runtime** on `*.vercel.app`, but that injection is not always visible to `vercel env run` in external CI — same Sensitive/empty pattern as §3.

**Fix**

Migration step now:

1. **Prefer** `vercel env run --environment=production` → `prisma migrate deploy` (same URL as runtime when available).
2. **Fall back** to GitHub `DATABASE_URL` secret with workflow warnings when Vercel injection is empty.
3. Reject localhost URLs in both paths.

Both sources **must** be the same Neon **main** branch URL. README documents that GitHub `DATABASE_URL` is required for build env patching and serves as migration fallback.

---

## 11. Orphaned Neon preview branches (weekly cleanup)

**Workflow:** Preview / Neon hygiene (not production deploy)  
**Commit:** `691bb4c` — ci(neon): add weekly workflow to prune orphaned preview branches

**Symptom**

Neon console shows many `preview/pr-<N>-<branch>` branches after closed or abandoned PRs; storage/compute cost creeps up.

**Cause**

`delete-neon-branch.yml` deletes on PR **close**, but branches can survive when that workflow fails, a PR is force-closed without the event firing cleanly, or cleanup never ran during idle periods.

**Fix**

Add `cleanup-neon-branches.yml`:

- **Schedule:** Mondays 03:00 UTC
- **Manual:** `workflow_dispatch` with `dry_run` to list candidates without deleting
- Lists open PR numbers via `gh pr list`
- Deletes `preview/pr-<N>-*` branches only when PR `#N` is not open
- Never touches primary, default, or protected branches

Requires existing `NEON_PROJECT_ID` (var), `NEON_API_KEY` (secret), and `pull-requests: read`.

---

## Mental model: three env layers

```
┌─────────────────────────────────────────────────────────────┐
│ GitHub Actions secrets                                      │
│ DATABASE_URL, NEXT_PUBLIC_CLERK_*, VERCEL_*                 │
│ → CI migrate (fallback) + vercel build (prebuilt)           │
│ → Migrations prefer vercel env run; GH secret if empty (§10)│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ .vercel/.env.production.local (from vercel pull + patches)   │
│ → vercel build reads this file, NOT step env                │
│ → Sensitive Vercel vars arrive empty from pull alone        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Vercel Production environment variables                     │
│ → Runtime on *.vercel.app (Neon, Clerk, WEBHOOK_SECRET)     │
│ → NEXT_PUBLIC_* must ALSO exist at GitHub build for prebuilt│
└─────────────────────────────────────────────────────────────┘
```

---

## Commit timeline

| Date | Commit | Summary |
| --- | --- | --- |
| 2026-06-21 | `6690522` | Remove unused Cypress `PASSWORD_INPUT` |
| 2026-06-21 | `fd58209` | Gitignore `.env*` |
| 2026-06-21 | `57255d9` | Preflight when `DATABASE_URL` missing after pull |
| 2026-06-21 | `db3deb8` | Migrations via `vercel env run` for Sensitive vars |
| 2026-06-21 | `08f670f` | Strip dev env files; localhost guard; optional GH `DATABASE_URL` |
| 2026-06-21 | `f001fdc` | Pass `DATABASE_URL` into build step (insufficient alone) |
| 2026-06-21 | `118b067` | Write GH `DATABASE_URL` into `.vercel/.env.production.local` |
| 2026-06-21 | `78ad07e` | Empty commit to retrigger deploy |
| 2026-06-21 | `cf13acc` | Clerk keys for prebuilt build; always `vercel env run` for build |
| 2026-06-21 | `d8e6c3a` | Migrations via Vercel Production env, not GitHub secret alone |
| 2026-06-21 | `3a9d017` | Migration fallback to GitHub `DATABASE_URL` when Vercel env empty |
| 2026-06-23 | `691bb4c` | Weekly `cleanup-neon-branches.yml` for orphaned preview branches |

---

## Related earlier work (context)

These commits predated the production deploy push but affected the same CI surface:

| Commit | Issue |
| --- | --- |
| `8a2ce88` | ESLint 10 / `eslint-plugin-cypress` flat export break |
| `65734ef` | Tailwind v4 / Vitest v4 / Vite 8 migration after dependabot |
| `eca803c` | Cypress Clerk v7 selectors; drop hard-coded app name |
| `b84ba6c` | E2E preflight names missing secrets explicitly |
