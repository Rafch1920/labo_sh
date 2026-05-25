"use client";

import { useActionState } from "react";
import { updateRequestStatus, assignToLabAdmin, assignToDoctor } from "@/features/requests/lab-actions";
import { Button } from "@/components/ui/button";
import type { RequestStatus } from "@/types/enums";

type LabWorkflowPanelProps = {
  requestId: string;
  status: RequestStatus;
  assignedLabAdminId: string | null;
  doctors: { id: string; name: string }[];
};

const LAB_TRANSITIONS: Partial<Record<RequestStatus, { label: string; nextStatus: RequestStatus; variant?: "default" | "destructive" | "outline" }[]>> = {
  REQUEST_SUBMITTED: [
    { label: "Confirmer réception du calcul", nextStatus: "STONE_RECEIVED" },
  ],
  STONE_RECEIVED: [
    { label: "Vérifier les documents", nextStatus: "DOCUMENTS_UNDER_REVIEW" },
  ],
  DOCUMENTS_UNDER_REVIEW: [
    { label: "Demander des corrections", nextStatus: "INCOMPLETE_DOSSIER", variant: "destructive" },
    { label: "Valider le dossier", nextStatus: "DOSSIER_VALIDATED" },
  ],
  INCOMPLETE_DOSSIER: [
    { label: "Re-vérifier les documents", nextStatus: "DOCUMENTS_UNDER_REVIEW" },
  ],
  DOSSIER_VALIDATED: [
    { label: "Commencer l'analyse", nextStatus: "ANALYSIS_IN_PROGRESS" },
  ],
  ANALYSIS_IN_PROGRESS: [
    { label: "Analyse terminée", nextStatus: "ANALYSIS_COMPLETED" },
  ],
  ANALYSIS_COMPLETED: [
    { label: "Préparer le rapport", nextStatus: "REPORT_IN_PREPARATION" },
  ],
  REPORT_IN_PREPARATION: [
    { label: "Transmettre au médecin", nextStatus: "PENDING_DOCTOR_VALIDATION" },
  ],
  REPORT_REJECTED: [
    { label: "Corriger et renvoyer", nextStatus: "REPORT_IN_PREPARATION" },
  ],
  REPORT_VALIDATED: [],
  RESULT_READY: [],
  APPOINTMENT_SCHEDULED: [],
  REPORT_COLLECTED: [],
  DRAFT: [
    { label: "Marquer comme soumise", nextStatus: "REQUEST_SUBMITTED" },
  ],
};

export function LabWorkflowPanel({
  requestId,
  status,
  assignedLabAdminId,
  doctors,
}: LabWorkflowPanelProps) {
  const [assignState, assignAction, assignPending] = useActionState(
    (_prev: { error: string | null }) => assignToLabAdmin(requestId),
    { error: null }
  );

  const [doctorState, dispatchDoctorAction, doctorPending] = useActionState(
    (_prev: { error: string | null }, formData: FormData) =>
      assignToDoctor(requestId, formData.get("doctor_id") as string),
    { error: null }
  );

  const transitions = LAB_TRANSITIONS[status] ?? [];

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <h3 className="font-semibold">Actions laboratoire</h3>

      {assignState?.error && (
        <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md">
          {assignState.error}
        </div>
      )}
      {doctorState?.error && (
        <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md">
          {doctorState.error}
        </div>
      )}

      {/* Assignment */}
      {!assignedLabAdminId && (
        <form action={assignAction}>
          <Button type="submit" disabled={assignPending} size="sm">
            {assignPending ? "Assignation..." : "M'assigner cette demande"}
          </Button>
        </form>
      )}

      {assignedLabAdminId && (
        <p className="text-sm text-muted-foreground">
          Assigné au laboratoire ✓
        </p>
      )}

      {/* Status transitions */}
      {transitions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {transitions.map((t) => (
            <StatusTransitionButton
              key={t.nextStatus}
              requestId={requestId}
              label={t.label}
              nextStatus={t.nextStatus}
              variant={t.variant ?? "default"}
            />
          ))}
        </div>
      )}

      {/* Assign to doctor (before sending to validation) */}
      {status === "REPORT_IN_PREPARATION" && doctors.length > 0 && (
        <form action={dispatchDoctorAction} className="flex gap-2 items-end">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Assigner au médecin</label>
            <select
              name="doctor_id"
              required
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
            >
              <option value="">Sélectionner...</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" disabled={doctorPending} size="sm">
            {doctorPending ? "Envoi..." : "Transmettre"}
          </Button>
        </form>
      )}
    </div>
  );
}

function StatusTransitionButton({
  requestId,
  label,
  nextStatus,
  variant,
}: {
  requestId: string;
  label: string;
  nextStatus: RequestStatus;
  variant: "default" | "destructive" | "outline";
}) {
  const [state, action, pending] = useActionState(
    (_prev: { error: string | null }) => updateRequestStatus(requestId, nextStatus),
    { error: null }
  );

  return (
    <form action={action}>
      {state?.error && (
        <p className="text-xs text-destructive mb-1">{state.error}</p>
      )}
      <Button type="submit" disabled={pending} variant={variant} size="sm">
        {pending ? "..." : label}
      </Button>
    </form>
  );
}
