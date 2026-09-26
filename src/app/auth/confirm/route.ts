import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureProfileAndSettings } from "@/lib/profile-bootstrap";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  // Prevent open redirect vulnerabilities
  const safeRedirectPath = next.startsWith("/") ? next : "/dashboard";

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.id && user?.email) {
        await ensureProfileAndSettings({
          userId: user.id,
          email: user.email,
        });
      }

      return NextResponse.redirect(new URL(safeRedirectPath, request.url));
    }
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.id && user?.email) {
        await ensureProfileAndSettings({
          userId: user.id,
          email: user.email,
        });
      }

      return NextResponse.redirect(new URL(safeRedirectPath, request.url));
    }
  }

  return NextResponse.redirect(
    new URL("/login?error=verification_failed", request.url)
  );
}
