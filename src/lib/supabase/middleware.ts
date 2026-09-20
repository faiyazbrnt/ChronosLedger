import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Always use getUser() instead of getSession() for security
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/verify-email");

  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/dtr") ||
    pathname.startsWith("/budget") ||
    pathname.startsWith("/settings");

  // Helper to copy refreshed session cookies to the redirect response
  const createRedirect = (url: URL) => {
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  };

  // 1. Unauthenticated user trying to access a protected route
  if (!user && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);
    return createRedirect(loginUrl);
  }

  // 2. Authenticated user handling
  if (user) {
    const isConfirmed = Boolean(user.email_confirmed_at);

    // If unconfirmed and attempting protected routes, send to verify-email
    if (!isConfirmed && isProtectedRoute) {
      const verifyUrl = new URL("/verify-email", request.url);
      if (user.email) {
        verifyUrl.searchParams.set("email", user.email);
      }
      return createRedirect(verifyUrl);
    }

    // If confirmed and attempting auth pages, send to dashboard
    if (isConfirmed && isAuthRoute) {
      const dashboardUrl = new URL("/dashboard", request.url);
      return createRedirect(dashboardUrl);
    }
  }

  return supabaseResponse;
}
