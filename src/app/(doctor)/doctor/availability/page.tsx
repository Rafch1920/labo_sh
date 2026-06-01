import { requireAuth } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import { Calendar, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DoctorAvailabilityPage() {
  await requireAuth();
  const supabase = await createClient();

  // Get this week's confirmed appointments
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1);
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const { data: appointments } = await supabase
    .from("appointments")
    .select("*, analysis_requests(patient_first_name, patient_last_name)")
    .gte("scheduled_at", startOfWeek.toISOString())
    .lte("scheduled_at", endOfWeek.toISOString())
    .order("scheduled_at", { ascending: true });

  // Group by day
  const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
  const weekDays = days.slice(0, 5);
  const slotsByDay: Record<string, typeof appointments> = {};
  weekDays.forEach((_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const key = d.toISOString().split("T")[0];
    slotsByDay[key] = appointments?.filter((a) => {
      const ad = new Date(a.scheduled_at).toISOString().split("T")[0];
      return ad === key;
    }) ?? [];
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 animate-fade-in-up">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-violet-900">Calendrier</h1>
          <p className="text-sm text-violet-600/70">
            {startOfWeek.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} —{" "}
            {endOfWeek.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      <div className="grid gap-4 animate-fade-in-up-delay-1">
        {weekDays.map((dayName, i) => {
          const d = new Date(startOfWeek);
          d.setDate(startOfWeek.getDate() + i);
          const key = d.toISOString().split("T")[0];
          const daySlots = slotsByDay[key] ?? [];
          const isToday = key === today.toISOString().split("T")[0];
          const hasAppointments = daySlots.length > 0;

          return (
            <div
              key={key}
              className={`rounded-2xl border p-5 transition-all ${
                isToday
                  ? "border-violet-200 bg-violet-50/60 shadow-lg shadow-violet-200/20"
                  : "border-violet-100/60 bg-white/70 backdrop-blur-sm shadow-lg"
              }`}
              style={{ boxShadow: isToday ? "0 4px 24px rgba(139,92,246,0.08)" : "0 4px 24px rgba(139,92,246,0.06)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${isToday ? "text-violet-900" : "text-violet-700"}`}>
                    {dayName}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    isToday ? "bg-violet-200 text-violet-700" : "bg-violet-100 text-violet-500"
                  }`}>
                    {d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                  </span>
                </div>
                {hasAppointments && (
                  <span className="text-xs font-medium text-violet-500 bg-violet-100 px-2.5 py-0.5 rounded-full">
                    {daySlots.length} créneau{daySlots.length > 1 ? "x" : ""}
                  </span>
                )}
              </div>

              {!hasAppointments && (
                <p className="text-sm text-violet-400 text-center py-4">Aucun rendez-vous</p>
              )}

              {hasAppointments && (
                <div className="space-y-2">
                  {daySlots.map((apt) => {
                    const aptDate = new Date(apt.scheduled_at);
                    const patient = apt.analysis_requests;
                    return (
                      <div
                        key={apt.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white border border-violet-100"
                      >
                        <div className="p-2 rounded-lg bg-violet-50">
                          <Clock className="w-4 h-4 text-violet-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-violet-900">
                            {aptDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                          <p className="text-xs text-violet-500 truncate">
                            {patient?.patient_first_name} {patient?.patient_last_name}
                          </p>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          apt.doctor_id
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-amber-50 text-amber-600"
                        }`}>
                          {apt.doctor_id ? "Confirmé" : "En attente"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
