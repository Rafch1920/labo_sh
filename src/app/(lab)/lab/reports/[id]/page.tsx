import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/helpers";
import { ROLES } from "@/config/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { StatusBadge } from "@/features/requests/components/status-badge";
import Link from "next/link";
import { FileText, ArrowLeft, User, Calendar } from "lucide-react";

export default async function LabReportPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  await requireRole([ROLES.LAB_ADMIN, ROLES.SUPER_ADMIN]);
  const supabase = createAdminClient();

  const { data: request } = await supabase
    .from("analysis_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (!request) notFound();

  return (
    <div className="space-y-8">
      <Link
        href="/lab/reports"
        className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux comptes-rendus
      </Link>

      <div className="flex items-center gap-3 animate-fade-in-up">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-teal-900">Rapport #{id.slice(0, 8)}</h1>
          <p className="text-sm text-teal-600/70">Détails du compte-rendu d&apos;analyse</p>
        </div>
      </div>

      <div className="rounded-2xl border border-teal-100/60 bg-white/70 backdrop-blur-sm p-6 shadow-lg animate-fade-in-up-delay-1"
        style={{ boxShadow: "0 4px 24px rgba(13,148,136,0.06)" }}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center">
              <User className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <p className="text-xs text-teal-500 uppercase tracking-wider font-medium">Patient</p>
              <p className="text-sm font-medium text-teal-900">
                {request.patient_first_name} {request.patient_last_name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <p className="text-xs text-teal-500 uppercase tracking-wider font-medium">Date</p>
              <p className="text-sm font-medium text-teal-900">
                {new Date(request.created_at).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center">
              <FileText className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <p className="text-xs text-teal-500 uppercase tracking-wider font-medium">Statut</p>
              <StatusBadge status={request.status} />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-teal-100/60 bg-white/70 backdrop-blur-sm p-6 shadow-lg animate-fade-in-up-delay-2"
        style={{ boxShadow: "0 4px 24px rgba(13,148,136,0.06)" }}
      >
        <Link
          href={`/lab/requests/${id}`}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 shadow-md shadow-teal-600/20 hover:shadow-lg hover:shadow-teal-600/30 transition-all"
        >
          <FileText className="w-4 h-4" />
          Voir la demande complète
        </Link>
      </div>
    </div>
  );
}
