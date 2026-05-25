import { requireRole } from "@/lib/auth/helpers";
import { ROLES } from "@/config/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { StatusBadge } from "@/features/requests/components/status-badge";
import Link from "next/link";
import { ClipboardList, ArrowRight, FileSearch } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LabRequestsPage() {
  await requireRole([ROLES.LAB_ADMIN, ROLES.SUPER_ADMIN]);
  const supabase = createAdminClient();

  const { data: requests, error } = await supabase
    .from("analysis_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
            <ClipboardList className="w-4 h-4 text-rose-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-rose-900">Erreur de chargement</h1>
            <p className="text-sm text-rose-600">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <FileSearch className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-teal-900">Demandes</h1>
            <p className="text-sm text-teal-600/70">Toutes les demandes d&apos;analyse</p>
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200/50 text-sm text-teal-700 font-medium">
          {requests?.length ?? 0} demande{(requests?.length ?? 0) > 1 ? "s" : ""}
        </div>
      </div>

      <div
        className="rounded-2xl border border-teal-100/60 bg-white/70 backdrop-blur-sm shadow-lg shadow-teal-500/5 overflow-hidden animate-fade-in-up-delay-1"
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
              {requests?.map((req, i) => (
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
                      href={`/lab/requests/${req.id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 shadow-md shadow-teal-600/20 hover:shadow-lg hover:shadow-teal-600/30 transition-all"
                    >
                      Voir
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
              {(!requests || requests.length === 0) && (
                <tr>
                  <td colSpan={4}>
                    <div className="py-16 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto mb-4">
                        <ClipboardList className="w-8 h-8 text-teal-300" />
                      </div>
                      <p className="text-teal-700 font-medium">Aucune demande</p>
                      <p className="text-sm text-teal-500 mt-1">
                        Aucune demande d&apos;analyse pour le moment.
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
