import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const cookieNames = request.cookies.getAll().map((c) => c.name);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {},
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return NextResponse.json({
    cookies: cookieNames,
    hasUser: !!user,
    userId: user?.id ?? null,
    userEmail: user?.email ?? null,
    userRole: user?.role ?? null,
    appMetadata: user?.app_metadata ?? null,
    profile,
  });
}
