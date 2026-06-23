# Software Fundamentals Matter More Than Ever

Notes from a conference talk by **Matt Pocock** (course: _Claude Code for Real Engineers_).

## Thesis

AI coding does not replace software fundamentals — it amplifies them. A good codebase lets AI do excellent work; a bad codebase blocks the bounty AI offers. **Code is not cheap.** Bad code is more expensive than it has ever been, because hard-to-change systems cannot absorb AI-driven velocity.

Your role is strategic: design the system, own the interfaces, invest in structure every day. AI is tactical — a capable programmer on the ground making changes inside boundaries you define.

## Specs-to-Code and Why It Fails

The **specs-to-code** movement says: write a specification, let AI generate code, and when something breaks, fix the spec — not the code. Re-run the compiler until you have working software.

In practice, each iteration often produces **worse** code. This matches two classic ideas:

- **Software entropy** (_The Pragmatic Programmer_, Hunt & Thomas): every change made without regard for the whole system degrades the design.
- **Complexity** (_A Philosophy of Software Design_, John Ousterhout): complexity is anything in a system's structure that makes it hard to understand and modify. Good codebases are easy to change; bad ones cause bugs whenever you touch them.

The slogan "code is cheap" misses the point. Generated code that accumulates entropy is costly — it prevents you from benefiting from AI at all.

## Five Failure Modes and How to Avoid Them

### 1. The AI Didn't Do What I Wanted

**Problem:** You had a clear idea in your head; the AI built something else.

**Classical source:**

- _The Pragmatic Programmer_: no one knows exactly what they want — there is always a communication gap.
- _The Design of Design_ (Frederick P. Brooks): collaborators share a **design concept** — an ephemeral, shared understanding of what is being built. It is not an asset you can drop in a markdown file; it must be built through conversation.

**Tip:** Reach a shared design concept before generating a plan or writing code. Walk the **design tree** — resolve dependencies between decisions one branch at a time.

**Skill:** [`/grill-me`](https://github.com/mattpocock/skills) — interview relentlessly about every aspect of the plan until shared understanding is reached. For code work, [`/grill-with-docs`](https://github.com/mattpocock/skills) adds domain documentation. Pocock finds this more effective than default "plan mode" tools that are eager to produce a plan asset before alignment exists.

---

### 2. The AI Is Too Verbose

**Problem:** The AI uses too many words, talks past you, and implementation drifts from what you discussed.

**Classical source:** **Domain-Driven Design** (Eric Evans) — the **ubiquitous language**: conversations among developers, domain experts, and the code itself should all derive from the same domain model.

**Tip:** Maintain a shared vocabulary document. Scan the codebase for terminology, align definitions, and use those terms consistently in planning, code, and conversation with the AI.

**Skill:** Built into [`/grill-with-docs`](https://github.com/mattpocock/skills) and [`domain-modeling`](https://github.com/mattpocock/skills) — produces or updates a `CONTEXT.md` (or similar) with glossary tables. Keep it open during planning. Concise shared terms reduce verbosity in AI reasoning traces and improve implementation alignment.

---

### 3. The AI Built the Right Thing, but It Doesn't Work

**Problem:** Requirements are aligned, but the output is broken.

**Classical source:** Feedback loops — static types, browser access for front-end work, automated tests.

**Tip:** The rate of feedback is your speed limit. _The Pragmatic Programmer_ calls this **outrunning your headlights** — doing more than your feedback can validate. LLMs default to large batches of code before checking types, tests, or runtime behavior.

Take small, deliberate steps. Test as you go.

---

### 4. Feedback Loops Exist, but the AI Uses Them Poorly

**Problem:** Types, tests, and tooling are in place, but the agent still ships large, untested chunks.

**Classical source:**

- **Test-driven development** — red, green, refactor forces small steps: write a failing test, make it pass, then refactor with design in mind.
- **Deep vs shallow modules** (Ousterhout):
  - **Deep module** — lots of functionality hidden behind a simple interface.
  - **Shallow module** — little functionality behind a complex interface.

AI tends to produce shallow-module codebases: many tiny blobs with tangled dependencies. That layout is hard for both humans and agents to navigate. A deep-module structure groups related logic behind clean boundaries — test at the interface, verify through the interface.

```
Shallow:  [·][·][·][·][·][·][·][·]   many small pieces, complex wiring
Deep:     [───────][───────][───]   fewer modules, simple top-level APIs
```

**Skills:**

- [`/tdd`](https://github.com/mattpocock/skills) — enforces red-green-refactor in vertical slices.
- [`/improve-codebase-architecture`](https://github.com/mattpocock/skills) — explore the codebase, find deepening opportunities, wrap related code in deep modules.

Good codebases are easy to test. Better structure improves feedback, which improves AI output.

---

### 5. You're Shipping Faster, but Your Brain Can't Keep Up

**Problem:** AI accelerates output; cognitive load does not scale with it.

**Classical source:** Deep modules as **gray boxes** — design and review the interface; delegate implementation inside the boundary (for non-critical modules). Pair with tests at the module edge.

**Tip:**

- **Kent Beck** (_Extreme Programming Explained_): invest in the design of the system every day.
- When writing PRDs, be explicit about **which modules change** and **how their interfaces change**.
- Module boundaries should be part of your ubiquitous language and planning habits.

Specs-to-code **divests** from design. This approach **invests** in it continuously.

## Strategic vs Tactical

| Role | Responsibility |
| --- | --- |
| **You (strategic)** | Design concept, module map, interfaces, ubiquitous language, daily design investment |
| **AI (tactical)** | Implementation inside boundaries, small verified steps, refactoring under tests |

## References

### Books

| Author | Work | Relevant idea |
| --- | --- | --- |
| John Ousterhout | _A Philosophy of Software Design_ | Complexity; deep vs shallow modules |
| David Thomas & Andrew Hunt | _The Pragmatic Programmer_ | Software entropy; feedback as speed limit |
| Frederick P. Brooks | _The Design of Design_ | Design concept; design tree |
| Eric Evans | _Domain-Driven Design_ | Ubiquitous language |
| Kent Beck | _Extreme Programming Explained_ | Invest in system design daily |

### Skills and training

- **Skills repo:** [github.com/mattpocock/skills](https://github.com/mattpocock/skills) — install with `npx skills@latest add mattpocock/skills`
- **Newsletter / courses:** [aihero.dev](https://aihero.dev)

Key skills from the talk: `/grill-me`, `/grill-with-docs`, `/tdd`, `/improve-codebase-architecture`, `/to-prd`.

## Applying to This Repo

Advisory notes only — not new project rules.

- **Feedback loops** are already established: Vitest unit tests, Cypress E2E, `bun run lint`, `bun run vercel-build` ([`AGENTS.md`](../AGENTS.md)).
- **TypeScript** and **`ts-pattern`** support typed, explicit control flow — aligned with testable boundaries (e.g. [`app/server-actions/notes.ts`](../app/server-actions/notes.ts), [`app/lib/data.ts`](../app/lib/data.ts)).
- **Module seams** in this starter: `app/server-actions/` (mutations), `app/lib/` (data access), `app/notes/_components/` (UI). Prefer deep modules at these boundaries.
- **Domain terms** to keep consistent: note, server action, Clerk session/user, Prisma `User`/`Note`.
- Existing ops doc [`production-deploy-history.md`](./production-deploy-history.md) and future planning docs under [`docs/`](./) could benefit from ubiquitous-language terms and explicit module/interface changes when planning larger features.
