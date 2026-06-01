"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

type ActionResult = { error: string | null };

export async function updateRequestStatus(
  requestId: string,
  newStatus: string
): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("analysis_requests")
    .update({ status: newStatus })
    .eq("id", requestId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/lab/requests/${requestId}`);
  revalidatePath("/lab/queue");
  return { error: null };
}

export async function assignToLabAdmin(requestId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("analysis_requests")
    .update({ assigned_lab_admin_id: user?.id })
    .eq("id", requestId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/lab/requests/${requestId}`);
  return { error: null };
}

export async function assignToDoctor(
  requestId: string,
  doctorId: string
): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("analysis_requests")
    .update({
      assigned_doctor_id: doctorId,
      status: "PENDING_DOCTOR_VALIDATION",
    })
    .eq("id", requestId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/lab/requests/${requestId}`);
  return { error: null };
}

export async function revertToStatus(
  requestId: string,
  targetStatus: string
): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("analysis_requests")
    .update({ status: targetStatus })
    .eq("id", requestId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/lab/requests/${requestId}`);
  revalidatePath("/lab/queue");
  return { error: null };
}

export async function uploadReport(
  requestId: string,
  _prevState: { error: string | null },
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "Non authentifié" };
  }

  const filePath = formData.get("file_path") as string;
  const fileName = formData.get("file_name") as string;
  const fileSize = parseInt(formData.get("file_size") as string || "0");

  if (!filePath) return { error: "Aucun fichier" };

  const admin = createAdminClient();
  const ext = filePath.split(".").pop()?.toLowerCase() ?? "";
  const mimeMap: Record<string, string> = {
    pdf: "application/pdf",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
  };

  const { error: docError } = await admin.from("request_documents").insert({
    request_id: requestId,
    file_category: "additional",
    file_name: fileName || "rapport",
    file_path: filePath,
    file_size_bytes: fileSize,
    mime_type: mimeMap[ext] ?? "application/octet-stream",
    uploaded_by: user.id,
    is_verified: true,
  });

  if (docError) {
    return { error: `Erreur: ${docError.message}` };
  }

  const { error: statusError } = await supabase
    .from("analysis_requests")
    .update({
      status: "PENDING_DOCTOR_VALIDATION",
    })
    .eq("id", requestId);

  if (statusError) {
    return { error: `Erreur: ${statusError.message}` };
  }

  revalidatePath(`/lab/requests/${requestId}`);
  revalidatePath("/lab/queue");
  return { error: null };
}

export async function sendReportToPatient(
  requestId: string,
  _prevState: { error: string | null },
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Non authentifié" };

  const file = formData.get("file") as File;
  if (!file || file.size === 0) return { error: "Aucun fichier" };

  const admin = createAdminClient();

  const { data: req } = await admin
    .from("analysis_requests")
    .select("status, user_id")
    .eq("id", requestId)
    .single();

  if (!req) return { error: "Demande introuvable" };
  if (req.status !== "REPORT_VALIDATED") {
    return { error: "Le rapport doit d'abord être validé par le médecin" };
  }

  // Upload file to storage
  const storagePath = `${requestId}/report-final-${Date.now()}.pdf`;
  const { error: uploadError } = await admin.storage
    .from("request-documents")
    .upload(storagePath, file, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) return { error: `Erreur upload: ${uploadError.message}` };

  const { error: docError } = await admin.from("request_documents").insert({
    request_id: requestId,
    file_category: "medical_report",
    file_name: file.name || "bilan.pdf",
    file_path: storagePath,
    file_size_bytes: file.size,
    mime_type: "application/pdf",
    uploaded_by: user.id,
    is_verified: true,
  });

  if (docError) return { error: `Erreur doc: ${docError.message}` };

  const { error: statusError } = await admin
    .from("analysis_requests")
    .update({ status: "RESULT_READY" })
    .eq("id", requestId);

  if (statusError) return { error: `Erreur statut: ${statusError.message}` };

  await admin.from("status_history").insert({
    request_id: requestId,
    from_status: req.status,
    to_status: "RESULT_READY",
    changed_by: user.id,
  });

  revalidatePath(`/lab/requests/${requestId}`);
  revalidatePath("/lab/queue");
  return { error: null };
}
