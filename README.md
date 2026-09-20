# ChronosLedger

> **Personal Daily Time Record (DTR) & Weekly Budget Management Tracker**

ChronosLedger is a private, precision-engineered web application designed to eliminate daily tracking friction. It seamlessly unites two critical daily routines—**audited shift work hour tracking (DTR)** and **weekly allowance/expense budgeting**—into an intuitive, distraction-free mission control.

Built on **Next.js 15 (App Router)**, **React 19**, **Bun**, **Tailwind CSS v4**, **Prisma**, and **Supabase**, ChronosLedger delivers sub-millisecond response times, mathematically exact financial calculations, and high-contrast ergonomics across both desktop and mobile devices.

---

## What is ChronosLedger All About?

Professionals, freelancers, and students often struggle with fragmented daily tracking: timesheets are tracked in spreadsheets or ad-hoc timers, while personal weekly allowances and daily expenses are scattered across banking apps or notebooks. 

ChronosLedger solves this by combining both workflows under a single cohesive interface:

1. **Know Exactly What You Worked**: Log daily clock-in and clock-out times, calculate precise net worked hours, snapshot your lunch break deduction at entry creation, and monitor progress toward a 40-hour weekly target.
2. **Know Exactly What You Can Spend**: Allocate a weekly budget starting every Monday, log daily expenses across 7 clear categories, and let the system calculate your exact **safe-to-spend balance per day** so you never blow through your allowance before the weekend.
3. **High-Contrast, Accessible Ergonomics**: Designed for long-term daily use with a curated light palette (`#FFEFCC` surface with `#660000` dark maroon accents) and a distraction-free pure monochrome dark mode (`#09090b` / `#fafafa`).

---

## Key Features

### 1. Daily Time Record (DTR)
- **Timezone-Safe Calendar Logic**: All calendar date math operates on strict `YYYY-MM-DD` string tuples, preventing shifts across UTC timezones.
- **Native Time Selectors**: Seamless time pickers with live net duration previews (e.g., *8:30 AM to 6:30 PM minus 60m lunch = 9h 00m*).
- **Snapshot Lunch Deduction Guarantee**: Your lunch deduction setting is permanently snapshotted onto each entry at creation time. Updating your default lunch rule later will never rewrite historical timesheets.
- **Weekly & Monthly Views**: Paginate across Monday-to-Sunday work weeks with daily breakdowns, shift notes, and aggregated monthly timesheets.

### 2. Weekly Allowance & Expense Tracker
- **Integer Minor-Unit Math**: All monetary amounts are stored and computed strictly as integer minor units (cents/centavos) to completely eliminate IEEE-754 floating-point rounding errors.
- **Automated Historical Fallback**: If an allowance isn't manually entered for a new week, ChronosLedger automatically inherits the most recently configured allowance, eliminating repetitive data entry.
- **Dynamic Safe-to-Spend Rate**: Automatically computes how much you can spend per remaining day of the active week.
- **Three-Tier Multi-Modal Health Alerts**:
  - `On Track` (≤ 75% spent): Green check indicator with daily safe rate.
  - `Near Limit` (76%–99% spent): Amber caution alert.
  - `Over Budget` (> 100% spent): Distinct red warning alert showing the exact overage amount.
- **Category Breakdown Analytics**: Recharts-powered distribution chart and linear meters across 7 core categories:
  - Food & Dining, Transportation, Bills & Utilities, Shopping, Health & Medical, Entertainment, and Other.

### 3. Central Mission Control (Dashboard)
- **At-a-Glance KPI Cards**: Weekly hours worked with 40h target progress, remaining budget balance, and account overview.
- **Recent Activity Feeds**: Latest 5 work shifts (with clock times and lunch badges) and latest 5 expenses (with category pills and formatted amounts).
- **Direct Quick Actions**: One-click "Log Shift" and "Add Expense" shortcuts for lightning-fast input.

### 4. Settings & Account Customization
- **Lunch Deduction Policy**: Toggle automatic deduction on/off with quick-select chips (15m, 30m, 45m, 60m, 90m) or custom durations up to 240 minutes.
- **Universal Currency Support**: Configure your preferred currency (e.g., `PHP`, `USD`, `EUR`, `GBP`, `JPY`, `SGD`, `AUD`, `CAD`) with live preview formatting via `Intl.NumberFormat`.

