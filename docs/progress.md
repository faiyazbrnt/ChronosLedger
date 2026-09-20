# Project Progress

## Phase Status Summary

| Phase | Description | Status | Exit Criteria Met |
|---|---|---|---|
| **Phase 0** | Foundation & Harness | **DONE** | ✅ typecheck, lint, test, db:generate, and build pass |
| **Phase 1** | Design System & Shell | **DONE** | ✅ Both themes render, no theme flash, contrast verified, keyboard nav |
| **Phase 2** | Database & Prisma | **DONE** | ✅ prisma validate passes, migrations generated, RLS policies created, isolation documented |
| **Phase 3** | Supabase Auth & Session | NEXT | Register, verify email once, login, logout, route protection |
| **Phase 4** | Settings | PENDING | Lunch on/off & duration, currency settings persist |
| **Phase 5** | DTR (Daily Time Record) | PENDING | Pure calculators tested, entries CRUD, week/month views |
| **Phase 6** | Budget Tracker | PENDING | Allowance fallback, This Week & Monthly tabs, category chart |
| **Phase 7** | Dashboard & Polish | PENDING | Weekly hours & budget summary, responsive & a11y passes |

---

## Phase 0 Log
- **Done:**
  - Scaffolding initialized with Bun 1.4.2, Next.js 15.5.25, React 19, TypeScript strict mode with `noUncheckedIndexedAccess`.
  - Tailwind CSS v4 configured with `@theme` tokens in `src/app/globals.css`.
  - Feature-driven architecture skeleton created for `auth`, `dtr`, `budget`, `settings`, and `dashboard`.
  - Pure calculation functions implemented with unit tests in `bun test` (all 7 tests passing).
  - Mechanical boundaries enforced in `eslint.config.mjs` via `eslint-plugin-boundaries` and `no-restricted-imports`.
  - Full scripts configured: `dev`, `build`, `lint`, `typecheck`, `test`, `db:generate`, `db:migrate`.
  - GitHub Actions CI workflow created in `.github/workflows/ci.yml`.
  - `.env.example`, `docs/decisions.md`, `docs/progress.md`, and `AGENTS.md` established.

## Phase 1 Log
- **Done:**
  - Designed and configured full design token system in `src/app/globals.css` with exact `#FFEFCC`/`#660000` mapping and `color-mix()` derived surfaces.
  - Implemented strictly black-and-white dark mode palette (`#000000` surface, `#ffffff` accent/text, `#27272a` borders) with `next-themes` and zero theme flash.
  - Built core UI primitives (`Button`, `Card`, `Badge`, `Skeleton`) in `src/components/ui/` with CVA, variants, and accessible focus rings.
  - Built responsive AppShell with desktop sidebar (`w-64`, active route indicators, brand logo) and mobile bottom tab bar (touch targets ≥ 44px, sticky bottom).
  - Enhanced all feature views (`dashboard-view`, `dtr-view`, `budget-view`, `settings-form`, `auth-card`) to showcase high-aesthetic cards, states, and typography.
  - All gates verified green (`typecheck`, `lint`, `test`, `db:generate`, `build`).

## Phase 2 Log
- **Done:**
  - Verified `prisma/schema.prisma` with `bunx prisma validate` (exit code 0).
  - Generated initial DDL migration in `prisma/migrations/0_init/migration.sql` (`profiles`, `settings`, `dtr_entries`, `expenses`, `weekly_allowances`).
  - Created defense-in-depth Row-Level Security migration in `prisma/migrations/1_rls_policies/migration.sql` with owner policies (`auth.uid() = id` / `auth.uid() = "userId"`).
  - Verified Prisma client singleton pattern in `src/lib/prisma.ts`.
  - Documented complete per-user isolation architecture and SQL verification test in `docs/isolation.md`.
  - Ensured `.env` is safely gitignored while `.env.example` remains tracked.
- **Next:** Phase 3 (Supabase Auth & Session).
- **Blockers:** None.
