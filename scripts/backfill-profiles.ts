import { prisma } from "../src/lib/prisma";
import { ensureProfileAndSettings } from "../src/lib/profile-bootstrap";

type AuthUser = { id: string; email: string };

async function main() {
  const users = await prisma.$queryRaw<AuthUser[]>`
    SELECT id, email
    FROM auth.users
    WHERE email IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM public.profiles WHERE profiles.id = users.id
      )
  `;

  for (const user of users) {
    await ensureProfileAndSettings({ userId: user.id, email: user.email });
  }

  console.info(`Backfilled ${users.length} profile(s) and default settings.`);
}

main()
  .catch((error: unknown) => {
    console.error("Profile backfill failed.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
