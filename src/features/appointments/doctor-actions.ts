"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type ActionResult = { error: string | null };

export async function validateReport(
  requestId: string,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const medicalRemarks = formData.get("medical_remarks") as string;

  const { error } = await supabase
    .from("analysis_requests")
    .update({
      status: "REPORT_VALIDATED",
      medical_remarks: medicalRemarks || undefined,
    })
    .eq("id", requestId);

  if (error) return { error: error.message };

  revalidatePath(`/doctor/requests/${requestId}`);
  revalidatePath("/doctor/validations");
  return { error: null };
}

export async function rejectReport(
  requestId: string,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const reason = formData.get("rejection_reason") as string;

  const { error } = await supabase
    .from("analysis_requests")
    .update({
      status: "REPORT_REJECTED",
      medical_remarks: reason || undefined,
    })
    .eq("id", requestId);

  if (error) return { error: error.message };

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

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/doctor/availability");
  return { error: null };
}
