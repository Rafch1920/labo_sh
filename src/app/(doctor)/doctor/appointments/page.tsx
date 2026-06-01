import { requireAuth } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import { DoctorAppointmentList } from "@/features/appointments/components/doctor-appointment-list";
import { Calendar, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DoctorAppointmentsPage() {
  await requireAuth();

  const supabase = await createClient();

  const { data: appointments } = await supabase
    .from("appointments")
    .select("*, analysis_requests(patient_first_name, patient_last_name)")
    .order("scheduled_at", { ascending: true });

  const scheduled = appointments?.filter((a) => a.status === "scheduled" && !a.doctor_id) ?? [];
  const confirmed = appointments?.filter((a) => a.status === "scheduled" && a.doctor_id) ?? [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 animate-fade-in-up">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-violet-900">Rendez-vous</h1>
          <p className="text-sm text-violet-600/70">Gérez les rendez-vous patients</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-5 sm:grid-cols-2 animate-fade-in-up-delay-1">
        <div className="rounded-2xl border border-violet-100/60 bg-white/70 backdrop-blur-sm p-5 shadow-lg" style={{ boxShadow: "0 4px 24px rgba(139,92,246,0.06)" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-violet-400 font-medium">En attente</p>
              <p className="text-3xl font-bold text-violet-900 tabular-nums mt-1">{scheduled.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-violet-100/60 bg-white/70 backdrop-blur-sm p-5 shadow-lg" style={{ boxShadow: "0 4px 24px rgba(139,92,246,0.06)" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-violet-400 font-medium">Confirmés</p>
              <p className="text-3xl font-bold text-violet-900 tabular-nums mt-1">{confirmed.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50">
              <Calendar className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Appointments list */}
      <div className="space-y-4 animate-fade-in-up-delay-2">
        {(!appointments || appointments.length === 0) ? (
          <div className="rounded-2xl border border-violet-100/60 bg-white/70 backdrop-blur-sm p-12 text-center shadow-lg" style={{ boxShadow: "0 4px 24px rgba(139,92,246,0.06)" }}>
            <Calendar className="w-12 h-12 text-violet-300 mx-auto mb-4" />
            <p className="text-violet-700 font-medium">Aucun rendez-vous</p>
            <p className="text-sm text-violet-500 mt-1">Les rendez-vous patients apparaîtront ici.</p>
          </div>
        ) : (
          <DoctorAppointmentList appointments={appointments} />
        )}
      </div>
    </div>
  );
}
