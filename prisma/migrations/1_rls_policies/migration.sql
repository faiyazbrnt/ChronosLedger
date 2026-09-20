-- ==============================================================================
-- Defense-in-Depth: Row-Level Security (RLS) & Owner Policies
-- ==============================================================================
-- All tables in public schema are protected with RLS to prevent unauthorized
-- access through Supabase PostgREST endpoints.
-- Each authenticated user is strictly isolated to their own records.
-- ==============================================================================

-- 0. Ensure auth schema, roles, and auth.uid() exist for shadow database compatibility
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon;
  END IF;
END $$;

CREATE SCHEMA IF NOT EXISTS "auth";
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid AS $$
  SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$ LANGUAGE sql STABLE;

-- 1. Profiles Table
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_owner"
  ON "public"."profiles"
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_owner"
  ON "public"."profiles"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_owner"
  ON "public"."profiles"
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_delete_owner"
  ON "public"."profiles"
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- 2. Settings Table
ALTER TABLE "public"."settings" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "settings_select_owner"
  ON "public"."settings"
  FOR SELECT
  TO authenticated
  USING (auth.uid() = "userId");

CREATE POLICY "settings_insert_owner"
  ON "public"."settings"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = "userId");

CREATE POLICY "settings_update_owner"
  ON "public"."settings"
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = "userId")
  WITH CHECK (auth.uid() = "userId");

CREATE POLICY "settings_delete_owner"
  ON "public"."settings"
  FOR DELETE
  TO authenticated
  USING (auth.uid() = "userId");

-- 3. DTR Entries Table
ALTER TABLE "public"."dtr_entries" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dtr_entries_select_owner"
  ON "public"."dtr_entries"
  FOR SELECT
  TO authenticated
  USING (auth.uid() = "userId");

CREATE POLICY "dtr_entries_insert_owner"
  ON "public"."dtr_entries"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = "userId");

CREATE POLICY "dtr_entries_update_owner"
  ON "public"."dtr_entries"
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = "userId")
  WITH CHECK (auth.uid() = "userId");

CREATE POLICY "dtr_entries_delete_owner"
  ON "public"."dtr_entries"
  FOR DELETE
  TO authenticated
  USING (auth.uid() = "userId");

-- 4. Expenses Table
ALTER TABLE "public"."expenses" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "expenses_select_owner"
  ON "public"."expenses"
  FOR SELECT
  TO authenticated
  USING (auth.uid() = "userId");

CREATE POLICY "expenses_insert_owner"
  ON "public"."expenses"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = "userId");

CREATE POLICY "expenses_update_owner"
  ON "public"."expenses"
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = "userId")
  WITH CHECK (auth.uid() = "userId");

CREATE POLICY "expenses_delete_owner"
  ON "public"."expenses"
  FOR DELETE
  TO authenticated
  USING (auth.uid() = "userId");

-- 5. Weekly Allowances Table
ALTER TABLE "public"."weekly_allowances" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "weekly_allowances_select_owner"
  ON "public"."weekly_allowances"
  FOR SELECT
  TO authenticated
  USING (auth.uid() = "userId");

CREATE POLICY "weekly_allowances_insert_owner"
  ON "public"."weekly_allowances"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = "userId");

CREATE POLICY "weekly_allowances_update_owner"
  ON "public"."weekly_allowances"
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = "userId")
  WITH CHECK (auth.uid() = "userId");

CREATE POLICY "weekly_allowances_delete_owner"
  ON "public"."weekly_allowances"
  FOR DELETE
  TO authenticated
  USING (auth.uid() = "userId");
