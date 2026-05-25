import { requireRole } from "@/lib/auth/helpers";
import { ROLES } from "@/config/roles";

export default function AdminConfigPage() {
  requireRole([ROLES.SUPER_ADMIN]);
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Configuration</h1>
    </div>
  );
}
