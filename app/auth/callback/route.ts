import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createSupabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Read intended role from cookies, searchParams or user metadata
        const cookieRole = request.cookies.get("user_role")?.value;
        const queryRole = searchParams.get("role");
        const metaRole = user.user_metadata?.role;

        let intendedRole = cookieRole || queryRole || metaRole || "customer";

        // Normalize role
        let dbRole = intendedRole === "owner" ? "owner" : "consumer";

        // Check profiles table
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (!profile) {
          // Create profile
          await supabase.from("profiles").insert({
            id: user.id,
            role: dbRole,
            full_name:
              user.user_metadata.full_name ||
              user.email?.split("@")[0] ||
              "User",
          });
        } else {
          // If user explicitly chose "owner" but profile says "consumer", promote them
          if (intendedRole === "owner" && profile.role !== "owner") {
            await supabase
              .from("profiles")
              .update({ role: "owner" })
              .eq("id", user.id);
            dbRole = "owner";
          } else {
            dbRole = profile.role;
          }
        }

        // Route based on role
        let redirectUrl = `${origin}/explore`;
        if (dbRole === "owner") {
          const { data: business } = await supabase
            .from("businesses")
            .select("id")
            .eq("owner_id", user.id)
            .single();

          redirectUrl = business
            ? `${origin}/admin`
            : `${origin}/onboarding`;
        }

        const response = NextResponse.redirect(redirectUrl);
        response.cookies.delete("user_role");
        return response;
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
