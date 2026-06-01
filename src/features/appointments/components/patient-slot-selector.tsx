"use client";

import { useActionState, startTransition } from "react";
import { Clock, Calendar } from "lucide-react";
import { selectSlot } from "@/features/appointments/doctor-appointment-actions";

type Props = {
  appointmentId: string;
  requestId: string;
  notes: string;
  patientName: string;
};

export function PatientSlotSelector({ appointmentId, notes }: Props) {
  const [state, action, pending] = useActionState(selectSlot, { error: null });

  let proposals: { proposed_slots: string[]; selected_index: number | null } | null = null;
  try {
    proposals = JSON.parse(notes);
  } catch {
    return null;
  }

  if (!proposals?.proposed_slots || proposals.selected_index !== null) return null;

  const handleSelect = (index: number) => {
    const formData = new FormData();
    formData.append("appointment_id", appointmentId);
    formData.append("slot_index", String(index));
    startTransition(() => action(formData));
  };

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-amber-600" />
        <p className="font-semibold text-amber-900">
          Le médecin vous propose 3 créneaux
        </p>
      </div>
      <p className="text-sm text-amber-700/70">
        Choisissez celui qui vous convient :
      </p>

      {state?.error && (
        <p className="text-sm text-rose-600">{state.error}</p>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {proposals.proposed_slots.map((slot: string, i: number) => {
          const d = new Date(slot);
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={pending}
              className="group relative flex flex-col items-center gap-2 p-5 rounded-xl bg-white border-2 border-amber-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all disabled:opacity-50"
            >
              <Calendar className="w-5 h-5 text-amber-500 group-hover:text-emerald-500 transition-colors" />
              <div className="text-center">
                <p className="text-sm font-semibold text-stone-800">
                  {d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}
                </p>
                <p className="text-lg font-bold text-amber-700 group-hover:text-emerald-700 transition-colors">
                  {d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              {pending && (
                <div className="absolute inset-0 rounded-xl bg-white/60 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
