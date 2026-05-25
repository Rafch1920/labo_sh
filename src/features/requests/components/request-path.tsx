"use client";

import {
  FileText,
  Package,
  FileCheck,
  Microscope,
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";

const PHASES = [
  { key: "submission", label: "Dépôt", icon: FileText, statuses: ["DRAFT", "REQUEST_SUBMITTED"] },
  { key: "reception", label: "Réception", icon: Package, statuses: ["STONE_IN_TRANSIT", "STONE_RECEIVED"] },
  { key: "documents", label: "Documents", icon: FileCheck, statuses: ["DOCUMENTS_UNDER_REVIEW", "INCOMPLETE_DOSSIER", "DOSSIER_VALIDATED"] },
  { key: "analysis", label: "Analyse", icon: Microscope, statuses: ["ANALYSIS_IN_PROGRESS", "ANALYSIS_COMPLETED"] },
  { key: "report", label: "Rapport", icon: ClipboardList, statuses: ["REPORT_IN_PREPARATION", "PENDING_DOCTOR_VALIDATION", "REPORT_REJECTED", "REPORT_VALIDATED"] },
  { key: "result", label: "Résultat", icon: CheckCircle2, statuses: ["RESULT_READY", "APPOINTMENT_SCHEDULED", "REPORT_COLLECTED"] },
] as const;

const STATUS_TO_PHASE: Record<string, number> = {};
for (let i = 0; i < PHASES.length; i++) {
  for (const s of PHASES[i].statuses as readonly string[]) {
    STATUS_TO_PHASE[s] = i;
  }
}

function getPhaseIndex(status: string): number {
  return STATUS_TO_PHASE[status] ?? 0;
}

function getPhaseProgress(status: string): number {
  const idx = getPhaseIndex(status);
  const phase = PHASES[idx];
  if (!phase) return 0;
  const pos = (phase.statuses as readonly string[]).indexOf(status);
  if (pos < 0) return 0;
  const total = phase.statuses.length;
  return idx + pos / total;
}

function isTerminal(status: string): boolean {
  return ["REPORT_COLLECTED", "APPOINTMENT_SCHEDULED", "RESULT_READY"].includes(status);
}

export function RequestPathMini({ status }: { status: string }) {
  const currentPhase = getPhaseIndex(status);
  const terminated = isTerminal(status);

  return (
    <div className="flex items-center gap-1.5">
      {PHASES.map((phase, i) => {
        const done = i < currentPhase;
        const current = i === currentPhase;
        return (
          <div key={phase.key} className="flex items-center gap-0">
            {i > 0 && (
              <div
                className={`w-3 h-px ${
                  done || terminated
                    ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                    : current
                      ? "bg-gradient-to-r from-blue-400 to-blue-500"
                      : "bg-stone-200"
                }`}
              />
            )}
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-500 ${
                done || terminated
                  ? "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_0_6px_rgba(52,211,153,0.4)]"
                  : current
                    ? "bg-gradient-to-br from-blue-400 to-indigo-600 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse"
                    : "bg-stone-200"
              }`}
            >
              {done || terminated ? (
                <CheckCircle2 className="w-2.5 h-2.5 text-white" />
              ) : current ? (
                <Loader2 className="w-2.5 h-2.5 text-white animate-spin" />
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function RequestPathFull({ status }: { status: string }) {
  const currentPhase = getPhaseIndex(status);
  const terminated = isTerminal(status);
  const progress = getPhaseProgress(status);
  const pct = Math.round((progress / (PHASES.length - 1)) * 100);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#1e3a5f] p-6">
      {/* Glow orbs */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-400/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${terminated ? "bg-emerald-400/20" : "bg-blue-400/20"}`}>
              {terminated ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
              )}
            </div>
            <div>
              <p className="text-white text-sm font-medium">
                {terminated ? "Parcours terminé" : "Parcours en cours"}
              </p>
              <p className="text-blue-200/50 text-xs">{pct}% complété</p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                terminated
                  ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                  : "bg-gradient-to-r from-blue-400 to-indigo-500"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-0">
          {PHASES.map((phase, i) => {
            const Icon = phase.icon;
            const done = i < currentPhase;
            const current = i === currentPhase;
            const remaining = i > currentPhase;

            // Determine sub-status within phase
            const isIncompleteDossier = status === "INCOMPLETE_DOSSIER" && phase.key === "documents";
            const isReportRejected = status === "REPORT_REJECTED" && phase.key === "report";

            return (
              <div key={phase.key} className="flex items-start gap-3 relative pb-4 last:pb-0">
                {/* Connector line */}
                {i < PHASES.length - 1 && (
                  <div
                    className={`absolute left-[11px] top-5 bottom-0 w-0.5 ${
                      done || (i === currentPhase - 1 && currentPhase < PHASES.length)
                        ? "bg-gradient-to-b from-emerald-400 to-emerald-500/40"
                        : current
                          ? "bg-gradient-to-b from-blue-400 to-blue-500/20"
                          : "bg-white/10"
                    }`}
                  />
                )}

                {/* Icon */}
                <div
                  className={`relative z-10 w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                    done
                      ? "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_0_10px_rgba(52,211,153,0.3)]"
                      : current
                        ? "bg-gradient-to-br from-blue-400 to-indigo-600 shadow-[0_0_12px_rgba(59,130,246,0.4)]"
                        : remaining
                          ? "bg-white/10"
                          : "bg-white/10"
                  } ${current ? "animate-pulse" : ""}`}
                >
                  {done ? (
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  ) : (
                    <Icon className={`w-3 h-3 ${current ? "text-white" : "text-white/30"}`} />
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 pt-0.5">
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-sm font-medium transition-colors ${
                        done ? "text-emerald-300" : current ? "text-white" : "text-white/30"
                      }`}
                    >
                      {phase.label}
                    </p>
                    {current && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-400/20 text-blue-300 font-medium">
                        En cours
                      </span>
                    )}
                    {done && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 font-medium">
                        Fait
                      </span>
                    )}
                  </div>

                  {/* Sub-status details */}
                  {current && isIncompleteDossier && (
                    <p className="text-[11px] text-amber-400 mt-0.5 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Corrections demandées
                    </p>
                  )}
                  {current && isReportRejected && (
                    <p className="text-[11px] text-amber-400 mt-0.5 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Rapport à corriger
                    </p>
                  )}
                  {current && status === "DRAFT" && (
                    <p className="text-[11px] text-blue-300/60 mt-0.5">Brouillon — à soumettre</p>
                  )}
                  {current && status === "REQUEST_SUBMITTED" && (
                    <p className="text-[11px] text-blue-300/60 mt-0.5">En attente de réception</p>
                  )}
                  {current && status === "STONE_IN_TRANSIT" && (
                    <p className="text-[11px] text-blue-300/60 mt-0.5">Calcul en transit</p>
                  )}
                  {current && status === "STONE_RECEIVED" && (
                    <p className="text-[11px] text-blue-300/60 mt-0.5">Calcul reçu</p>
                  )}
                  {current && status === "DOCUMENTS_UNDER_REVIEW" && (
                    <p className="text-[11px] text-blue-300/60 mt-0.5">Documents en cours de vérification</p>
                  )}
                  {current && status === "DOSSIER_VALIDATED" && (
                    <p className="text-[11px] text-blue-300/60 mt-0.5">Dossier validé</p>
                  )}
                  {current && status === "ANALYSIS_IN_PROGRESS" && (
                    <p className="text-[11px] text-blue-300/60 mt-0.5">Analyse en cours</p>
                  )}
                  {current && status === "ANALYSIS_COMPLETED" && (
                    <p className="text-[11px] text-blue-300/60 mt-0.5">Analyse terminée</p>
                  )}
                  {current && status === "REPORT_IN_PREPARATION" && (
                    <p className="text-[11px] text-blue-300/60 mt-0.5">Préparation du rapport</p>
                  )}
                  {current && status === "PENDING_DOCTOR_VALIDATION" && (
                    <p className="text-[11px] text-blue-300/60 mt-0.5">En attente de validation médicale</p>
                  )}
                  {current && status === "REPORT_VALIDATED" && (
                    <p className="text-[11px] text-blue-300/60 mt-0.5">Rapport validé</p>
                  )}
                  {current && status === "RESULT_READY" && (
                    <p className="text-[11px] text-emerald-300/60 mt-0.5">Résultat disponible</p>
                  )}
                  {current && status === "APPOINTMENT_SCHEDULED" && (
                    <p className="text-[11px] text-blue-300/60 mt-0.5">Rendez-vous programmé</p>
                  )}
                  {current && status === "REPORT_COLLECTED" && (
                    <p className="text-[11px] text-emerald-300/60 mt-0.5">Rapport remis au patient</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
