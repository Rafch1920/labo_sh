import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { StatusBadge } from "@/features/requests/components/status-badge";
import { RequestTimer } from "@/features/requests/components/request-timer";
import { DocumentCorrectionPanel } from "@/features/requests/components/document-correction-panel";
import { RequestPathFull } from "@/features/requests/components/request-path";
import { docLabel } from "@/lib/doc-labels";
import Link from "next/link";
import {
  ChevronLeft,
  User,
  Stethoscope,
  FileText,
  Clock,
  Download,
  Calendar,
  Activity,
  Droplets,
  AlertTriangle,
} from "lucide-react";

export default async function RequestDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: request } = await supabase
    .from("analysis_requests")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!request) notFound();

  const { data: statusHistory } = await supabase
    .from("status_history")
    .select("*, profiles:changed_by(full_name)")
    .eq("request_id", id)
    .order("created_at", { ascending: true });

  const { data: documents } = await supabase
    .from("request_documents")
    .select("*")
    .eq("request_id", id);

  const admin = createAdminClient();
  const docsWithUrls = await Promise.all(
    (documents ?? []).map(async (doc) => {
      const { data } = await admin.storage
        .from("request-documents")
        .createSignedUrl(doc.file_path, 3600);
      return { ...doc, public_url: data?.signedUrl ?? "" };
    })
  );

  const rejectedDocs = (documents ?? []).filter(
    (d) => d.rejection_reason != null && !d.is_verified
  );

  const correctionDocs = (documents ?? []).filter((d) => !d.is_verified);

  const reportDoc = docsWithUrls.find((d) => d.file_category === "medical_report");
  const reportUrl = reportDoc?.public_url ?? "";

  const needsCorrection = request.status === "INCOMPLETE_DOSSIER" && correctionDocs.length > 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/patient/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-[#1e3a5f] transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Retour au tableau de bord
      </Link>

      {needsCorrection && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <p className="font-semibold text-amber-900">Documents à corriger</p>
              <p className="text-sm text-amber-700/70 mt-0.5">
                Certains documents de votre dossier ont été refusés par le laboratoire.
                Remplacez-les ci-dessous pour que la vérification puisse continuer.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-[#1e3a5f] p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-2 text-blue-200/60 text-xs font-medium uppercase tracking-widest mb-3">
            <Droplets className="w-3.5 h-3.5 text-blue-300" />
            Marrakchi LAB — Lithiase rénale
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Demande #{id.slice(0, 8)}
              </h1>
              <p className="text-blue-200/60 text-sm mt-1">
                Créée le{" "}
                {new Date(request.created_at).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <StatusBadge status={request.status} />
          </div>
        </div>
      </div>

      {/* Result ready */}
      {request.status === "RESULT_READY" && (
        <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="p-3 rounded-xl bg-emerald-100">
                <Download className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <p className="font-medium text-emerald-900">Résultat disponible</p>
                <p className="text-sm text-emerald-700/60">
                  Téléchargez votre rapport ou prenez rendez-vous.
                </p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              {reportUrl ? (
                <Link
                  href={reportUrl}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1e3a5f] text-white text-sm font-medium hover:bg-[#2a4a73] transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Rapport
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-100 text-stone-400 text-sm font-medium cursor-not-allowed">
                  <Download className="w-3.5 h-3.5" />
                  Rapport
                </span>
              )}
              <Link
                href="/patient/appointments"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-emerald-200 text-emerald-700 text-sm font-medium hover:bg-emerald-100 transition-all"
              >
                <Calendar className="w-3.5 h-3.5" />
                Rendez-vous
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Timer + edit/delete — editable within 4h */}
      {["DRAFT", "REQUEST_SUBMITTED"].includes(request.status) && (
        <RequestTimer requestId={id} createdAt={request.created_at} />
      )}

      {/* Document correction panel */}
      {request.status === "INCOMPLETE_DOSSIER" && (
        <DocumentCorrectionPanel requestId={id} rejectedDocs={rejectedDocs.length > 0 ? rejectedDocs : correctionDocs} />
      )}

      {/* Request path */}
      <RequestPathFull status={request.status} />

      {/* Info cards */}
      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 bg-white p-6 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-stone-400">
            <User className="w-4 h-4 text-blue-500" />
            Patient
          </div>
          <div>
            <p className="text-[#1e3a5f] font-semibold">
              {request.patient_first_name} {request.patient_last_name}
            </p>
            <p className="text-sm text-stone-500 mt-0.5">
              Né(e) le{" "}
              {new Date(request.patient_dob).toLocaleDateString("fr-FR")}
            </p>
          </div>
          {request.patient_phone && (
            <p className="text-sm text-stone-500">{request.patient_phone}</p>
          )}
          {request.patient_address && (
            <p className="text-sm text-stone-400">{request.patient_address}</p>
          )}
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-6 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-stone-400">
            <Stethoscope className="w-4 h-4 text-stone-500" />
            Médecin prescripteur
          </div>
          <p className="text-[#1e3a5f] font-semibold">{request.physician_name}</p>
          {request.physician_email && (
            <p className="text-sm text-stone-500">{request.physician_email}</p>
          )}
          {request.physician_phone && (
            <p className="text-sm text-stone-500">{request.physician_phone}</p>
          )}
          {request.physician_address && (
            <p className="text-sm text-stone-400">{request.physician_address}</p>
          )}
        </div>
      </div>

      {request.medical_remarks && (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-stone-400">
            <FileText className="w-4 h-4 text-stone-500" />
            Remarques médicales
          </div>
          <p className="text-sm text-stone-600 whitespace-pre-wrap leading-relaxed">
            {request.medical_remarks}
          </p>
        </div>
      )}

      {docsWithUrls.length > 0 && (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-stone-400">
            <FileText className="w-4 h-4 text-stone-500" />
            Documents <span className="text-stone-300">({docsWithUrls.length})</span>
          </div>
          <div className="divide-y divide-stone-100">
            {docsWithUrls.map((doc) => (
              <div key={doc.id} className="group relative flex items-center justify-between py-3 hover:bg-stone-50/50 transition-colors px-2 -mx-2 rounded-lg">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-1.5 rounded-lg bg-blue-50 shrink-0">
                    {doc.public_url.match(/\.(png|jpe?g|gif|webp)$/i) ? (
                      <img src={doc.public_url} alt="" className="w-5 h-5 rounded object-cover" />
                    ) : (
                      <Activity className="w-3.5 h-3.5 text-blue-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-stone-700">
                      {docLabel(doc.file_category, doc.file_path)}
                      <span className="text-stone-400 font-normal">
                        {" "}— {doc.file_name}
                      </span>
                    </p>
                    {doc.rejection_reason && (
                      <p className="text-xs text-red-500 mt-0.5">
                        Motif : {doc.rejection_reason}
                      </p>
                    )}
                  </div>
                </div>
                <span
                  className={`text-xs shrink-0 font-medium ${
                    doc.is_verified
                      ? "text-emerald-600"
                      : doc.rejection_reason
                        ? "text-red-500"
                        : "text-blue-600"
                  }`}
                >
                  {doc.is_verified
                    ? "Vérifié"
                    : doc.rejection_reason
                      ? "Rejeté"
                      : "En attente"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {statusHistory && statusHistory.length > 0 && (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-stone-400">
            <Clock className="w-4 h-4 text-stone-500" />
            Historique
          </div>
          <div className="relative">
            <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-blue-200" />
            <div className="space-y-5">
              {statusHistory.map((entry) => (
                <div key={entry.id} className="flex items-start gap-4 pl-1">
                  <div className="w-[15px] h-[15px] rounded-full bg-white border-2 border-blue-400 shrink-0 mt-0.5 relative z-10" />
                  <div className="min-w-0">
                    <StatusBadge status={entry.to_status} />
                    <p className="text-xs text-stone-400 mt-1">
                      {new Date(entry.created_at).toLocaleString("fr-FR")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
