import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/helpers";
import { ROLES } from "@/config/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { StatusBadge } from "@/features/requests/components/status-badge";
import { DoctorReviewPanel } from "@/features/appointments/components/doctor-review-panel";
import { HistoryTimeline } from "@/features/requests/components/history-timeline";
import Link from "next/link";
import { ArrowLeft, User, Calendar, Stethoscope, Mail, Activity, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DoctorRequestDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  await requireRole([ROLES.DOCTOR, ROLES.SUPER_ADMIN]);
  const supabase = createAdminClient();

  const { data: request } = await supabase
    .from("analysis_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (!request) notFound();

  const { data: documents } = await supabase
    .from("request_documents")
    .select("*")
    .eq("request_id", id);

  const docsWithUrls = await Promise.all(
    (documents ?? []).map(async (doc) => {
      const { data: urlData } = await supabase.storage
        .from("request-documents")
        .createSignedUrl(doc.file_path, 3600);
      return { ...doc, public_url: urlData?.signedUrl ?? "" };
    })
  );

  const patientUserId = request.user_id;
  const patientDocs = docsWithUrls.filter((d) => d.uploaded_by === patientUserId);
  const reportDocs = docsWithUrls.filter((d) => d.uploaded_by !== patientUserId);

  const { data: statusHistory } = await supabase
    .from("status_history")
    .select("*, profiles:changed_by(full_name)")
    .eq("request_id", id)
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-8">
      <Link
        href="/doctor/validations"
        className="inline-flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux validations
      </Link>

      <div className="flex items-start justify-between gap-4 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-violet-900">Validation #{id.slice(0, 8)}</h1>
            <p className="text-sm text-violet-600/70">
              {request.patient_first_name} {request.patient_last_name}
            </p>
          </div>
        </div>
        <StatusBadge status={request.status} />
      </div>

      {/* Patient & Prescriber info */}
      <div className="grid gap-5 md:grid-cols-2 animate-fade-in-up-delay-1">
        <div
          className="rounded-2xl border border-violet-100/60 bg-white/70 backdrop-blur-sm p-5 shadow-lg"
          style={{ boxShadow: "0 4px 24px rgba(139,92,246,0.06)" }}
        >
          <h3 className="font-semibold text-violet-900 mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-violet-600" />
            Patient
          </h3>
          <div className="space-y-2.5">
            <InfoRow icon={Activity} label="Nom" value={`${request.patient_first_name} ${request.patient_last_name}`} />
            <InfoRow icon={Calendar} label="Date de naissance" value={new Date(request.patient_dob).toLocaleDateString("fr-FR")} />
            <InfoRow icon={User} label="Sexe" value={request.patient_gender === "male" ? "Homme" : "Femme"} />
          </div>
        </div>
        <div
          className="rounded-2xl border border-violet-100/60 bg-white/70 backdrop-blur-sm p-5 shadow-lg"
          style={{ boxShadow: "0 4px 24px rgba(139,92,246,0.06)" }}
        >
          <h3 className="font-semibold text-violet-900 mb-3 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-violet-600" />
            Prescripteur
          </h3>
          <div className="space-y-2.5">
            <InfoRow icon={User} label="Nom" value={request.physician_name} />
            {request.physician_email && <InfoRow icon={Mail} label="Email" value={request.physician_email} />}
          </div>
        </div>
      </div>

      {/* Medical remarks */}
      {request.medical_remarks && (
        <div
          className="rounded-2xl border border-violet-100/60 bg-white/70 backdrop-blur-sm p-5 shadow-lg animate-fade-in-up-delay-1"
          style={{ boxShadow: "0 4px 24px rgba(139,92,246,0.06)" }}
        >
          <h3 className="font-semibold text-violet-900 mb-2">Remarques médicales</h3>
          <p className="text-sm text-violet-700 whitespace-pre-wrap">{request.medical_remarks}</p>
        </div>
      )}

      {/* Review panel */}
      <div className="animate-fade-in-up-delay-2">
        <DoctorReviewPanel
          requestId={request.id}
          patientDocs={patientDocs}
          reportDocs={reportDocs}
        />
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

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-violet-500" />
      </div>
      <div>
        <p className="text-[11px] text-violet-500 uppercase tracking-wider font-medium">{label}</p>
        <p className="text-sm text-violet-900">{value}</p>
      </div>
    </div>
  );
}
