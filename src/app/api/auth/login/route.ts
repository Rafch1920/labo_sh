import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { Role } from "@/config/roles";
import { ROLE_ROUTES } from "@/config/roles";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  const pendingCookies: { name: string; value: string; options?: Record<string, unknown> }[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const cookie of cookiesToSet) {
            request.cookies.set(cookie.name, cookie.value);
            pendingCookies.push(cookie);
          }
        },
      },
    }
  );

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let redirectUrl = "/patient/dashboard";
  if (user) {
    console.log("User found:", user.id, user.email);
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: existingProfile, error: queryError } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    console.log("Profile query result:", existingProfile, queryError?.message);

    let profile = existingProfile;
    if (!profile) {
      const { error: insertError } = await adminClient.from("profiles").insert({
        id: user.id,
        email: user.email ?? email,
        full_name: user.user_metadata?.full_name ?? email,
        role: "patient",
      });
      console.log("Profile insert result:", insertError?.message ?? "success");

      const { data: newProfile } = await adminClient
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      profile = newProfile;
    }

    // Sync role from DB to auth metadata if out of sync
    const dbRole = profile?.role;
    const currentMetaRole = user.app_metadata?.role;
    if (dbRole && dbRole !== currentMetaRole) {
      console.log("Syncing auth metadata role:", dbRole);
      await adminClient.auth.admin.updateUserById(user.id, {
        app_metadata: { ...user.app_metadata, role: dbRole },
      });
    }

    const role = (dbRole as Role) ?? undefined;
    console.log("Role found:", role);
    console.log("Redirect URL target:", role && ROLE_ROUTES[role] ? ROLE_ROUTES[role] : "/patient/dashboard");
    if (role && ROLE_ROUTES[role]) {
      redirectUrl = ROLE_ROUTES[role];
    }
  }

  console.log("pendingCookies count:", pendingCookies.length);

  const res = NextResponse.json({ redirect: redirectUrl });
  for (const { name, value, options } of pendingCookies) {
    res.cookies.set(name, value, options);
  }
  return res;
}
