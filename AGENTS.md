# Agent Rules

Coding rules for this project. Canonical for humans and AI tools — no Cursor- or skill-specific setup required.

## Design — YAGNI

Apply **YAGNI** (You Aren't Gonna Need It): build only what the current task requires.

- No speculative APIs, abstractions, config, or "future-proofing" unless explicitly requested.
- Prefer the smallest correct change; extend when a real need appears.
- Skip optional parameters, hooks, and helpers that aren't used yet.
- Add tests when they cover real behavior or are requested — not for hypothetical cases.

## Checks before commits

Run `bun run format` before every commit. CI runs `bun run check:ci` (Prettier check) and will fail on unformatted files.

Before finishing a code change or opening/updating a PR, also run:

- `bun run lint` — same command as CI (`eslint . --cache`; includes Cypress rules such as `cypress/unsafe-to-chain-command`)
- `bun run test:unit --run` — same command as CI
- `bun run vercel-build` — same script as preview/production deploys (`prisma generate` + `next build`)

Skip the heavier checks for doc-only or WIP commits; CI still runs tests on every PR.

## Stack

Bun · Next.js App Router · Vitest · Prisma · ts-pattern · Fallow

Install dependencies with `bun add` / `bun add -d` — do not hand-pick versions in `package.json`. Use `bunx` for one-off CLI tools (e.g. `bunx prisma`).

## Control flow — use `ts-pattern`

Never use `switch`, nested `if-else`, or nested ternaries for control flow in application code. Use `ts-pattern` (`match`, `P`, `.exhaustive()` / `.otherwise()`).

```ts
import { match } from 'ts-pattern';

const getIcon = (eventType: EventType) =>
  match(eventType)
    .with('Sale', () => faTag)
    .with('Open House', () => faHouse)
    .otherwise(() => faUsers);
```

Use discriminated unions for variant data; handle them with `match`. Prefer impossible-state prevention over bag-of-optionals (`status` + optional `data?`/`error?`).

## Testing

Use **Vitest** for all unit tests (components, API routes, utilities, server actions, pages). `@testing-library/jest-dom` works with Vitest.

Use **`bun run test:e2e:run`** for headless Cypress (same as CI: `bunx cypress run`). Use **`bun run test:e2e`** for the interactive runner.

## TypeScript

- **Exports:** named exports by default; `export default` only where the framework requires it (e.g. Next.js pages).
- **Types:** `import type` at top level (not inline `import { type X }`). Prefer `interface extends` over `type` intersections (`&`).
- **Enums:** do not add new enums; use `as const` objects. Retain existing enums.
- **Objects:** `readonly` properties by default; use `prop: T | undefined` instead of optional `prop?` when the prop must be consciously passed or omitted.
- **Functions:** explicit return types on top-level functions; omit on React components (always JSX).
- **`any`:** only inside generic functions when TypeScript cannot express the return type; otherwise avoid.
- **Errors:** prefer `Result<T, E>` over throw when the caller must handle failures; throwing is fine in framework boundaries (e.g. route handlers) when that is the desired outcome.
- **Indexing:** remember `noUncheckedIndexedAccess` — index access may be `T | undefined`.

### Naming

- Files: kebab-case (`my-component.ts`)
- Variables, hooks, functions: camelCase (`useOrgForm`, `myFunction`)
- Components, classes, types, interfaces: PascalCase
- Constants: `ALL_CAPS`
- Generic type params: `T` prefix (`TKey`, `TValue`)

## Next.js App Router

- Default to **Server Components**; add `'use client'` only for interactivity, hooks, browser APIs, or client-only libraries.
- **Server Actions** (`app/server-actions/`) for form submissions and mutations.
- **Route Handlers** (`app/api/`) for REST endpoints, webhooks, and explicit HTTP methods.
- Use `next/image` instead of `<img>`; use the Metadata API instead of `next/head`.

## Fallow

Static analysis for dead code, duplication, and complexity. Config: `.fallowrc.json`. CI runs `bunx fallow audit` with **`gate: new-only`** (`.github/workflows/fallow.yml`) — PRs fail only on **new** issues in changed files.

```bash
bunx fallow audit      # PR gate (matches CI)
bunx fallow dead-code  # unused exports, circular deps, unused deps
bunx fallow dupes      # duplicate blocks
bunx fallow health     # complexity hotspots (advisory)
```

Prefer fixing findings over suppressions. Narrowest suppression mechanism:

| Reason | Mechanism |
| --- | --- |
| Framework entry point | `entry`, plugin config, or `@public` JSDoc |
| Generated / script-only code | `ignorePatterns` in `.fallowrc.json` |
| Intentionally retained dependency | `ignoreDependencies` |
| Intentional unused export | `@expected-unused` |
| One-off false positive | `// fallow-ignore-next-line <rule>` |

Policy: dead code / circular deps / unused deps = error severity. Health thresholds: `maxCyclomatic: 45`, `maxCognitive: 280`, `maxCrap: 2000`. Duplication: `minOccurrences: 3`. Tests, Cypress, Prisma seeds, Uppy upload code, and legacy scripts are in `ignorePatterns`.

List every imported package in `package.json`; remove unused imports rather than adding deps only for Fallow.

Docs: <https://docs.fallow.tools/integrations/ci>
