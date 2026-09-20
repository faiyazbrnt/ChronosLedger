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
