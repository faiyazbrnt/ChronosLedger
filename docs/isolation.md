# Per-User Data Isolation & Defense-in-Depth Architecture

This document specifies the security architecture, query scoping rules, and verification procedures ensuring complete data isolation between accounts in **DTR & Budget Tracker**.

---

## 1. Dual-Layer Isolation Model

Because the application uses **Prisma** with Supabase PostgreSQL alongside **Supabase Auth**, security is enforced at two independent architectural boundaries:

```
                  ┌──────────────────────────────────────────────┐
                  │              Incoming Request                │
                  └──────────────────────┬───────────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 │                                               │
     Next.js Server Actions                          Supabase REST API (PostgREST)
                 │                                               │
  [Layer 1: Application Scoping]                    [Layer 2: Database RLS Policies]
  • Authenticate via supabase.auth.getUser()        • Authenticated JWT parsed by Postgres
  • Extract cryptographically verified userId       • auth.uid() matched against table columns
  • Scope all Prisma queries by userId              • Queries outside owner scope return 0 rows
                 │                                               │
                 └───────────────────────┬───────────────────────┘
                                         │
                                ┌────────▼────────┐
                                │ PostgreSQL DB   │
                                └─────────────────┘
```

---

## 2. Layer 1: Application Query Scoping (Prisma)

### Why it is necessary
Prisma connects to PostgreSQL using the database connection string (`DATABASE_URL`). In PostgreSQL, table owners and superusers (`postgres` role) **bypass Row-Level Security** by default. Therefore, application code cannot rely on RLS alone when executing Prisma queries.

### Architectural Rules
1. **Server-Side Identity Source:**
   Authentication always resolves the user via `supabase.auth.getUser()` in server actions or route handlers. `getSession()` is never trusted for authorization because it does not validate the JWT against the auth server.
2. **Mandatory `userId` Scoping:**
   Every Prisma service function in `src/features/*/services/` accepts an explicit `userId` parameter and includes it in the `where` clause:
   ```typescript
   // Example: DTR Entry query
   export async function getDtrEntriesForWeek(params: { userId: string; startDate: Date; endDate: Date }) {
     return prisma.dtrEntry.findMany({
       where: {
         userId: params.userId,
         workDate: { gte: params.startDate, lte: params.endDate },
       },
     });
   }
   ```
3. **Compound Key Isolation:**
   For single-record mutations (upsert/delete), queries use compound unique constraints that include `userId`:
   - `DtrEntry`: `@@unique([userId, workDate])`
   - `WeeklyAllowance`: `@@unique([userId, weekStart])`
   - `Settings`: `@unique userId`
   - Deletions use `deleteMany({ where: { id, userId } })` to prevent deleting records by ID alone without ownership proof.
4. **Cascade Deletion:**
   All user-owned child tables specify `onDelete: Cascade` referencing `profiles(id)`. When an account is removed, all associated records are purged atomically.

---

## 3. Layer 2: Database Defense-in-Depth (RLS)

### Why it is necessary
Supabase exposes the `public` schema via PostgREST (`https://[ref].supabase.co/rest/v1/`). If a user acquires the public `anon` key, they could attempt to query PostgreSQL tables directly.

### RLS Policies (`prisma/migrations/1_rls_policies/migration.sql`)
Row-Level Security is enabled on all tables in `public`. Default permissions are denied; only rows satisfying `auth.uid() = id` (for profiles) or `auth.uid() = "userId"` (for data tables) are returned to `authenticated` clients.

| Table | Policy Name | Permitted Roles | Condition |
|---|---|---|---|
| `profiles` | `profiles_*_owner` | `authenticated` | `auth.uid() = id` |
| `settings` | `settings_*_owner` | `authenticated` | `auth.uid() = "userId"` |
| `dtr_entries` | `dtr_entries_*_owner` | `authenticated` | `auth.uid() = "userId"` |
| `expenses` | `expenses_*_owner` | `authenticated` | `auth.uid() = "userId"` |
| `weekly_allowances` | `weekly_allowances_*_owner` | `authenticated` | `auth.uid() = "userId"` |

Anonymous/unauthenticated requests cannot view or insert any rows.

---

## 4. Verification Procedures

### Test 1: Simulating Cross-User Access in Supabase SQL Editor
To verify that PostgreSQL RLS blocks cross-user access:

```sql
-- 1. Create two test profile IDs
DO $$
DECLARE
  user_a uuid := '11111111-1111-1111-1111-1111-111111111111';
  user_b uuid := '22222222-2222-2222-2222-222222222222';
BEGIN
  -- Insert test records under superuser
  INSERT INTO public.profiles (id, email) VALUES (user_a, 'user_a@example.com'), (user_b, 'user_b@example.com') ON CONFLICT DO NOTHING;
  INSERT INTO public.expenses (id, "userId", "spentOn", category, "amountMinor")
  VALUES (gen_random_uuid(), user_a, CURRENT_DATE, 'FOOD', 50000) ON CONFLICT DO NOTHING;
END $$;

-- 2. Assume identity of User B
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub": "22222222-2222-2222-2222-222222222222"}';

-- 3. Query User A's expenses (MUST return 0 rows)
SELECT * FROM public.expenses WHERE "userId" = '11111111-1111-1111-1111-111111111111';
-- Result: 0 rows returned (blocked by RLS)

-- 4. Query own expenses (MUST return only User B's rows)
SELECT * FROM public.expenses;
-- Result: 0 rows returned (User B has no expenses)
```

### Test 2: Application-Level Boundary Verification
- Service functions are placed under `src/features/*/services/` and protected with `import "server-only"`.
- ESLint boundaries strictly forbid importing `@/lib/prisma` or `@prisma/client` from any UI components, actions, or route handlers.
- Server actions accept validated Zod inputs, retrieve the verified caller session from `supabase.auth.getUser()`, and supply that caller's `id` to the service. A client cannot spoof a `userId` because `userId` is never read from client form inputs.
