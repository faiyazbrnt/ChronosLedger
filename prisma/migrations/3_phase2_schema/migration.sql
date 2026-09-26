-- Phase 2 Schema Migration: Profiles (name, avatar), Settings (renderedHoursTarget, remove lunch), DTR (nullable timeOut, activity report fields, break entries), Budget Configs

-- 1. Profiles: name, avatar
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "name" TEXT;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "avatar" TEXT;

-- 2. Settings: renderedHoursTarget, remove lunch fields
ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "renderedHoursTarget" INTEGER;
ALTER TABLE "settings" DROP COLUMN IF EXISTS "lunchDeductionEnabled";
ALTER TABLE "settings" DROP COLUMN IF EXISTS "lunchBreakMinutes";

-- 3. DTR Entries: nullable timeOutMinutes, activity report fields
ALTER TABLE "dtr_entries" ALTER COLUMN "timeOutMinutes" DROP NOT NULL;
ALTER TABLE "dtr_entries" ADD COLUMN IF NOT EXISTS "activity" TEXT;
ALTER TABLE "dtr_entries" ADD COLUMN IF NOT EXISTS "activityDescription" TEXT;
ALTER TABLE "dtr_entries" ADD COLUMN IF NOT EXISTS "remarks" TEXT;

-- 4. DTR Break Entries table
CREATE TABLE IF NOT EXISTS "dtr_break_entries" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "dtrEntryId" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "category" TEXT NOT NULL,
  "durationMinutes" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "dtr_break_entries_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "dtr_break_entries_dtrEntryId_idx" ON "dtr_break_entries"("dtrEntryId");
CREATE INDEX IF NOT EXISTS "dtr_break_entries_userId_idx" ON "dtr_break_entries"("userId");

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'dtr_break_entries_dtrEntryId_fkey'
  ) THEN
    ALTER TABLE "dtr_break_entries" ADD CONSTRAINT "dtr_break_entries_dtrEntryId_fkey"
      FOREIGN KEY ("dtrEntryId") REFERENCES "dtr_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'dtr_break_entries_userId_fkey'
  ) THEN
    ALTER TABLE "dtr_break_entries" ADD CONSTRAINT "dtr_break_entries_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

ALTER TABLE "public"."dtr_break_entries" ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'dtr_break_entries_owner_policy') THEN
    CREATE POLICY "dtr_break_entries_owner_policy" ON "public"."dtr_break_entries"
      FOR ALL TO authenticated
      USING (auth.uid() = "userId")
      WITH CHECK (auth.uid() = "userId");
  END IF;
END $$;

-- 5. Budget Configs table & BudgetCycleType enum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BudgetCycleType') THEN
    CREATE TYPE "BudgetCycleType" AS ENUM ('WEEKLY', 'MONTHLY', 'SEMI_MONTHLY');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "budget_configs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "cycleType" "BudgetCycleType" NOT NULL DEFAULT 'WEEKLY',
  "amountMinor" INTEGER NOT NULL DEFAULT 0,
  "anchorDate" DATE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "budget_configs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "budget_configs_userId_key" UNIQUE ("userId")
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'budget_configs_userId_fkey'
  ) THEN
    ALTER TABLE "budget_configs" ADD CONSTRAINT "budget_configs_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

ALTER TABLE "public"."budget_configs" ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'budget_configs_owner_policy') THEN
    CREATE POLICY "budget_configs_owner_policy" ON "public"."budget_configs"
      FOR ALL TO authenticated
      USING (auth.uid() = "userId")
      WITH CHECK (auth.uid() = "userId");
  END IF;
END $$;

-- Migrate latest weekly allowance if any exists into budget_configs
INSERT INTO "budget_configs" ("id", "userId", "cycleType", "amountMinor", "createdAt", "updatedAt")
SELECT DISTINCT ON ("userId")
  gen_random_uuid(),
  "userId",
  'WEEKLY'::"BudgetCycleType",
  "amountMinor",
  NOW(),
  NOW()
FROM "weekly_allowances"
ORDER BY "userId", "weekStart" DESC
ON CONFLICT ("userId") DO NOTHING;
