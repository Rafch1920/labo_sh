import { requireAuth } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import { DoctorAppointmentTicker } from "@/features/appointments/components/doctor-appointment-ticker";
import { ClipboardCheck, Calendar, Clock, Activity } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DoctorDashboardPage() {
  await requireAuth();
  const supabase = await createClient();

  // This week's appointments for the ticker
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1);
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const { data: weekAppointments } = await supabase
    .from("appointments")
    .select("*, analysis_requests(patient_first_name, patient_last_name)")
    .gte("scheduled_at", startOfWeek.toISOString())
    .lte("scheduled_at", endOfWeek.toISOString())
    .order("scheduled_at", { ascending: true });

  const { count: validationsCount } = await supabase
    .from("analysis_requests")
    .select("*", { count: "exact", head: true })
    .eq("status", "PENDING_DOCTOR_VALIDATION");

  const pendingAppts = weekAppointments?.filter((a) => !a.doctor_id).length ?? 0;
  const confirmedAppts = weekAppointments?.filter((a) => a.doctor_id).length ?? 0;

  return (
    <div className="space-y-8">
      <DoctorAppointmentTicker appointments={weekAppointments ?? []} />

      {/* Header */}
      <div className="flex items-center gap-3 animate-fade-in-up">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-violet-900">Tableau de bord</h1>
          <p className="text-sm text-violet-600/70">Vue d&apos;ensemble de votre activité</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-5 sm:grid-cols-3 animate-fade-in-up-delay-1">
        <Link href="/doctor/validations" className="rounded-2xl border border-violet-100/60 bg-white/70 backdrop-blur-sm p-5 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all" style={{ boxShadow: "0 4px 24px rgba(139,92,246,0.06)" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-violet-400 font-medium">Validations en attente</p>
              <p className="text-3xl font-bold text-violet-900 tabular-nums mt-1">{validationsCount ?? 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50">
              <ClipboardCheck className="w-5 h-5 text-amber-500" />
            </div>
          </div>
        </Link>
        <Link href="/doctor/appointments" className="rounded-2xl border border-violet-100/60 bg-white/70 backdrop-blur-sm p-5 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all" style={{ boxShadow: "0 4px 24px rgba(139,92,246,0.06)" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-violet-400 font-medium">Rendez-vous à confirmer</p>
              <p className="text-3xl font-bold text-violet-900 tabular-nums mt-1">{pendingAppts}</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
          </div>
        </Link>
        <Link href="/doctor/availability" className="rounded-2xl border border-violet-100/60 bg-white/70 backdrop-blur-sm p-5 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all" style={{ boxShadow: "0 4px 24px rgba(139,92,246,0.06)" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-violet-400 font-medium">Confirmés cette semaine</p>
              <p className="text-3xl font-bold text-violet-900 tabular-nums mt-1">{confirmedAppts}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50">
              <Calendar className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
        </Link>
      </div>

      {/* Quick navigation */}
      <div className="grid gap-4 sm:grid-cols-2 animate-fade-in-up-delay-2">
        <Link
          href="/doctor/validations"
          className="group rounded-2xl border border-violet-100/60 bg-white/70 backdrop-blur-sm p-6 shadow-lg hover:shadow-xl hover:bg-white transition-all"
          style={{ boxShadow: "0 4px 24px rgba(139,92,246,0.06)" }}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-md">
              <ClipboardCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-violet-900 group-hover:text-violet-700 transition-colors">
    Validations de bilans
  </p>
              <p className="text-sm text-violet-500">Examiner et valider les rapports</p>
            </div>
          </div>
        </Link>
        <Link
          href="/doctor/appointments"
          className="group rounded-2xl border border-violet-100/60 bg-white/70 backdrop-blur-sm p-6 shadow-lg hover:shadow-xl hover:bg-white transition-all"
          style={{ boxShadow: "0 4px 24px rgba(139,92,246,0.06)" }}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-md">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-violet-900 group-hover:text-violet-700 transition-colors">
    Gestion des rendez-vous
  </p>
              <p className="text-sm text-violet-500">Accepter ou proposer des créneaux</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
