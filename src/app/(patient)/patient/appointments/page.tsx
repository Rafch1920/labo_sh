import { requireAuth } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import { AppointmentScheduler } from "@/features/appointments/components/appointment-scheduler";
import { StatusBadge } from "@/features/requests/components/status-badge";

export const dynamic = "force-dynamic";

export default async function AppointmentsPage() {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: pendingRequests } = await supabase
    .from("analysis_requests")
    .select("id, status, patient_first_name, patient_last_name, created_at")
    .eq("user_id", user.id)
    .eq("status", "RESULT_READY");

  const { data: appointments } = await supabase
    .from("appointments")
    .select("*, analysis_requests(patient_first_name, patient_last_name)")
    .eq("patient_id", user.id)
    .order("scheduled_at", { ascending: true });

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-3xl font-bold">Rendez-vous</h1>

      {pendingRequests && pendingRequests.length > 0 && (
        <div className="rounded-lg border bg-card p-4 space-y-4">
          <h2 className="font-semibold">Planifier un rendez-vous de récupération</h2>
          <p className="text-sm text-muted-foreground">
            Vos résultats sont disponibles. Choisissez une demande pour planifier un rendez-vous.
          </p>
          {pendingRequests.map((req) => (
            <div key={req.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">#{req.id.slice(0, 8)}</span>
                <StatusBadge status={req.status} />
              </div>
              <AppointmentScheduler requestId={req.id} />
            </div>
          ))}
        </div>
      )}

      <div className="rounded-lg border bg-card">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Mes rendez-vous</h2>
        </div>
        {(!appointments || appointments.length === 0) ? (
          <div className="p-8 text-center text-muted-foreground">
            Aucun rendez-vous planifié.
          </div>
        ) : (
          <div className="divide-y">
            {appointments.map((apt) => (
              <div key={apt.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">
                    {new Date(apt.scheduled_at).toLocaleDateString("fr-FR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground capitalize">{apt.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
