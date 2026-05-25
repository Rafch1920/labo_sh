import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/helpers";
import { ROLES } from "@/config/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { StatusBadge } from "@/features/requests/components/status-badge";
import Link from "next/link";
import { HistoryTimeline } from "@/features/requests/components/history-timeline";
import { ScanQrCode, FileText, User, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminTrackPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  await requireRole([ROLES.SUPER_ADMIN, ROLES.LAB_ADMIN]);
  const supabase = createAdminClient();

  const { data: request } = await supabase
    .from("analysis_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (!request) notFound();

  const { data: statusHistory } = await supabase
    .from("status_history")
    .select("*, profiles:changed_by(full_name)")
    .eq("request_id", id)
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 animate-fade-in-up">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <ScanQrCode className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Suivi de demande</h1>
          <p className="text-sm text-stone-600/70">
            Demande #{id.slice(0, 8)} — {request.patient_first_name} {request.patient_last_name}
          </p>
        </div>
        <div className="ml-auto">
          <StatusBadge status={request.status} />
        </div>
      </div>

      {/* Patient info */}
      <div
        className="rounded-2xl border border-amber-100/60 bg-white/70 backdrop-blur-sm p-5 shadow-lg animate-fade-in-up-delay-1"
        style={{ boxShadow: "0 4px 24px rgba(217,119,6,0.06)" }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
              <User className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-amber-600 uppercase tracking-wider font-medium">Patient</p>
              <p className="text-sm font-medium text-stone-900">
                {request.patient_first_name} {request.patient_last_name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-amber-600 uppercase tracking-wider font-medium">Créée le</p>
              <p className="text-sm font-medium text-stone-900">
                {new Date(request.created_at).toLocaleDateString("fr-FR", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
              <FileText className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-amber-600 uppercase tracking-wider font-medium">Statut actuel</p>
              <StatusBadge status={request.status} />
            </div>
          </div>
        </div>
      </div>

      {/* QR info */}
      <div
        className="rounded-2xl border border-amber-100/60 bg-amber-50/50 backdrop-blur-sm p-4 shadow-lg animate-fade-in-up-delay-1"
        style={{ boxShadow: "0 4px 24px rgba(217,119,6,0.06)" }}
      >
        <p className="text-xs text-amber-700 flex items-center gap-1.5">
          <ScanQrCode className="w-3.5 h-3.5" />
          Page consultée via le QR code figurant sur le rapport d&apos;analyse.
        </p>
      </div>

      {/* Request actions */}
      <div className="animate-fade-in-up-delay-2">
        <Link
          href={`/admin/users`}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-md shadow-amber-600/20 transition-all"
        >
          <FileText className="w-4 h-4" />
          Voir dans l&apos;administration
        </Link>
      </div>

      {/* History */}
      {statusHistory && statusHistory.length > 0 && (
        <div className="animate-fade-in-up-delay-3">
          <HistoryTimeline
            requestId={request.id}
            history={statusHistory}
            currentStatus={request.status}
          />
        </div>
      )}
    </div>
  );
}
