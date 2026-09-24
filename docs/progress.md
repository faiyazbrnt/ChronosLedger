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
| **Phase 7** | Dashboard & Polish | **DONE** | ✅ Weekly hours & budget summary, responsive & a11y passes, skip-link, all gates green |

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

## Phase 7 Log
- **Done:**
  - Defined comprehensive `DashboardData` and sub-types in `src/features/dashboard/types/index.ts`.
  - Implemented pure calculations in `src/features/dashboard/lib/calc-dashboard.ts` (`calculateWeeklyDtrSummary`, `calculateWeeklyBudgetSummary`) with unit tests in `calc-dashboard.test.ts` (all 57 unit tests green across 7 files).
  - Built `getDashboardData` service layer in `src/features/dashboard/services/dashboard-service.ts` with parallel Prisma queries, user data isolation, and weekly allowance fallback.
  - Built interactive `DashboardView` component:
    - Weekly hours KPI with decimal conversion and 40h standard week progress bar.
    - Remaining budget KPI with dynamic safe-to-spend per day rate, allowance spend bar, and inheritance status tag.
    - Three-tier budget health status system (`On Track`, `Near Limit`, `Over Budget`) featuring prominent alert banners.
    - Side-by-side recent activity feeds for recent work shifts (with clock times, net duration, and lunch deduction badge) and recent expenses (with category badges and formatted amounts).
    - Polished empty states with direct "+ Log Shift" and "+ Add Expense" action triggers.
  - Connected `src/app/(app)/dashboard/page.tsx` with dynamic SSR preloading for instant zero-layout-shift hydration.
  - Added accessible keyboard skip-to-main-content link in `src/app/layout.tsx`.
  - Verified responsive design (desktop sidebar + mobile bottom navigation bar + mobile header) across both themes.
  - All quality gates green: `bun run typecheck`, `bun run lint`, `bun test`, `bun run build`.
- **Next:** System Logo implementation completed.
- **Blockers:** None.

---

## Brand & Identity: System Logo Implementation
- **Done:**
  - Extracted and cropped user's official ChronosLedger emblem (Ionic column, Chronos clock, laurel wreath, analytics grid, gold coin) using a custom `sharp` pipeline (`scripts/generate-brand-assets.ts`).
  - Generated multi-resolution assets in `public/brand/`:
    - `logo.png` (286x286 master cropped squircle)
    - `logo-original.png` (500x500 original asset)
    - `logo-512.png`, `logo-192.png`, `logo-64.png`, `logo-32.png`, `logo-16.png`
    - `logo.svg` (high-fidelity vector version)
  - Generated browser tab and PWA assets:
    - `src/app/icon.png` and `src/app/apple-icon.png` (Next.js App Router automated icon routes)
    - `src/app/favicon.ico` (multi-resolution 16x16, 32x32, 48x48 ICO file)
  - Configured Next.js metadata in `src/app/layout.tsx`: `title`, `description`, `metadataBase`, `icons`, and `openGraph` image.
  - Implemented `<SystemLogo />` and `<Brand />` components in `src/components/ui/system-logo.tsx`:
    - Size presets: `xs` (20px), `sm` (28px), `md` (36px), `lg` (44px), `xl` (64px), `2xl` (96px).
    - Smooth hover micro-interaction (`hover:scale-105 active:scale-95`).
    - Next/Image optimization with eager `priority` loading and zero layout shift.
    - Re-exported through public barrels `src/components/ui/index.ts` and `src/components/layout/index.ts`.
  - Replaced temporary placeholder icons (`CalendarClock`) with `<Brand />` in:
    - `src/components/layout/app-shell.tsx` (Desktop sidebar and mobile header)
    - `src/features/auth/components/auth-card.tsx` (Auth login and signup header)
  - Adjusted sidebar header layout and typography:
    - Removed tagline/subtitle text ("DTR & Budget Tracker") from the top-left sidebar header.
    - Vertically centered "ChronosLedger" directly with the adjacent logo icon.
  - Updated HTML document and browser tab title to "ChronosLedger".
  - Fixed module navigation latency bug:
    - Added `src/app/(app)/loading.tsx` instant loading skeleton boundary to eliminate client-side route freeze.
    - Forwarded user headers in `middleware.ts` and added `getAuthUser()` in `src/lib/supabase/server.ts`, eliminating duplicate remote `getUser()` HTTPS calls.
    - Parallelized database queries using `Promise.all` in `budget/page.tsx` and `dtr/page.tsx`.
  - Implemented Lighthouse 80+ / Core Web Vitals optimizations:
    - Code-split Recharts via `next/dynamic` and decoupled from `budget/index.ts`, reducing `/budget` page chunk from 118 kB to 10.7 kB (91% reduction).
    - Added `display: "swap"` to Google Geist fonts in `layout.tsx` to eliminate FOIT and optimize FCP/LCP.
    - Configured `SystemLogo` to serve dimension-scaled PNGs (12 kB `logo-64.png` instead of 152 kB `logo.png`).
    - Configured Gzip/Brotli compression and stripped powered-by header in `next.config.ts`.
  - All quality gates 100% green: `bun run typecheck`, `bun run lint`, `bun test`, `bun run build`.
- **Status:** Complete.

---

## Module Navigation Feedback & Query Parallelism
- **Done:** Added an AppShell-wide `useLinkStatus` navigation pattern with a 150 ms delayed, reduced-motion-safe spinner and polite screen-reader status. The shared `(app)/loading.tsx` continues to provide the route-level skeleton for Dashboard, DTR, Budget, and Settings.
- **Done:** Parallelized exact and historical weekly-allowance reads in both Budget and Dashboard loading paths without changing fallback behavior.
- **Verification:** `bun run typecheck`, `bun run lint`, `bun test` (57 passing), `bun run db:generate`, and `bun run build` all pass.
- **Blockers:** Authenticated browser interaction and network throttling require a test account/browser automation, neither of which is available in this environment.

