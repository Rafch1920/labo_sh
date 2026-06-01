import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/helpers";
import { ROLES } from "@/config/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { StatusBadge } from "@/features/requests/components/status-badge";
import { LabWorkflowPanel } from "@/features/requests/components/lab-workflow-panel";
import { DocumentReviewPanel } from "@/features/requests/components/document-review-panel";
import { ReportUploadPanel } from "@/features/requests/components/report-upload-panel";
import { SendReportPanel } from "@/features/requests/components/send-report-panel";
import { HistoryTimeline } from "@/features/requests/components/history-timeline";
import { docLabel } from "@/lib/doc-labels";
import Link from "next/link";
import { ArrowLeft, User, Calendar, Phone, MapPin, Stethoscope, Mail, FileText, Activity } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LabRequestDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  await requireRole([ROLES.LAB_ADMIN, ROLES.SUPER_ADMIN]);
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

  const { data: statusHistory } = await supabase
    .from("status_history")
    .select("*, profiles:changed_by(full_name)")
    .eq("request_id", id)
    .order("created_at", { ascending: true });

  const { data: doctors } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "doctor");

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Back link */}
      <Link
        href="/lab/queue"
        className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour à la file d&apos;attente
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-teal-900">Demande #{id.slice(0, 8)}</h1>
            <p className="text-sm text-teal-600/70">
              Créée le {new Date(request.created_at).toLocaleDateString("fr-FR")}
              {" par "}{request.patient_first_name} {request.patient_last_name}
            </p>
          </div>
        </div>
        <StatusBadge status={request.status} />
      </div>

      {/* Workflow panel */}
      <div className="animate-fade-in-up-delay-1">
        <LabWorkflowPanel
          requestId={request.id}
          status={request.status}
          assignedLabAdminId={request.assigned_lab_admin_id}
          doctors={doctors?.map((d) => ({ id: d.id, name: d.full_name })) ?? []}
        />
      </div>

      {/* Document review / Documents display */}
      {request.status === "STONE_RECEIVED" || request.status === "DOCUMENTS_UNDER_REVIEW" || request.status === "INCOMPLETE_DOSSIER" ? (
        <div className="animate-fade-in-up-delay-1">
          <DocumentReviewPanel requestId={request.id} documents={docsWithUrls} />
        </div>
      ) : docsWithUrls.length > 0 && (
        <div
          className="rounded-2xl border border-teal-100/60 bg-white/70 backdrop-blur-sm p-6 shadow-lg animate-fade-in-up-delay-1"
          style={{ boxShadow: "0 4px 24px rgba(13,148,136,0.06)" }}
        >
          <h3 className="font-semibold text-teal-900 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-600" />
            Documents ({docsWithUrls.length})
          </h3>
          <div className="divide-y divide-teal-50">
            {docsWithUrls.map((doc) => (
              <div key={doc.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-teal-900">
                    {docLabel(doc.file_category, doc.file_path)}
                    <span className="text-teal-500 font-normal"> — {doc.file_name}</span>
                  </p>
                  <p className="text-sm text-teal-500">
                    {(doc.file_size_bytes / 1024).toFixed(1)} Ko
                    {" — "}
                    {doc.is_verified ? (
                      <span className="text-emerald-600 font-medium">Vérifié</span>
                    ) : doc.rejection_reason ? (
                      <span className="text-rose-600 font-medium">Refusé</span>
                    ) : (
                      <span className="text-amber-600 font-medium">Non vérifié</span>
                    )}
                  </p>
                </div>
                {doc.public_url && (
                  <a
                    href={doc.public_url}
                    target="_blank"
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors"
                  >
                    Voir
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Patient & Physician info */}
      <div className="grid gap-5 md:grid-cols-2 animate-fade-in-up-delay-2">
        <div
          className="rounded-2xl border border-teal-100/60 bg-white/70 backdrop-blur-sm p-6 shadow-lg"
          style={{ boxShadow: "0 4px 24px rgba(13,148,136,0.06)" }}
        >
          <h3 className="font-semibold text-teal-900 mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-teal-600" />
            Patient
          </h3>
          <div className="space-y-3">
            <InfoRow icon={Activity} label="Nom" value={`${request.patient_first_name} ${request.patient_last_name}`} />
            <InfoRow icon={Calendar} label="Date de naissance" value={new Date(request.patient_dob).toLocaleDateString("fr-FR")} />
            <InfoRow icon={User} label="Sexe" value={request.patient_gender === "male" ? "Homme" : "Femme"} />
            {request.patient_phone && <InfoRow icon={Phone} label="Téléphone" value={request.patient_phone} />}
            {request.patient_address && <InfoRow icon={MapPin} label="Adresse" value={request.patient_address} />}
          </div>
        </div>
        <div
          className="rounded-2xl border border-teal-100/60 bg-white/70 backdrop-blur-sm p-6 shadow-lg"
          style={{ boxShadow: "0 4px 24px rgba(13,148,136,0.06)" }}
        >
          <h3 className="font-semibold text-teal-900 mb-4 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-teal-600" />
            Médecin prescripteur
          </h3>
          <div className="space-y-3">
            <InfoRow icon={User} label="Nom" value={request.physician_name} />
            {request.physician_phone && <InfoRow icon={Phone} label="Téléphone" value={request.physician_phone} />}
            {request.physician_email && <InfoRow icon={Mail} label="Email" value={request.physician_email} />}
          </div>
        </div>
      </div>

      {/* Medical remarks */}
      {request.medical_remarks && (
        <div
          className="rounded-2xl border border-teal-100/60 bg-white/70 backdrop-blur-sm p-6 shadow-lg animate-fade-in-up-delay-2"
          style={{ boxShadow: "0 4px 24px rgba(13,148,136,0.06)" }}
        >
          <h3 className="font-semibold text-teal-900 mb-2">Remarques médicales</h3>
          <p className="text-sm text-teal-700 whitespace-pre-wrap">{request.medical_remarks}</p>
        </div>
      )}

      {/* Report upload */}
      {request.status === "REPORT_IN_PREPARATION" && (
        <div className="animate-fade-in-up-delay-2">
          <ReportUploadPanel requestId={request.id} hasExistingReport={false} />
        </div>
      )}

      {/* Send report to patient */}
      {request.status === "REPORT_VALIDATED" && (
        <div className="animate-fade-in-up-delay-2">
          <SendReportPanel requestId={request.id} />
        </div>
      )}

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
      <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-teal-500" />
      </div>
      <div>
        <p className="text-[11px] text-teal-500 uppercase tracking-wider font-medium">{label}</p>
        <p className="text-sm text-teal-900">{value}</p>
      </div>
    </div>
  );
}
