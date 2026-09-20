import { prisma } from "../src/lib/prisma";
import { createClient } from "@supabase/supabase-js";

async function main() {
  console.log("---------------------------------------------");
  console.log("Testing Supabase Connection...");
  console.log("---------------------------------------------");

  // 1. Test Supabase Auth / REST API
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("placeholder") || supabaseUrl.includes("example")) {
    console.log("⚠️  Supabase Auth API: NEXT_PUBLIC_SUPABASE_URL or ANON_KEY has placeholder values in .env");
  } else {
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.log("❌ Supabase Auth API Error:", error.message);
      } else {
        console.log("✅ Supabase Auth API: Connected successfully! (URL:", supabaseUrl, ")");
      }
    } catch (err: any) {
      console.log("❌ Supabase Auth API Connection failed:", err.message);
    }
  }

  // 2. Test Prisma Database Connection
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || dbUrl.includes("localhost") || dbUrl.includes("[YOUR-PASSWORD]")) {
    console.log("⚠️  Prisma PostgreSQL: DATABASE_URL still has localhost or placeholder values in .env");
  } else {
    try {
      const result: any = await prisma.$queryRaw`SELECT current_database(), current_user, count(*)::int as table_count FROM information_schema.tables WHERE table_schema = 'public'`;
      console.log("✅ Prisma PostgreSQL: Connected successfully!");
      console.log("   Database:", result[0]?.current_database);
      console.log("   User:", result[0]?.current_user);
      console.log("   Public Tables Detected:", result[0]?.table_count);
    } catch (err: any) {
      console.log("❌ Prisma PostgreSQL Connection failed:", err.message);
    }
  }

  console.log("---------------------------------------------");
  await prisma.$disconnect();
}

main();
