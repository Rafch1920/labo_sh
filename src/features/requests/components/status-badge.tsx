import type { RequestStatus } from "@/types/enums";

const statusLabels: Record<RequestStatus, string> = {
  DRAFT: "Brouillon",
  REQUEST_SUBMITTED: "Soumise",
  STONE_IN_TRANSIT: "En transit",
  STONE_RECEIVED: "Reçue",
  DOCUMENTS_UNDER_REVIEW: "Documents en vérification",
  INCOMPLETE_DOSSIER: "Dossier incomplet",
  DOSSIER_VALIDATED: "Dossier validé",
  ANALYSIS_IN_PROGRESS: "Analyse en cours",
  ANALYSIS_COMPLETED: "Analyse terminée",
  REPORT_IN_PREPARATION: "Rapport en préparation",
  PENDING_DOCTOR_VALIDATION: "En attente du médecin",
  REPORT_REJECTED: "Rapport rejeté",
  REPORT_VALIDATED: "Rapport validé",
  RESULT_READY: "Résultat disponible",
  APPOINTMENT_SCHEDULED: "Rendez-vous planifié",
  REPORT_COLLECTED: "Rapport récupéré",
};

const statusVariants: Record<RequestStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  REQUEST_SUBMITTED: "bg-blue-100 text-blue-700",
  STONE_IN_TRANSIT: "bg-yellow-100 text-yellow-700",
  STONE_RECEIVED: "bg-indigo-100 text-indigo-700",
  DOCUMENTS_UNDER_REVIEW: "bg-purple-100 text-purple-700",
  INCOMPLETE_DOSSIER: "bg-orange-100 text-orange-700",
  DOSSIER_VALIDATED: "bg-teal-100 text-teal-700",
  ANALYSIS_IN_PROGRESS: "bg-cyan-100 text-cyan-700",
  ANALYSIS_COMPLETED: "bg-green-100 text-green-700",
  REPORT_IN_PREPARATION: "bg-sky-100 text-sky-700",
  PENDING_DOCTOR_VALIDATION: "bg-violet-100 text-violet-700",
  REPORT_REJECTED: "bg-red-100 text-red-700",
  REPORT_VALIDATED: "bg-emerald-100 text-emerald-700",
  RESULT_READY: "bg-lime-100 text-lime-700",
  APPOINTMENT_SCHEDULED: "bg-amber-100 text-amber-700",
  REPORT_COLLECTED: "bg-green-200 text-green-800",
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusVariants[status] ?? "bg-gray-100 text-gray-700"}`}
    >
      {statusLabels[status] ?? status}
    </span>
  );
}
