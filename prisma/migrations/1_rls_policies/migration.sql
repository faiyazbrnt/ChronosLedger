-- ==============================================================================
-- Defense-in-Depth: Row-Level Security (RLS) & Owner Policies
-- ==============================================================================
-- All tables in public schema are protected with RLS to prevent unauthorized
-- access through Supabase PostgREST endpoints.
-- Each authenticated user is strictly isolated to their own records.
-- ==============================================================================

-- Supabase owns the auth schema, roles, and auth.uid() function. Do not create
-- or replace them from SQL Editor. Remove only this application's policies so
-- the remainder of this migration is safe to re-run.
DO $$
DECLARE
  policy_record record;
BEGIN
  FOR policy_record IN
    SELECT * FROM (VALUES
      ('profiles', 'profiles_select_owner'), ('profiles', 'profiles_insert_owner'), ('profiles', 'profiles_update_owner'), ('profiles', 'profiles_delete_owner'),
      ('settings', 'settings_select_owner'), ('settings', 'settings_insert_owner'), ('settings', 'settings_update_owner'), ('settings', 'settings_delete_owner'),
      ('dtr_entries', 'dtr_entries_select_owner'), ('dtr_entries', 'dtr_entries_insert_owner'), ('dtr_entries', 'dtr_entries_update_owner'), ('dtr_entries', 'dtr_entries_delete_owner'),
      ('expenses', 'expenses_select_owner'), ('expenses', 'expenses_insert_owner'), ('expenses', 'expenses_update_owner'), ('expenses', 'expenses_delete_owner'),
      ('weekly_allowances', 'weekly_allowances_select_owner'), ('weekly_allowances', 'weekly_allowances_insert_owner'), ('weekly_allowances', 'weekly_allowances_update_owner'), ('weekly_allowances', 'weekly_allowances_delete_owner')
    ) AS policies(table_name, policy_name)
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_record.policy_name, policy_record.table_name);
  END LOOP;
END;
$$;

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
