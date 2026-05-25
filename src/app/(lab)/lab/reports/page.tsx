import { requireRole } from "@/lib/auth/helpers";
import { ROLES } from "@/config/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { StatusBadge } from "@/features/requests/components/status-badge";
import Link from "next/link";
import { FileText, ArrowRight, FileSearch, Clock, CheckCircle2, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LabReportsPage() {
  await requireRole([ROLES.LAB_ADMIN, ROLES.SUPER_ADMIN]);
  const supabase = createAdminClient();

  const { data: requests, error } = await supabase
    .from("analysis_requests")
    .select("*")
    .neq("status", "DRAFT")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-rose-900">Erreur</h1>
            <p className="text-sm text-rose-600">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  const reportStatuses = ["REPORT_IN_PREPARATION", "PENDING_DOCTOR_VALIDATION", "REPORT_COLLECTED", "REPORT_REJECTED"];
  const reports = requests?.filter((r) => reportStatuses.includes(r.status)) ?? [];

  const inPrep = reports.filter((r) => r.status === "REPORT_IN_PREPARATION").length;
  const pendingVal = reports.filter((r) => r.status === "PENDING_DOCTOR_VALIDATION").length;
  const completed = reports.filter((r) => r.status === "REPORT_COLLECTED").length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-teal-900">Comptes-rendus</h1>
            <p className="text-sm text-teal-600/70">Suivez l&apos;avancement des rapports d&apos;analyse</p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3 animate-fade-in-up-delay-1">
        <MiniStat icon={Clock} label="En préparation" value={inPrep} color="amber" />
        <MiniStat icon={CheckCircle2} label="En validation" value={pendingVal} color="violet" />
        <MiniStat icon={FileText} label="Terminés" value={completed} color="teal" />
      </div>

      <div
        className="rounded-2xl border border-teal-100/60 bg-white/70 backdrop-blur-sm shadow-lg shadow-teal-500/5 overflow-hidden animate-fade-in-up-delay-2"
        style={{
          boxShadow: "0 4px 24px rgba(13,148,136,0.06), 0 1px 4px rgba(13,148,136,0.04)",
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-teal-100/40 bg-teal-50/40">
                {["Patient", "Date", "Statut", ""].map((h) => (
                  <th key={h} className="text-left px-6 py-3.5 font-semibold text-teal-700 text-xs uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-teal-50">
              {reports.map((req, i) => (
                <tr
                  key={req.id}
                  className="group hover:bg-teal-50/40 transition-colors"
                  style={{ animation: `fade-in-up 0.4s ease-out ${i * 0.03}s both` }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-[11px] font-semibold text-white shadow-sm">
                        {(req.patient_first_name?.charAt(0) || "?").toUpperCase()}
                        {(req.patient_last_name?.charAt(0) || "").toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-teal-900">
                          {req.patient_first_name} {req.patient_last_name}
                        </p>
                        <p className="text-xs text-teal-500">
                          {req.patient_email || "—"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-teal-600 whitespace-nowrap">
                    {new Date(req.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/lab/reports/${req.id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 shadow-md shadow-teal-600/20 hover:shadow-lg hover:shadow-teal-600/30 transition-all"
                    >
                      Voir
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr>
                  <td colSpan={4}>
                    <div className="py-16 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto mb-4">
                        <FileSearch className="w-8 h-8 text-teal-300" />
                      </div>
                      <p className="text-teal-700 font-medium">Aucun rapport</p>
                      <p className="text-sm text-teal-500 mt-1">
                        Aucun compte-rendu disponible pour le moment.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: "amber" | "violet" | "teal";
}) {
  const colorMap = {
    amber: { icon: "bg-amber-100", iconText: "text-amber-600", text: "text-amber-700" },
    violet: { icon: "bg-violet-100", iconText: "text-violet-600", text: "text-violet-700" },
    teal: { icon: "bg-teal-100", iconText: "text-teal-600", text: "text-teal-700" },
  };
  const c = colorMap[color];
  return (
    <div className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur-sm p-5 transition-all duration-300 hover:-translate-y-0.5 group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-teal-600/70">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${c.text}`}>{value}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl ${c.icon} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
          <Icon className={`w-5 h-5 ${c.iconText}`} />
        </div>
      </div>
    </div>
  );
}
