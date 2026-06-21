# My App

A Bun + Next.js App Router starter with TypeScript, Tailwind CSS, DaisyUI, Prisma, PostgreSQL, Clerk auth, Vitest, Cypress, Fallow, and Vercel/Neon CI workflows.

Derived from the [support-local](https://github.com/TechJoySoftware/support-local) production stack, stripped to a generic Notes CRUD example.

## Use this template

1. Click **Use this template** on GitHub to create a new repository.
2. Clone your new repo and run `./scripts/init-project.sh` to rename placeholders.
3. Follow the setup steps below.

## Quick start

**Prerequisites:** [Docker](https://docs.docker.com/get-docker/), [Bun](https://bun.sh/)

```bash
git clone git@github.com:YOUR_ORG/my-app.git
cd my-app
./scripts/init-project.sh   # optional: rename My App / my-app / myapp
bun install
cp env.local.example .env.local   # fill in Clerk keys
cp .env.development .env          # or: bun run env_setup
bun run pg:start                  # separate terminal
bun run db:migrate:dev
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Required services

### Clerk

1. Create an application at [clerk.com](https://dashboard.clerk.com).
2. Set **Application name** in Clerk to match your project display name if you customize branding (optional for Cypress — tests use Clerk component selectors, not the app name).
3. Add to `.env.local`:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
4. Create a webhook pointing to `/api/webhooks/user-create` for `user.created`, `user.updated`, `user.deleted`.
5. Copy the signing secret to `WEBHOOK_SECRET`.

The webhook keeps user email updates and deletions in sync. If it is missing, the app still creates a local `User` on first authenticated request (notes, etc.) via the Clerk API.

### PostgreSQL (local)

Docker Compose runs Postgres on port **5433** (see `compose.local.yml`).

```bash
bun run pg:start    # start
bun run pg:stop     # stop
bun run db:migrate:dev
bun run db:seed     # optional demo data
```

## Project layout

| Path                  | Purpose                                    |
| --------------------- | ------------------------------------------ |
| `app/`                | Next.js App Router pages and components    |
| `app/server-actions/` | Server Actions (mutations)                 |
| `app/notes/`          | Example Notes CRUD                         |
| `app/api/webhooks/`   | Clerk webhook handlers                     |
| `prisma/`             | Schema, migrations, seed                   |
| `public/`             | Static assets (empty by default)           |
| `cypress/`            | E2E tests                                  |
| `AGENTS.md`           | Coding conventions for humans and AI tools |

## Scripts

| Script | Description |
| --- | --- |
| `bun run dev` | Start dev server |
| `bun run build` | Production build |
| `bun run test:unit --run` | Vitest unit tests |
| `bun run test:e2e:run` | Headless Cypress |
| `bun run lint` | ESLint |
| `bun run format` | Prettier |
| `bun run vercel-build` | CI/production build (`prisma generate && next build`) |

## Optional: CI deploy & previews

### GitHub Actions secrets (E2E)

Add these under **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Purpose |
| --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_TEST` | Clerk **test** publishable key (`pk_test_…`) |
| `CLERK_SECRET_KEY_TEST` | Clerk **test** secret key (`sk_test_…`) |
| `CYPRESS_CLERK_TEST_PASSWORD` | Password for a Clerk test user |
| `CLERK_TEST_EMAIL_TEST` | Optional — test user email (e.g. `you+clerk_test@example.com`) for full password sign-in in CI |

Use keys from a Clerk **development** instance (same app as local `.env.local`). E2E fails if any secret is missing — the app returns HTTP 500 without Clerk keys.

Set `CLERK_TEST_EMAIL` in `cypress.env.json` locally (see `cypress.env.json.example`). Clerk accepts test addresses with a `+clerk_test` suffix (e.g. `your_email+clerk_test@example.com`). Add `CLERK_TEST_EMAIL_TEST` as a repository secret to run the full password sign-in test in CI; otherwise that test is skipped.

### Vercel production

GitHub Actions secrets: `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `VERCEL_TOKEN`

Optional GitHub Actions secrets for **prebuilt** production CI (same values as Vercel Production; used when Sensitive vars are not in `.vercel/.env.production.local` after `vercel pull`):

| Secret | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon **main** branch — migrations + `.vercel/.env.production.local` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key — **required at build time** for `vercel deploy --prebuilt` |
| `CLERK_SECRET_KEY` | Clerk secret — written into build env file when set |

Vercel Production env vars still apply at **runtime** on `*.vercel.app`; `NEXT_PUBLIC_*` must also be present when `vercel build` runs on GitHub Actions.

Workflow: `.github/workflows/deploy-production.yml`

Set these in **Vercel → Project → Settings → Environment Variables → Production** (the workflow runs `vercel pull` for build settings; migrations use `vercel env run` because Neon/Marketplace `DATABASE_URL` is **Sensitive** and is not written to `.vercel/.env.production.local`):

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Production Postgres connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key (`pk_test_…` for dev instance on `*.vercel.app`) |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_BASE_URL` | Production URL (e.g. `https://your-app.vercel.app`) |
| `WEBHOOK_SECRET` | Clerk webhook signing secret |

After adding `DATABASE_URL`, run migrations once if the deploy workflow has never succeeded:

```bash
vercel link
vercel env run --environment=production -- bunx prisma migrate deploy
```

`vercel env pull` cannot export Sensitive production secrets (including Neon-injected `DATABASE_URL`); use `vercel env run` instead.

### Neon preview databases (PRs)

Secrets: `NEON_PROJECT_ID`, `NEON_API_KEY`

Workflows: `deploy-preview.yml`, `delete-neon-branch.yml`

### Sentry

Set `SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT` in Vercel/hosting env.

## Publishing as a template

After pushing to GitHub: **Settings → General → Template repository** → enable.

## Conventions

See [AGENTS.md](./AGENTS.md) for stack rules (ts-pattern, YAGNI, Fallow, testing).

## Maintaining from support-local

This template is a one-time extraction. To port stack improvements from support-local, cherry-pick toolchain/CI changes manually — not the domain-specific app code.
