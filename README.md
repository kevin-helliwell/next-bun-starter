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
cp env.local.example .env.local   # add Clerk keys
cp .env.development .env
bun run pg:start                  # separate terminal
bun run db:migrate:dev
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Required services

### Clerk

1. Create an application at [clerk.com](https://dashboard.clerk.com).
2. Set **Application name** to match your project (used in sign-in UI and Cypress `CLERK_APP_NAME`).
3. Add to `.env.local`:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
4. Create a webhook pointing to `/api/webhooks/user-create` for `user.created`, `user.updated`, `user.deleted`.
5. Copy the signing secret to `WEBHOOK_SECRET`.

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

| Secret | Purpose |
| --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_TEST` | Clerk test publishable key |
| `CLERK_SECRET_KEY_TEST` | Clerk test secret key |
| `CYPRESS_CLERK_TEST_PASSWORD` | Test user password |

Set `CLERK_TEST_EMAIL` and `CLERK_HOST` in `cypress.env.json` locally (see `cypress.env.json.example`).

### Vercel production

Secrets: `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `VERCEL_TOKEN`

Workflow: `.github/workflows/deploy-production.yml`

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
