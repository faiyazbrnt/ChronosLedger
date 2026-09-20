# Architectural & Design Decisions

This document tracks non-obvious technical and design choices across development phases. Decisions are tagged with `[FS]` (Senior Full-Stack Hat) or `[FE]` (Senior Frontend Hat).

---

### [FS] Prisma 6.19.3 Selected Over Prisma 7/8-rc
- **Context:** `npm/bun` defaults installed Prisma 8-rc / Prisma 7, which deprecated `url` and `directUrl` in `schema.prisma`, requiring `prisma.config.ts` and driver adapters.
- **Decision:** Aligned `@prisma/client` and `prisma` CLI to stable version `6.19.3`. This natively supports `url = env("DATABASE_URL")` (pooled port 6543) and `directUrl = env("DIRECT_URL")` (direct port 5432) as specified in product integration requirements without experimental adapters.

### [FE] Theme Color Token Inversion for shadcn Compatibility
- **Context:** The product specifies light mode surface `#FFEFCC` and accent `#660000`. In standard shadcn/ui conventions, `--primary` is the button background and `--background` is the screen surface.
- **Decision:** Mapped `--background: #ffefcc`, `--primary: #660000`, `--primary-foreground: #ffefcc`, and `--foreground: #260000` (derived dark maroon). Dark mode is strictly black and white (`--background: #09090b`, `--foreground: #fafafa`, `--primary: #ffffff`, `--primary-foreground: #09090b`).

### [FS] ESLint Flat Config with FlatCompat & Boundaries Plugin
- **Context:** Next.js 15 uses flat config (`eslint.config.mjs`) while `eslint-config-next@15` retains legacy extends. Furthermore, boundary rules must be strictly enforced.
- **Decision:** Utilized `@eslint/eslintrc` `FlatCompat` alongside `eslint-plugin-boundaries` and `no-restricted-imports`. Mechanical rules strictly block deep imports into features (`@/features/*/*`), isolate cross-feature internals, and prohibit Prisma queries outside `src/features/*/services/`.

### [FE] Strict Two-Color Palette Derivation via color-mix()
- **Context:** Design requirements specify that light mode cards, secondary elements, muted elements, and borders must be derived exclusively from `#FFEFCC` and `#660000` without introducing third-party hues.
- **Decision:** Used modern CSS `color-mix(in srgb, #ffefcc <pct>, #660000 <pct>)` in `globals.css` to mathematically blend surface and accent shades while preserving > 11:1 text contrast and zero chromatic aberration.

### [FE] Responsive Navigation Split (Desktop Sidebar + Mobile Bottom Tab Bar)
- **Context:** DTR and expense logging are mobile-first actions used on phones, while administrative review and monthly trends benefit from wide desktop layouts.
- **Decision:** AppShell renders a fixed `w-64` desktop sidebar on screens `≥ md`, and switches to a touch-optimized bottom tab bar (`min-h-[48px]`, touch targets `≥ 44px`) with safe-area spacing and a compact top brand header on mobile screens.

### [FS] Two-Tier Data Isolation Architecture (Service Scoping + Postgres RLS)
- **Context:** Prisma connects using direct PostgreSQL credentials which bypass Postgres RLS by default. Simultaneously, Supabase exposes all tables in the `public` schema via its PostgREST API.
- **Decision:** Implemented a strict two-tier isolation strategy. Tier 1 mandates explicit `where: { userId }` filtering in every Prisma service function using the cryptographically verified user ID from `supabase.auth.getUser()`. Tier 2 applies PostgreSQL Row-Level Security (`auth.uid() = id` / `auth.uid() = "userId"`) to all public tables, rendering PostgREST endpoints fully impervious to cross-tenant data leaks.

### [FS] Atomic & Idempotent Account Initialization in /auth/confirm
- **Context:** Supabase sends confirmation emails containing a verification link. Multiple link clicks, email scanners, or network retries could invoke `/auth/confirm` multiple times.
- **Decision:** Encapsulated account bootstrapping inside `upsertProfileAndSettings` using a single Prisma `$transaction`. Both `Profile` and `Settings` are upserted with safe default settings (`lunchDeductionEnabled: true`, `lunchBreakMinutes: 60`, `currency: 'PHP'`). Re-invoking the confirmation route is strictly idempotent and cannot cause duplicate-key collisions.

### [FS] Unverified Account Gatekeeping with Immediate Session Termination
- **Context:** Supabase default configuration might authenticate users even before their email address has been verified if configured with email confirmations enabled.
- **Decision:** Enforced application-level gatekeeping in both `signInAction` and `middleware.ts`. If `user.email_confirmed_at` is null, the action immediately invokes `supabase.auth.signOut()` and returns `{ ok: false, unverified: true, email }`. The client UI displays a targeted verification alert with an integrated resend verification trigger.

### [FE] Decoupled Auth Injection into Shell via Layout UserSlot
- **Context:** Mechanical boundary rules forbid `src/components/layout/*` from importing from `src/features/*`. However, the AppShell requires a functional `LogoutButton` in both the desktop sidebar and mobile header.
- **Decision:** AppShell defines a generic `userSlot?: React.ReactNode` prop. The root app layout (`src/app/(app)/layout.tsx`) imports `LogoutButton` from `@/features/auth` and injects it into `AppShell`, preserving strict architectural boundaries with zero lint violations.

### [FE] Live Currency Format Preview with Intl.NumberFormat Resilience
- **Context:** When users type custom 3-letter currency codes into the settings form, invalid or incomplete strings could trigger `RangeError: Invalid currency code` in `Intl.NumberFormat`.
- **Decision:** Wrapped live currency formatting in a defensive parsing try/catch block within `SettingsForm`. If an unrecognized or incomplete code is entered, the UI gracefully falls back and surfaces an informative validation hint without crashing the component tree.

