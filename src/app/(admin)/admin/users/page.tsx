import { requireRole } from "@/lib/auth/helpers";
import { ROLES } from "@/config/roles";
import { createClient } from "@/lib/supabase/server";
import { AdminUserTable } from "@/features/admin/components/user-table";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await requireRole([ROLES.SUPER_ADMIN]);
  const supabase = await createClient();

  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gestion des utilisateurs</h1>
      <AdminUserTable users={users ?? []} />
    </div>
  );
}
