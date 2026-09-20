CREATE TABLE "notifications" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "message" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt");
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_owner"
  ON "public"."notifications"
  FOR SELECT TO authenticated
  USING (auth.uid() = "userId");

CREATE POLICY "notifications_insert_owner"
  ON "public"."notifications"
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = "userId");

CREATE POLICY "notifications_update_owner"
  ON "public"."notifications"
  FOR UPDATE TO authenticated
  USING (auth.uid() = "userId")
  WITH CHECK (auth.uid() = "userId");

CREATE POLICY "notifications_delete_owner"
  ON "public"."notifications"
  FOR DELETE TO authenticated
  USING (auth.uid() = "userId");
