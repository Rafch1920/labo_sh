import { requireRole } from "@/lib/auth/helpers";
import { ROLES } from "@/config/roles";

export default function AdminAuditLogsPage() {
  requireRole([ROLES.SUPER_ADMIN]);
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Journal d&apos;audit</h1>
    </div>
  );
}
