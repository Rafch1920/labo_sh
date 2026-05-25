"use client";

import { useActionState } from "react";
import { validateReport, rejectReport } from "@/features/appointments/doctor-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type DoctorValidationPanelProps = {
  requestId: string;
};

export function DoctorValidationPanel({ requestId }: DoctorValidationPanelProps) {
  const [validateState, validateAction, validatePending] = useActionState(
    (_prev: { error: string | null }, formData: FormData) =>
      validateReport(requestId, formData),
    { error: null }
  );

  const [rejectState, rejectAction, rejectPending] = useActionState(
    (_prev: { error: string | null }, formData: FormData) =>
      rejectReport(requestId, formData),
    { error: null }
  );

  return (
    <div className="rounded-lg border bg-card p-4 space-y-6">
      <h3 className="font-semibold">Validation du rapport</h3>

      {validateState?.error && (
        <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md">
          {validateState.error}
        </div>
      )}

      {/* Validate Form */}
      <form action={validateAction} className="space-y-3">
        <div className="space-y-1">
          <label className="text-sm font-medium">Remarques médicales (optionnel)</label>
          <Textarea name="medical_remarks" rows={3} />
        </div>
        <Button type="submit" disabled={validatePending} variant="default">
          {validatePending ? "Validation..." : "Valider le rapport"}
        </Button>
      </form>

      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-destructive mb-2">Rejeter le rapport</h4>
        {rejectState?.error && (
          <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md mb-2">
            {rejectState.error}
          </div>
        )}
        <form action={rejectAction} className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Motif du rejet</label>
            <Textarea name="rejection_reason" rows={2} required />
          </div>
          <Button type="submit" disabled={rejectPending} variant="destructive" size="sm">
            {rejectPending ? "Rejet..." : "Rejeter le rapport"}
          </Button>
        </form>
      </div>
    </div>
  );
}