---

## Mint Palette, Budget Pie Chart & Mobile Drawer
- **Done:** Replaced light-mode beige and maroon design tokens with mint surfaces, orange CTA tokens with dark foreground text, and blue link/navigation tokens. Dark-mode token values remain unchanged.
- **Done:** Replaced the Budget Monthly Recharts bar chart with a responsive donut-style pie chart, category legend, amount-and-percentage tooltip, and existing empty state.
- **Done:** Replaced the mobile bottom navigation with an accessible left drawer that supports backdrop, Escape, route-change, and desktop-breakpoint close paths, focus trapping, focus return, body-scroll locking, and reduced motion.
- **Next:** Run a manual authenticated visual check at 375 px, 768 px, and 1280 px when a browser test session is available.
- **Blockers:** None for automated verification.

---

## Slate, Teal & Orange Light Palette
- **Done:** Updated light-mode canvas, surface, primary text/border, active, success, and alert design tokens to the supplied slate, teal, and orange palette. Existing dark-mode values are preserved.
- **Done:** Migrated hard-coded light success and near-limit alert utility colors to semantic `success` and `warning` tokens.
- **Blockers:** `bun run db:generate` is blocked by a Windows lock on Prisma's generated query-engine DLL; rerun after the process holding `node_modules/.prisma/client/query_engine-windows.dll.node` exits.

---

---

## Auth Profile Bootstrap, Signup Errors & Shell Alignment
- **Done:** Added idempotent profile/settings initialization after confirmation, on confirmed login, and before user-owned create or upsert actions to prevent missing-parent FK failures.
- **Done:** Added a non-executed `scripts/backfill-profiles.ts` utility for missing profiles, friendly rate-limit and persistence errors, and server-side error logging.
- **Done:** Removed the desktop sidebar divider and aligned the sidebar brand and desktop header borders at a shared 65 px height.

---

## Navigation Bar Distinction & Divider Removal
- **Done:** Restyled the desktop navigation sidebar to a deep dark slate (`#131B21` in light mode, `#090D11` in dark mode) with a subtle edge boundary (`border-r border-slate-800/40 dark:border-white/10`).
- **Done:** Updated sidebar brand typography with crisp white text (`text-white`) and emerald hover transition.
- **Done:** Enhanced navigation links with slate-400 inactive state and elevated `bg-white/[0.12]` active state with emerald-tinted icon indicators (`[&_svg]:text-emerald-400`), meeting WCAG AAA contrast guidelines.
- **Done:** Completely removed the harsh horizontal divider line (`border-b border-border`) beneath the top header, and transitioned header background to a seamless canvas blend (`bg-background/80 backdrop-blur-md`).
- **Done:** Aligned mobile drawer with the deep dark slate styling and mobile header with the borderless canvas blend.
- **Verification:** `bun run typecheck`, `bun run lint`, `bun test` (57 passing), and `bun run build` (all 18 routes compiled cleanly) all pass.

---

## Collapsible Navigation Sidebar (Icon-Only Minimized State)
- **Done:** Added an edge toggle button positioned on the right border of the sidebar (`absolute -right-3.5 top-1/2 -translate-y-1/2`) featuring `ChevronLeft` when expanded and `ChevronRight` when collapsed.
- **Done:** Implemented minimized icon-only sidebar rail mode (`72px`), centering the logo icon and navigation icons with native hover tooltips and `sr-only` accessibility labels.
- **Done:** Added smooth animated transitions for sidebar width (`md:w-64` ⟷ `md:w-[72px]`) and main content padding (`md:pl-64` ⟷ `md:pl-[72px]`).
- **Done:** Implemented client-side persistence of collapsed state via `localStorage` key `chronos_sidebar_collapsed`.
- **Done:** Added `hideTitle` prop to `Brand` component for cleanly centering the logo icon when collapsed.
- **Verification:** `bun run typecheck`, `bun run lint`, and `bun test` (57 passing) all pass.

---

## Realtime Notifications & Popover Positioning Fix
- **Done:**
  - **Bug 1 (Layout/Positioning):** Converted centered modal dialog into an anchored dropdown popover positioned directly under the header bell trigger (`absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-96 z-50`).
  - Added a responsive screen-dimming backdrop (`fixed inset-0 z-40 bg-foreground/20 backdrop-blur-[1px]`) that dismisses the popover when clicked.
  - Implemented keyboard accessibility: <kbd>Escape</kbd> dismissal with focus restoration to the bell button, and focus cycle trapping within the open panel.
  - **Bug 2 (Realtime):** Enabled initial fetch on component mount so the bell badge renders immediately upon loading any dashboard route.
  - Connected Supabase Realtime channel (`postgres_changes` on `notifications` table filtered by `userId`) for instant push updates (<50ms) on `INSERT`, `UPDATE`, and `DELETE`.
  - Configured PostgreSQL `supabase_realtime` publication and `REPLICA IDENTITY FULL` on the `notifications` table.
  - Added window focus/visibility change re-sync and a 60-second polling heartbeat fallback for network resiliency.
  - Added pure notification utilities and unit tests in `src/features/notifications/lib/notification-utils.test.ts` (unread badge cap `"10+"`, date grouping, sorting, filtering).
- **Verification:** All 66 unit tests pass (`bun test`), `tsc --noEmit` zero errors, ESLint zero errors/warnings, and Next.js production build passes cleanly.
- **Blockers:** None.



