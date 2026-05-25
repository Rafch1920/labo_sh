import { requireRole } from "@/lib/auth/helpers";
import { ROLES } from "@/config/roles";
import { AnalyticsDashboard } from "@/features/admin/components/analytics-dashboard";

export const dynamic = "force-dynamic";

export default function AdminAnalyticsPage() {
  requireRole([ROLES.SUPER_ADMIN]);
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytiques</h1>
      <AnalyticsDashboard />
    </div>
  );
}