### 5. Security & Multi-Tenant Data Isolation
- **Supabase SSR Authentication**: Secure cookie-based authentication with email verification.
- **Unverified Account Gatekeeping**: Blocks unconfirmed accounts from accessing authenticated application pages.
- **Two-Tier Isolation Strategy**:
  - **Tier 1**: Application-level `where: { userId }` scoping in every Prisma service function.
  - **Tier 2**: Database-level PostgreSQL Row-Level Security (RLS) policies enforcing `auth.uid() = id` and `auth.uid() = "userId"`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Runtime & Package Manager** | [Bun](https://bun.sh/) 1.4+ |
| **Framework** | [Next.js](https://nextjs.org/) 15 (App Router, React 19) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (Strict mode, `noUncheckedIndexedAccess`) |
| **Styling & Icons** | [Tailwind CSS v4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/), [shadcn/ui](https://ui.shadcn.com/) |
| **Data Visualization** | [Recharts](https://recharts.org/) |
| **Database & ORM** | PostgreSQL ([Supabase](https://supabase.com/)), [Prisma](https://www.prisma.io/) 6.19.3 |
| **Authentication** | Supabase Auth (`@supabase/ssr`) |
| **Architecture Enforcement** | ESLint (`eslint-plugin-boundaries`, `no-restricted-imports`) |
| **Testing** | Bun Test (57 pure unit tests across 7 suites) |

---

## Architecture & Folder Structure

ChronosLedger enforces strict **Feature-Driven Development (FDD)** with mechanical boundary linting rules:

```
src/
  app/                    # ROUTING ONLY: Thin pages composing feature exports
    (app)/                # Authenticated application shell routes
      dashboard/page.tsx  # Central dashboard view
      dtr/page.tsx        # Daily Time Record view
      budget/page.tsx     # Weekly budget & expense view
      settings/page.tsx   # User configuration view
    (auth)/               # Public authentication routes
      login/page.tsx
      register/page.tsx
      verify-email/page.tsx
    auth/confirm/         # Email verification callback route
  features/               # Self-contained business domains
    auth/                 # Supabase auth actions, forms, schemas
    dashboard/            # Dashboard aggregation services, metrics, feeds
    dtr/                  # Work shift services, calculations, timesheet modals
    budget/               # Allowance services, expense CRUD, category charts
    settings/             # User settings services, form, validation
  components/             # Shared presentation layer
    layout/               # AppShell, desktop sidebar, mobile bottom nav, theme toggle
    ui/                   # shadcn/ui design primitives (Button, Card, Badge, etc.)
  lib/                    # Utilities: prisma singleton, date math, money formatters
prisma/
  schema.prisma           # Data models: Profile, Settings, DtrEntry, Expense, WeeklyAllowance
  migrations/             # Versioned SQL migrations & RLS policies
docs/
  decisions.md            # Architectural decision records (ADRs)
  progress.md             # Multi-phase execution and verification log
  isolation.md            # Two-tier per-user isolation architecture
```

---

## Getting Started

### Prerequisites
- [Bun](https://bun.sh/) 1.4 or higher installed.
- A [Supabase](https://supabase.com/) project with PostgreSQL and Auth enabled.

### 1. Clone & Install
```bash
git clone https://github.com/faiyazbrnt/ChronosLedger.git
cd ChronosLedger
bun install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:

```env
# Database Connections (Supabase)
# Transaction pooler (Port 6543) for runtime queries:
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
# Direct connection (Port 5432) for Prisma migrations:
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
```

### 3. Generate Prisma Client & Run Migrations
```bash
bun run db:generate
bun run db:migrate
```

### 4. Start the Development Server
```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Quality Gates & Verification

All code in ChronosLedger adheres to five strict quality gates:

```bash
# 1. Typecheck (Strict TypeScript, zero errors)
bun run typecheck

# 2. Linting (ESLint with mechanical boundaries)
bun run lint

# 3. Unit Tests (All 57 pure logic unit tests)
bun test

# 4. Production Build (Next.js 15 App Router compilation)
bun run build
```

---

## License

This project is private and licensed under the MIT License.
