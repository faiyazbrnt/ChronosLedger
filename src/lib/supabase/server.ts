import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase public environment variables");
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  });
}

export interface AuthUser {
  id: string;
  email: string;
}

/**
 * Fast user resolution for Server Components.
 * Reads the cryptographically verified user identity forwarded by middleware headers (0ms, zero network calls),
 * and safely falls back to remote supabase.auth.getUser() if headers are absent.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const headerList = await headers();
    const userId = headerList.get("x-user-id");
    const userEmail = headerList.get("x-user-email");

    if (userId) {
      return {
        id: userId,
        email: userEmail ?? "",
      };
    }
  } catch {
    // headers() might not be available in non-request contexts
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email ?? "",
  };
}
