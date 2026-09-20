<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — DTR & Budget Tracker Guidelines

## 0. Project Snapshot
- **Stack:** Bun 1.4+, Next.js 15 (App Router, React 19), TypeScript strict (`noUncheckedIndexedAccess`), Tailwind CSS v4, shadcn/ui, Prisma 6.19+, Supabase Auth (`@supabase/ssr`).
- **Commands:**
  - `bun run dev` (run local dev server)
  - `bun run build` (Next.js production build)
  - `bun run lint` (ESLint with mechanical boundaries)
  - `bun run typecheck` (`tsc --noEmit`)
  - `bun test` (pure logic unit tests)
  - `bun run db:generate` (`prisma generate`)
  - `bun run db:migrate` (`prisma migrate dev`)
- **Folder Structure:**
  ```
  src/
    app/          # ROUTING ONLY: thin pages composing feature exports
    features/     # auth/, dtr/, budget/, settings/, dashboard/
      [feature]/  # components/, actions/, schemas/, services/, lib/, types/, index.ts
    components/   # ui/ (shadcn primitives), layout/ (app shell, nav, theme toggle)
    lib/          # prisma.ts, date.ts, money.ts, utils.ts, supabase/{client,server,middleware}.ts
    middleware.ts # Supabase session refresher
  prisma/         # schema.prisma, migrations/
  docs/           # progress.md, decisions.md
  ```

## 1. Prompt Engineering
- **Task-Brief Template:**
  1. `Goal:` What user problem is being solved.
  2. `Context:` What phase, what feature, what models are touched.
  3. `Constraints:` Boundaries, DB safety, non-negotiable rules.
  4. `Acceptance Criteria:` Deterministic testable statements.
  5. `Output Format:` Clean code diffs or Phase Report.
- **Two Hats:**
  - Senior Full-Stack (`[FS]`): Data model, Prisma, Supabase Auth, server actions, services, tests, folder architecture.
  - Senior Frontend (`[FE]`): UI/UX, components, Tailwind v4 theming, shadcn/ui, responsiveness, a11y, dark mode.
- **Verify Docs, Don't Guess:** Never hallucinate API signatures for Next 15, Tailwind v4, or Prisma.
- **Ask Rule:** Ask questions only when truly blocked, in one batched message, each with a proposed default.

## 2. Content Engineering
- **Context Loading:** Load only the feature folder being touched, its schema, and its public `index.ts`. Never load `node_modules`, lockfiles, or repo-wide dumps.
- **File Referencing:** Point to files by path instead of pasting entire files.
- **Glossary:**
  - `DTR entry`: Daily record containing `workDate`, `timeInMinutes`, `timeOutMinutes`, `lunchMinutesApplied`.
  - `workedMinutes`: Pure derived value: `(timeOut − timeIn) − lunchMinutesApplied`. Never stored in DB.
  - `lunch snapshot`: Snapshot of `lunchBreakMinutes` saved on each entry at creation; immutable to future Settings changes.
  - `allowance week`: Weekly budget allocation starting on Monday (`weekStart`).
- **Decisions Log:** Record all non-trivial technical trade-offs in `docs/decisions.md`.

## 3. Harness Engineering
- **Quality Gates:**
  1. `bun run typecheck` (`tsc --noEmit` zero errors)
  2. `bun run lint` (ESLint boundaries & style green)
  3. `bun test` (all unit tests pass)
  4. `bun run db:generate` (Prisma client generated)
  5. `bun run build` (production build succeeds)
- **Definition of Done:** All gates green, boundary rules respected, and phase exit criteria fulfilled.
- **Guardrails:**
  - NEVER execute destructive DB commands (`prisma migrate reset`, `prisma db push --force-reset`) without explicit approval.
  - NEVER commit `.env` or secrets.
  - NEVER disable ESLint or TypeScript strict rules to get green.

## 4. Loop Engineering
- **Cycle:** `Plan (≤5 bullets) → Smallest Slice → Run Gates → Read Failures → Refine`.
- **Refinement Limit:** Maximum 3 refine passes per slice; if still blocked, report root cause immediately.
- **Commits:** Conventional commits (`feat:`, `fix:`, `chore:`, `refactor:`).
- **Progress Tracking:** Update `docs/progress.md` (done / next / blockers) at the conclusion of every phase.

## 5. Token & Caching Discipline
- Keep `AGENTS.md` and static guidelines stable to maintain an optimal caching prefix.
- Do not edit static instructions mid-phase. Keep volatile roadmap tasks distinct.
