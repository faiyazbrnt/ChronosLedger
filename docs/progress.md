# Project Progress

## Phase Status Summary

| Phase | Description | Status | Exit Criteria Met |
|---|---|---|---|
| **Phase 0** | Foundation & Harness | **DONE** | ✅ typecheck, lint, test, db:generate, and build pass |
| **Phase 1** | Design System & Shell | **DONE** | ✅ Both themes render, no theme flash, contrast verified, keyboard nav |
| **Phase 2** | Database & Prisma | **DONE** | ✅ prisma validate passes, migrations generated, RLS policies created, isolation documented |
| **Phase 3** | Supabase Auth & Session | **DONE** | ✅ Register, verify email once, idempotent profile+settings upsert, login, unverified block, logout, route protection |
| **Phase 4** | Settings | **DONE** | ✅ Lunch on/off & duration, currency settings persist, live preview, audited immutability guarantee |
| **Phase 5** | DTR (Daily Time Record) | **DONE** | ✅ Pure calculators tested, entries CRUD, lunch snapshot immutability, week/month views |
| **Phase 6** | Budget Tracker | **DONE** | ✅ Allowance fallback, minor unit precision, daily grouped spending, multi-state health alerts, Recharts category breakdown |
| **Phase 7** | Dashboard & Polish | NEXT | Weekly hours & budget summary, responsive & a11y passes |

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

## Phase 3 Log
- **Done:**
  - Implemented client validation schemas with Zod (`loginSchema`, `registerSchema`, `resendVerificationSchema`) and pure validation unit tests (15 passing tests across repo).
  - Built typed server actions in `src/features/auth/actions/auth-actions.ts` (`registerAction`, `loginAction`, `resendVerificationAction`, `signOutAction`) returning `{ ok: true, data } | { ok: false, error, fieldErrors, unverified }`.
  - Implemented unverified account protection: blocks unconfirmed accounts from logging in, terminates any unconfirmed Supabase session, and surfaces a dedicated resend CTA.
  - Implemented `/auth/confirm/route.ts` with dual support for `token_hash` OTP and PKCE `code` exchange.
  - Built idempotent `upsertProfileAndSettings` database transaction in `src/features/auth/services/auth-service.ts` that creates/updates `Profile` and initializes default `Settings` (`lunchDeductionEnabled: true`, `lunchBreakMinutes: 60`, `currency: 'PHP'`) in a single atomic transaction.
  - Created high-aesthetic interactive client components:
    - `LoginForm`: inline field errors, password toggle, unverified banner with inline resend action.
    - `RegisterForm`: password matching validation, minimum 8 characters validation, password toggles, loading state.
    - `VerifyEmailContent`: custom pending screen with mail badge, 60s cooldown timer for resend button.
    - `LogoutButton`: accessible sign-out button with pending transition spinner.
  - Configured route protection in `src/lib/supabase/middleware.ts`: protects app routes (`/dashboard`, `/dtr`, `/budget`, `/settings`), redirects authenticated users away from auth pages, and preserves cookies across redirects.
  - Decoupled `userSlot` in `AppShell` allowing `LogoutButton` to be injected from `layout.tsx` without violating mechanical feature boundary rules.
  - All quality gates green: `typecheck`, `lint`, `test`, `build`.
- **Next:** Phase 4 (Settings).
- **Blockers:** None.

## Phase 4 Log
- **Done:**
  - Implemented `updateSettingsAction` in `src/features/settings/actions/settings-actions.ts` with `supabase.auth.getUser()` verification, input validation against `settingsSchema`, and cache revalidation across `/settings`, `/dashboard`, `/budget`, `/dtr`.
  - Built typed service layer in `src/features/settings/services/settings-service.ts` with scoped Prisma queries (`getUserSettings`, `updateUserSettings`).
  - Implemented interactive `SettingsForm` client component:
    - Accessible lunch deduction toggle switch (`role="switch"`, `aria-checked`).
    - Quick-select lunch duration chips (`15m`, `30m`, `45m`, `60m`, `90m`) and custom input with range validation (0–240 mins).
    - Currency selector with presets (`PHP`, `USD`, `EUR`, `GBP`, `JPY`, `SGD`, `AUD`, `CAD`) and custom 3-letter uppercase input.
    - Live interactive currency preview formatted via `formatMinorUnits` and `Intl.NumberFormat`.
    - Audited Snapshot Guarantee callout explaining that past DTR entries retain their snapshot lunch deductions.
    - Accessible loading indicators and status banners (`aria-live="polite"`).
  - Wired SSR data loading in `src/app/(app)/settings/page.tsx`, preloading current user settings with zero layout shift.
  - Added pure unit tests in `src/features/settings/lib/settings-validation.test.ts` (all 22 unit tests green across repo).
  - All quality gates green: `typecheck`, `lint`, `test`, `build`.
