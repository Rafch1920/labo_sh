"use client";

import { useState } from "react";
import { useActionState } from "react";
import { CheckCircle2, XCircle, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { acceptAppointment, proposeSlots } from "@/features/appointments/doctor-appointment-actions";

type Appointment = {
  id: string;
  request_id: string;
  patient_id: string;
  doctor_id: string | null;
  scheduled_at: string;
  status: string;
  notes: string | null;
  analysis_requests?: {
    patient_first_name: string;
    patient_last_name: string;
  } | null;
};

type Props = {
  appointments: Appointment[];
};

function ProposeSlotsForm({ appointmentId, onClose }: { appointmentId: string; onClose: () => void }) {
  const [state, action, pending] = useActionState(proposeSlots, { error: null });
  const today = new Date().toISOString().split("T")[0];

  return (
    <form action={action} className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-3">
      <input type="hidden" name="appointment_id" value={appointmentId} />
      <p className="text-sm font-medium text-amber-800">Proposer 3 créneaux au patient</p>
      {state?.error && (
        <p className="text-xs text-rose-600">{state.error}</p>
      )}
      {[1, 2, 3].map((i) => (
        <div key={i} className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-amber-700 font-medium">Créneau {i} — Date</label>
            <input
              type="date"
              name={`slot_${i}_date`}
              required
              min={today}
              className="w-full mt-1 rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-amber-700 font-medium">Heure</label>
            <input
              type="time"
              name={`slot_${i}_time`}
              required
              className="w-full mt-1 rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm"
            />
          </div>
        </div>
      ))}
      <div className="flex gap-2 pt-1">
        <Button type="submit" disabled={pending} size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
          {pending ? "Envoi..." : "Proposer les 3 créneaux"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          Annuler
        </Button>
      </div>
    </form>
  );
}

export function DoctorAppointmentList({ appointments }: Props) {
  const [altForm, setAltForm] = useState<string | null>(null);

  return (
    <div className="divide-y divide-violet-100 rounded-2xl border border-violet-100/60 bg-white/70 backdrop-blur-sm overflow-hidden shadow-lg" style={{ boxShadow: "0 4px 24px rgba(139,92,246,0.06)" }}>
      {appointments.map((apt) => {
        const patient = apt.analysis_requests;
        const aptDate = new Date(apt.scheduled_at);
        const isPending = apt.status === "scheduled" && !apt.doctor_id;
        const isConfirmed = apt.status === "scheduled" && !!apt.doctor_id;
        const hasProposals = apt.notes?.includes("proposed_slots");
        const proposalsWaiting = hasProposals && apt.notes?.includes('"selected_index":null');

        return (
          <div key={apt.id} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-2.5 rounded-xl shrink-0 ${
                  isPending ? "bg-amber-50" : isConfirmed ? "bg-emerald-50" : "bg-stone-50"
                }`}>
                  <User className={`w-5 h-5 ${
                    isPending ? "text-amber-500" : isConfirmed ? "text-emerald-500" : "text-stone-400"
                  }`} />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-violet-900">
                    {patient?.patient_first_name} {patient?.patient_last_name}
                  </p>
                  <p className="text-sm text-violet-500">
                    {aptDate.toLocaleDateString("fr-FR", {
                      weekday: "long", day: "numeric", month: "long", year: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-violet-400">
                    {aptDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  {proposalsWaiting && (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-600 mt-1">
                      <Clock className="w-3 h-3" /> En attente du choix patient
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {isPending && (
                  <>
                    <form action={() => { acceptAppointment(apt.id); }}>
                      <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Accepter
                      </Button>
                    </form>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setAltForm(altForm === apt.id ? null : apt.id)}
                      className="border-amber-300 text-amber-700 hover:bg-amber-50"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Proposer 3 créneaux
                    </Button>
                  </>
                )}
                {isConfirmed && (
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                    Confirmé
                  </span>
                )}
              </div>
            </div>
            {altForm === apt.id && (
              <ProposeSlotsForm appointmentId={apt.id} onClose={() => setAltForm(null)} />
            )}
          </div>
        );
      })}
    </div>
  );
}
