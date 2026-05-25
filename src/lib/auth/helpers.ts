import { redirect } from "next/navigation";
import type { Role } from "@/config/roles";
import { ROLE_ROUTES } from "@/config/roles";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentUserRole(): Promise<Role | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return (user.app_metadata?.role as Role) ?? (user.user_metadata?.role as Role) ?? null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireRole(allowedRoles: Role[]) {
  const user = await requireAuth();
  const role = await getCurrentUserRole();

  if (!role || !allowedRoles.includes(role)) {
    redirect("/login");
  }

  return { user, role };
}

export async function redirectBasedOnRole() {
  const role = await getCurrentUserRole();
  if (role && ROLE_ROUTES[role]) {
    redirect(ROLE_ROUTES[role]);
  }
  redirect("/login");
}