- **Next:** Phase 5 (DTR - Daily Time Record).
- **Blockers:** None.

## Phase 5 Log
- **Done:**
  - Expanded `src/lib/date.ts` with timezone-safe Monday-to-Sunday week calculations (`getMondayOfWeek`, `getSundayOfWeek`, `getWeekDates`, `addWeeks`, `formatMinutesTo24H`, `formatDateDisplay`, `formatMonthDisplay`).
  - Implemented `saveDtrEntryWithSnapshot` in `src/features/dtr/services/dtr-service.ts`: snapshots user's current lunch preferences on new entry creation and preserves original lunch snapshot on updates.
  - Implemented typed server actions `saveDtrEntryAction` and `deleteDtrEntryAction` with Zod validation, user authentication, and revalidation of `/dtr` and `/dashboard`.
  - Built interactive `DtrModal` client component with native `<input type="time">`, live worked hours calculation preview (`8:30 AM to 6:30 PM minus 60m lunch = 9h 00m`), and validation.
  - Built comprehensive `DtrView` with week-by-week pagination (`Previous Week`, `Current Week`, `Next Week`), summary statistics (weekly hours, days logged, daily average, lunch rule), interactive daily breakdown (Monday to Sunday) with inline edit/delete, empty shift quick-logging, and a monthly summary view.
  - Wired SSR data preloading in `src/app/(app)/dtr/page.tsx` for fast rendering with zero layout shift.
  - Added pure schema validation tests in `src/features/dtr/lib/dtr-validation.test.ts` and extended pure calculation tests in `src/features/dtr/lib/calc-hours.test.ts` (all 34 tests passing across the workspace).
  - All quality gates green: `typecheck`, `lint`, `test`, `build`.
- **Next:** Phase 6 (Budget Tracker).
- **Blockers:** None.

## Phase 6 Log
- **Done:**
  - Implemented `getWeeklyAllowance` in `src/features/budget/services/budget-service.ts` with automatic historical fallback to earlier weeks, eliminating repetitive manual allowance configuration.
  - Implemented `upsertWeeklyAllowance`, `createExpense`, `updateExpense`, and `deleteExpense` in `budget-service.ts` ensuring strictly integer minor units (`cents/centavos`) across all monetary storage and math.
  - Implemented server actions in `src/features/budget/actions/budget-actions.ts` (`createExpenseAction`, `updateExpenseAction`, `deleteExpenseAction`, `setAllowanceAction`) with user authentication, Zod validation, and cache revalidation across `/budget` and `/dashboard`.
  - Built interactive `ExpenseModal` component supporting amount formatting, category selection across the 7 core categories, date selection, and optional notes.
  - Built interactive `AllowanceModal` component explaining historical inheritance and real-time formatting.
  - Built `CategoryChart` component powered by Recharts (`ResponsiveContainer`, `BarChart`) with category color palettes and percentage distribution progress meters.
  - Built comprehensive `BudgetView` component:
    - Weekly allowance, total spent, and remaining KPI cards with dynamic safe-to-spend per day calculations.
    - Accessible multi-state budget health progress meters (`On Track`, `Near Limit`, `Over Budget`) communicating status via text, icons, and progress meters.
    - Daily grouped expense breakdown featuring day headers, per-day subtotals, category tags, amounts, and edit/delete actions.
    - Monthly summary tab featuring total monthly spending, daily average, top expense category, and category distribution charts.
  - Wired SSR data preloading in `src/app/(app)/budget/page.tsx`, loading the user's currency preference, weekly allowance, and range-scoped expenses.
  - Added unit tests in `src/features/budget/lib/budget-validation.test.ts` and expanded `src/features/budget/lib/calc-budget.test.ts` (all 49 tests passing across the workspace).
  - All quality gates green: `typecheck`, `lint`, `test`, `build`.
- **Next:** Phase 7 (Dashboard & Polish).
- **Blockers:** None.
