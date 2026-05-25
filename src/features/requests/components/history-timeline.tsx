"use client";

import { useState } from "react";
import { useActionState } from "react";
import {
  ChevronDown,
  ChevronUp,
  XCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Undo2,
} from "lucide-react";
import { StatusBadge } from "@/features/requests/components/status-badge";
import { revertToStatus } from "@/features/requests/lab-actions";
import type { RequestStatus } from "@/types/enums";

type HistoryEntry = {
  id: string;
  from_status: string | null;
  to_status: string;
  created_at: string;
  profiles: { full_name: string } | null;
};

const STATUS_DESCRIPTIONS: Record<string, string> = {
  DRAFT: "Création de la demande",
  REQUEST_SUBMITTED: "Demande soumise par le patient",
  STONE_IN_TRANSIT: "Calcul en transit vers le laboratoire",
  STONE_RECEIVED: "Calcul réceptionné au laboratoire",
  DOCUMENTS_UNDER_REVIEW: "Vérification des documents",
  INCOMPLETE_DOSSIER: "Corrections demandées au patient",
  DOSSIER_VALIDATED: "Dossier validé",
  ANALYSIS_IN_PROGRESS: "Analyse en cours",
  ANALYSIS_COMPLETED: "Analyse terminée",
  REPORT_IN_PREPARATION: "Préparation du rapport",
  PENDING_DOCTOR_VALIDATION: "En attente de validation médicale",
  REPORT_REJECTED: "Rapport refusé par le médecin",
  REPORT_VALIDATED: "Rapport validé par le médecin",
  RESULT_READY: "Résultat disponible",
  APPOINTMENT_SCHEDULED: "Rendez-vous programmé",
  REPORT_COLLECTED: "Rapport remis au patient",
};

const STATUS_ICONS: Record<string, typeof Clock> = {
  INCOMPLETE_DOSSIER: AlertTriangle,
  REPORT_REJECTED: AlertTriangle,
  RESULT_READY: CheckCircle2,
  REPORT_COLLECTED: CheckCircle2,
};

export function HistoryTimeline({
  requestId,
  history,
  currentStatus,
}: {
  requestId: string;
  history: HistoryEntry[];
  currentStatus: string;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmRevert, setConfirmRevert] = useState<string | null>(null);

  const [revertState, revertAction, revertPending] = useActionState(
    (_prev: { error: string | null }, formData: FormData) =>
      revertToStatus(requestId, formData.get("targetStatus") as string),
    { error: null }
  );

  if (history.length === 0) return null;

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-stone-400">
        <Clock className="w-4 h-4" />
        Historique des statuts
      </div>

      <div className="relative">
        <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-stone-200" />

        <div className="space-y-1">
          {history.map((entry) => {
            const isExpanded = expandedId === entry.id;
            const Icon = STATUS_ICONS[entry.to_status] || Clock;
            const description = STATUS_DESCRIPTIONS[entry.to_status] ?? entry.to_status;
            const canRevert =
              entry.to_status !== currentStatus &&
              !["RESULT_READY", "APPOINTMENT_SCHEDULED", "REPORT_COLLECTED", "DRAFT", "INCOMPLETE_DOSSIER"].includes(entry.to_status);

            return (
              <div key={entry.id}>
                <div className="flex items-start gap-4 pl-1 group">
                  <div
                    className={`w-[15px] h-[15px] rounded-full border-2 shrink-0 mt-0.5 relative z-10 flex items-center justify-center transition-all ${
                      entry.to_status === currentStatus
                        ? "bg-blue-500 border-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.4)]"
                        : entry.to_status === "INCOMPLETE_DOSSIER" || entry.to_status === "REPORT_REJECTED"
                          ? "bg-amber-400 border-amber-400"
                          : "bg-white border-stone-300"
                    }`}
                  >
                    {entry.to_status === currentStatus && (
                      <div className="w-2 h-2 bg-white rounded-full animate-ping absolute opacity-75" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 py-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={entry.to_status as RequestStatus} />
                      <span className="text-xs text-stone-400">
                        {new Date(entry.created_at).toLocaleString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {entry.profiles?.full_name && (
                        <span className="text-xs text-stone-400">
                          — {entry.profiles.full_name}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-stone-500 mt-1">{description}</p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 pt-2">
                    {/* Expand */}
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                      className="p-1 rounded-md text-stone-300 hover:text-stone-500 hover:bg-stone-100 transition-all opacity-0 group-hover:opacity-100"
                      title="Détails"
                    >
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {/* Revert */}
                    {canRevert && (
                      <>
                        {confirmRevert === entry.id ? (
                          <form action={revertAction} className="flex items-center gap-1">
                            <input type="hidden" name="targetStatus" value={entry.to_status} />
                            {revertState?.error && (
                              <span className="text-[10px] text-red-500 max-w-24 truncate">{revertState.error}</span>
                            )}
                            <button
                              type="submit"
                              disabled={revertPending}
                              className="p-1 rounded-md text-red-500 bg-red-50 hover:bg-red-100 transition-all"
                              title="Confirmer"
                            >
                              <Undo2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmRevert(null)}
                              className="p-1 rounded-md text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-all"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </form>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmRevert(entry.id)}
                            className="p-1 rounded-md text-stone-300 hover:text-amber-500 hover:bg-amber-50 transition-all opacity-0 group-hover:opacity-100"
                            title="Revenir à cette étape"
                          >
                            <Undo2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="ml-[31px] mb-2 mt-1 p-3 rounded-xl bg-stone-50 border border-stone-100 text-xs text-stone-500 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-stone-400" />
                      <span>{description}</span>
                    </div>
                    {entry.from_status && (
                      <p>
                        De : <StatusBadge status={(entry.from_status ?? "DRAFT") as RequestStatus} />
                      </p>
                    )}
                    <p>
                      Vers : <StatusBadge status={entry.to_status as RequestStatus} />
                    </p>
                    {entry.profiles?.full_name && (
                      <p>Par : {entry.profiles.full_name}</p>
                    )}
                    <p className="text-stone-400">
                      {new Date(entry.created_at).toLocaleString("fr-FR")}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
