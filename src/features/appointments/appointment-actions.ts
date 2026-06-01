"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

type ActionResult = { error: string | null };

export async function createAppointment(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié" };

  const requestId = formData.get("request_id") as string;
  const scheduledAt = formData.get("scheduled_at") as string;

  const { error } = await supabase.from("appointments").insert({
    request_id: requestId,
    patient_id: user.id,
    scheduled_at: scheduledAt,
    status: "scheduled",
  });

  if (error) {
    return { error: error.message };
  }

  const admin = createAdminClient();
  const { data: req } = await admin
    .from("analysis_requests")
    .select("status")
    .eq("id", requestId)
    .single();

  if (req) {
    await admin
      .from("analysis_requests")
      .update({ status: "APPOINTMENT_SCHEDULED" })
      .eq("id", requestId);

    await admin.from("status_history").insert({
      request_id: requestId,
      from_status: req.status,
      to_status: "APPOINTMENT_SCHEDULED",
      changed_by: user.id,
    });
  }

  revalidatePath("/patient/appointments");
  revalidatePath(`/patient/requests/${requestId}`);
  return { error: null };
}

export async function cancelAppointment(
  appointmentId: string
): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("appointments")
    .update({ status: "cancelled" })
    .eq("id", appointmentId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/patient/appointments");
  return { error: null };
}

export async function getAvailableSlots(date: string): Promise<string[]> {
  const supabase = await createClient();

  const dayOfWeek = new Date(date).getDay();
  // 0=Sun, 6=Sat → no slots
  if (dayOfWeek === 0 || dayOfWeek === 6) return [];

  const slots: string[] = [];
  // Morning: 10h-13h, Afternoon: 15h-17h, 30min intervals
  for (let h = 10; h < 13; h++) {
    for (let m = 0; m < 60; m += 30) {
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  for (let h = 15; h < 17; h++) {
    for (let m = 0; m < 60; m += 30) {
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }

  const { data: existing } = await supabase
    .from("appointments")
    .select("scheduled_at")
    .gte("scheduled_at", `${date}T00:00:00`)
    .lte("scheduled_at", `${date}T23:59:59`)
    .in("status", ["scheduled"]);

  const bookedTimes = new Set(
    existing?.map((a) => {
      const d = new Date(a.scheduled_at);
      return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    }) ?? []
  );

  return slots.filter((s) => !bookedTimes.has(s));
}
