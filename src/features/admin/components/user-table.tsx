"use client";

import { useActionState } from "react";
import { updateUserRole } from "@/features/admin/actions";
import { Button } from "@/components/ui/button";
import type { Role } from "@/config/roles";
import { ROLES, ROLE_LABELS } from "@/config/roles";

type UserTableProps = {
  users: {
    id: string;
    email: string;
    full_name: string;
    role: Role;
    created_at: string;
  }[];
};

function RoleSwitcher({ userId, currentRole }: { userId: string; currentRole: Role }) {
  const [state, action, pending] = useActionState(
    (_prev: { error: string | null }, formData: FormData) =>
      updateUserRole(userId, formData.get("role") as string),
    { error: null }
  );

  const roles = [ROLES.PATIENT, ROLES.LAB_ADMIN, ROLES.DOCTOR, ROLES.SUPER_ADMIN];

  return (
    <form action={action} className="flex gap-2 items-center">
      <select
        name="role"
        defaultValue={currentRole}
        className="rounded-md border border-input bg-background px-2 py-1 text-xs"
      >
        {roles.map((r) => (
          <option key={r} value={r}>
            {ROLE_LABELS[r]}
          </option>
        ))}
      </select>
      <Button type="submit" disabled={pending} size="xs" variant="outline">
        {pending ? "..." : "Modifier"}
      </Button>
      {state?.error && <span className="text-xs text-destructive">{state.error}</span>}
    </form>
  );
}

export function AdminUserTable({ users }: UserTableProps) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">Nom</th>
              <th className="text-left p-3 font-medium">Email</th>
              <th className="text-left p-3 font-medium">Rôle</th>
              <th className="text-left p-3 font-medium">Inscrit le</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users?.map((user) => (
              <tr key={user.id} className="hover:bg-muted/50">
                <td className="p-3 font-medium">{user.full_name}</td>
                <td className="p-3 text-muted-foreground">{user.email}</td>
                <td className="p-3">
                  <RoleSwitcher userId={user.id} currentRole={user.role} />
                </td>
                <td className="p-3 text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString("fr-FR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