### [FS] Historical DTR Lunch Immutability Enforcement
- **Context:** If a user modifies their default lunch break duration (e.g. from 60 to 45 minutes), recalculating past DTR entries would alter historical work logs, timesheets, and hours previously approved or tracked.
- **Decision:** Changes made via `updateSettingsAction` strictly apply only to future DTR entries. All DTR entries permanently store their snapshotted `lunchMinutesApplied` at creation time, preserving audited historical accuracy.

### [FS] Service-Level Lunch Snapshotting without Cross-Feature Boundary Violations
- **Context:** ESLint mechanical boundary rules strictly prohibit cross-feature dependencies (e.g. `src/features/dtr` importing from `src/features/settings`). However, saving a new DTR shift requires the user's active lunch deduction preference.
- **Decision:** Implemented `saveDtrEntryWithSnapshot` directly inside `src/features/dtr/services/dtr-service.ts`. Because services have permitted access to `prisma`, it reads `prisma.settings` directly during entry creation to snapshot `lunchMinutesApplied` while preserving existing snapshots on updates, keeping all ESLint boundary rules clean.

### [FE] Timezone-Agnostic String Date Math for Week Intervals
- **Context:** Standard JavaScript `Date` objects shift calendar dates across timezones when using UTC conversions (e.g. converting `2026-09-21T00:00:00Z` in negative UTC offsets shifts to the previous day).
- **Decision:** Implemented pure integer calendar arithmetic in `src/lib/date.ts` (`getMondayOfWeek`, `getSundayOfWeek`, `getWeekDates`, `addDays`, `addWeeks`). Calculations parse `YYYY-MM-DD` strings directly into year, month, and day integers, guaranteeing zero date shifts or boundary errors regardless of client timezone.

### [FS] Integer Minor Units for Monetary Arithmetic
- **Context:** Storing and calculating currency amounts with floating-point numbers (`Float` or raw decimals in JS) leads to catastrophic IEEE-754 precision issues (e.g., `0.1 + 0.2 = 0.30000000000000004`), resulting in rounding drift in weekly totals and subtotals.
- **Decision:** Stored all amounts as integers in minor units (`amountMinor Int`, cents/centavos) in PostgreSQL and throughout all calculation pipelines (`calc-budget.ts`). Conversions to major units occur exclusively at user display formatting boundaries (`formatMoneyMinor`) and user input parsing (`parseMajorToMinor`).

### [FS] Historical Weekly Allowance Fallback
- **Context:** Allowance amounts are configured on a weekly basis (starting Monday). Requiring the user to manually set their allowance every Monday causes friction and breaks safe-to-spend analytics if skipped.
- **Decision:** Implemented automated fallback in `getWeeklyAllowance`. If no record exists for a target Monday, the query fetches the most recently configured previous Monday (`weekStart < targetMonday, orderBy: { weekStart: 'desc' }`) and marks it `isInherited: true`. This maintains seamless continuity across weeks while allowing specific weeks to have custom overrides.

### [FE] Multi-Modal Accessible Budget Health Indicators
- **Context:** Visual budget health indicators (On Track, Near Limit, Over Budget) risk failing accessibility guidelines if conveyed purely by color changes.
- **Decision:** Built budget health alerts with a three-layer cue system: distinct color badges (`color-mix` theme tokens), dedicated Lucide icons (`CheckCircle2`, `AlertCircle`, `AlertTriangle`), and unambiguous textual status descriptions specifying exact remaining or overage amounts.

### [FS] Unified Mission-Control Aggregation without Cross-Feature Import Violations
- **Context:** The Dashboard aggregates data from `Profile`, `Settings`, `DtrEntry`, `WeeklyAllowance`, and `Expense`. Directly importing between `@/features/dtr`, `@/features/budget`, and `@/features/dashboard` is strictly blocked by ESLint boundary rules.
- **Decision:** Encapsulated unified aggregation inside `src/features/dashboard/services/dashboard-service.ts`. Because service layers are granted authorized access to `prisma`, it performs optimized parallel queries across models, computes pure derived metrics via `calc-dashboard.ts`, and serializes a unified typed `DashboardData` payload directly for SSR page consumption.

### [FE & FS] System Logo Architecture and Multi-Resolution Asset Pipeline
- **Context:** The system required official branding implementation based on the high-fidelity ChronosLedger emblem (featuring an Ionic marble column, embedded Chronos clock, laurel wreath, financial column charts, ledger grid lines, and a gleaming gold coin).
- **Decision:** Built a multi-resolution asset pipeline using `sharp` in Bun:
  1. Cropped the original 500x500 asset tightly to the 286x286 squircle boundary (`public/brand/logo.png`), eliminating transparent margins for crisp display at any scale.
  2. Generated high-DPI assets (`logo-512.png`, `logo-192.png`, `logo-64.png`, `logo-32.png`, `logo-16.png`), a vector version (`logo.svg`), and multi-resolution `favicon.ico`.
  3. Integrated Next.js 15 App Router static metadata conventions (`src/app/icon.png` and `src/app/apple-icon.png`) with `metadataBase`, OpenGraph cards, and apple touch icons in `src/app/layout.tsx`.
  4. Created reusable `<SystemLogo />` and `<Brand />` components in `src/components/ui/system-logo.tsx` with size presets (`xs` through `2xl`), micro-interaction scale transitions, and accessible alt labels, cleanly replacing all temporary placeholder icons in `AppShell` and `AuthCard`.


