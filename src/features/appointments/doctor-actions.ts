"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

type ActionResult = { error: string | null };

export async function validateReport(
  requestId: string,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Non authentifié" };

  const medicalRemarks = formData.get("medical_remarks") as string;
  const admin = createAdminClient();

  // Get old status
  const { data: req } = await admin
    .from("analysis_requests")
    .select("status")
    .eq("id", requestId)
    .single();

  if (!req) return { error: "Demande introuvable" };
  if (req.status !== "PENDING_DOCTOR_VALIDATION") {
    return { error: "Statut invalide pour la validation" };
  }

  // Update status (trigger skips history when auth.uid() is null)
  const { error: updateError } = await admin
    .from("analysis_requests")
    .update({
      status: "REPORT_VALIDATED",
      medical_remarks: medicalRemarks || undefined,
    })
    .eq("id", requestId);

  if (updateError) return { error: updateError.message };

  // Manually insert history
  const { error: historyError } = await admin
    .from("status_history")
    .insert({
      request_id: requestId,
      from_status: req.status,
      to_status: "REPORT_VALIDATED",
      changed_by: user.id,
    });

  if (historyError) return { error: historyError.message };

  revalidatePath(`/doctor/requests/${requestId}`);
  revalidatePath("/doctor/validations");
  return { error: null };
}

export async function rejectReport(
  requestId: string,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Non authentifié" };

  const reason = formData.get("rejection_reason") as string;
  const admin = createAdminClient();

  // Get old status
  const { data: req } = await admin
    .from("analysis_requests")
    .select("status")
    .eq("id", requestId)
    .single();

  if (!req) return { error: "Demande introuvable" };
  if (req.status !== "PENDING_DOCTOR_VALIDATION") {
    return { error: "Statut invalide pour le rejet" };
  }

  // Update status (trigger skips history when auth.uid() is null)
  const { error: updateError } = await admin
    .from("analysis_requests")
    .update({
      status: "REPORT_REJECTED",
      medical_remarks: reason || undefined,
    })
    .eq("id", requestId);

  if (updateError) return { error: updateError.message };

  // Manually insert history
  const { error: historyError } = await admin
    .from("status_history")
    .insert({
      request_id: requestId,
      from_status: req.status,
      to_status: "REPORT_REJECTED",
      changed_by: user.id,
    });

  if (historyError) return { error: historyError.message };

  revalidatePath(`/doctor/requests/${requestId}`);
  revalidatePath("/doctor/validations");
  return { error: null };
}

export async function saveAvailability(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const dayOfWeek = parseInt(formData.get("day_of_week") as string);
  const startTime = formData.get("start_time") as string;
  const endTime = formData.get("end_time") as string;

  const { error } = await supabase.from("doctor_availability").insert({
    doctor_id: user?.id,
    day_of_week: dayOfWeek,
    start_time: startTime,
    end_time: endTime,
  });

  if (error) return { error: error.message };

  revalidatePath("/doctor/availability");
  return { error: null };
}
