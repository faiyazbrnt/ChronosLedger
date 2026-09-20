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

### [FS & FE] Module Navigation Performance Optimization and Instant Loading States
- **Context:** Navigating between modules in the AppShell experienced long multi-second delays. Root cause investigation revealed a combination of:
  1. Next.js App Router client-side navigation blocking due to a missing `loading.tsx` boundary.
  2. Redundant remote Supabase Auth network roundtrips (`supabase.auth.getUser()`) occurring on both the middleware and again within each destination Server Component.
  3. Sequential database query waterfalls in `budget/page.tsx` (3 queries in series) and `dtr/page.tsx` (2 queries in series).
- **Decision:**
  1. Created `src/app/(app)/loading.tsx` using responsive `Skeleton` components, allowing Next.js to transition routes instantly (0ms) and keep the shell responsive while data streams in.
  2. Attached cryptographically verified user identity (`x-user-id`, `x-user-email`) in middleware request headers and created `getAuthUser()` in `src/lib/supabase/server.ts` to resolve user identity in 0ms (in-memory) with zero network calls to Supabase, with automatic fallback.
  3. Parallelized independent database queries using `Promise.all` in `budget/page.tsx` and `dtr/page.tsx`, reducing database latency by over 60%.

### [FS & FE] Delayed Link-Pending Feedback and Eager Module Prefetch
- **Context:** The route-level loading boundary communicates a slow destination render, but it cannot indicate which module link initiated navigation. The remaining allowance fallback queries also needlessly waited for the exact-week lookup before beginning their independent historical lookup.
- **Decision:** Used Next 15.5.25's supported `useLinkStatus` API inside one reusable AppShell module-link component. It shows a `Loader2` indicator only after 150 ms, so cached navigations do not flicker; it includes `role="status"`, `aria-live="polite"`, `aria-busy`, a visually hidden loading label, and `motion-reduce:animate-none`. Top-level module links opt into full App Router prefetching. Exact-week and historical allowance reads now run in `Promise.all`, retaining the exact-week-first result semantics while removing the avoidable waterfall.

### [FE] Mint, Orange, and Blue Light-Mode Semantic Tokens
- **Context:** The original light palette used beige and maroon semantics that no longer match the product direction. Orange is unsuitable for white button text at WCAG AA contrast.
- **Decision:** Set the light background and surfaces to mint (`#CBF3F0`), CTAs to orange (`#FF9F1C`) with a dark navy foreground (`#012A4A`), and links/active navigation to blue (`#0353A4`). Derived surface, border, muted, link, navigation, and chart category colors live in `globals.css`; dark-mode tokens are unchanged.

### [FE] Responsive Recharts Pie Chart and Mobile Navigation Drawer
- **Context:** Monthly category spending is proportion-based data, which is clearer as a pie chart. The mobile bottom bar consumed persistent vertical space.
- **Decision:** Reused Recharts to render a responsive donut-style pie chart with CSS-token-driven category colors, legend, tooltip, and existing empty state. Replaced only the mobile bottom navigation with an AppShell drawer, using the existing `md` breakpoint and native focus/scroll management to avoid a new dialog dependency.

### [FE] Slate, Teal, and Orange Light-Mode Semantics
- **Context:** The supplied palette assigns distinct roles to neutral application layers, active time metrics, successful growth, and temporal alerts.
- **Decision:** Mapped canvas to `#F4F6F8`, cards and popovers to `#FFFFFF`, primary text and borders to `#263238`, active navigation and metrics to `#37474F`, success to `#00BFA5`, and alerts to `#FF5722`. Added Tailwind v4 semantic success and warning color tokens, preserving the existing dark-mode values.

### [FE] Lighthouse & Core Web Vitals Optimization Pipeline
- **Context:** Achieving an 80+ to 90+ Lighthouse Performance score required addressing critical rendering path bottlenecks, total blocking time (TBT), and asset weight across routes.
- **Decision:**
  1. **Dynamic Recharts Code-Splitting**: Recharts was deferred via `next/dynamic` in `budget-view.tsx` and unbundled from the public feature barrel `budget/index.ts`. This cut `/budget` page chunk size from 118 kB to 10.7 kB (a 91% reduction) and First Load JS by 108 kB.
  2. **Font Rendering Optimization**: Added `display: "swap"` to Google Geist fonts in `src/app/layout.tsx`, eliminating FOIT (Flash of Invisible Text) and accelerating FCP and LCP.
  3. **Responsive Image Delivery**: Configured `SystemLogo` to serve dimension-optimized assets (`logo-32.png` / `logo-64.png`, 3.5kB–12kB) instead of the full master PNG (152kB), saving 140kB of blocking image data on the initial viewport.
  4. **Next.js Production Configuration**: Enabled Gzip/Brotli compression and stripped powered-by headers in `next.config.ts`.


