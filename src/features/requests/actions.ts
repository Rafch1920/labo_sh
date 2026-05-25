"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { categoryFromPath } from "@/lib/doc-labels";

type ActionResult = { error: string | null; requestId?: string };

export async function createRequest(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "Non authentifié" };
  }

  const { data, error } = await supabase
    .from("analysis_requests")
    .insert({
      user_id: user.id,
      status: "REQUEST_SUBMITTED",
      patient_first_name: formData.get("patient_first_name") as string,
      patient_last_name: formData.get("patient_last_name") as string,
      patient_dob: formData.get("patient_dob") as string,
      patient_gender: formData.get("patient_gender") as string,
      patient_address: (formData.get("patient_address") as string) || null,
      patient_phone: (formData.get("patient_phone") as string) || null,
      physician_name: formData.get("physician_name") as string,
      physician_address: (formData.get("physician_address") as string) || null,
      physician_phone: (formData.get("physician_phone") as string) || null,
      physician_email: (formData.get("physician_email") as string) || null,
      medical_remarks: (formData.get("medical_remarks") as string) || null,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  const requestId = data.id;

  // Create document records for uploaded files
  const filePaths = formData.getAll("file_paths") as string[];
  const fileNames = formData.getAll("file_names") as string[];
  const fileSizes = formData.getAll("file_sizes") as string[];

  if (filePaths.length > 0) {
    const adminClient = createAdminClient();
    const docs = filePaths.map((path, i) => {
      const ext = path.split(".").pop()?.toLowerCase() ?? "";
      const mimeMap: Record<string, string> = {
        pdf: "application/pdf",
        png: "image/png",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        gif: "image/gif",
        doc: "application/msword",
        docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      };
      return {
        request_id: requestId,
        file_category: categoryFromPath(path),
        file_name: fileNames[i] ?? "document",
        file_path: path,
        file_size_bytes: parseInt(fileSizes[i] ?? "0"),
        mime_type: mimeMap[ext] ?? "application/octet-stream",
        uploaded_by: user.id,
        is_verified: false,
      };
    });

    const { error: docError } = await adminClient.from("request_documents").insert(docs);
    if (docError) {
      return { error: `Erreur lors de l'enregistrement des documents: ${docError.message}` };
    }
  }

  revalidatePath("/patient/dashboard");
  redirect(`/patient/requests/${requestId}`);
}

export async function deleteRequest(requestId: string): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "Non authentifié" };
  }

  // Verify ownership and that it's still editable (within 4h)
  const { data: request } = await supabase
    .from("analysis_requests")
    .select("created_at, status")
    .eq("id", requestId)
    .eq("user_id", user.id)
    .single();

  if (!request) return { error: "Demande introuvable" };

  if (!["DRAFT", "REQUEST_SUBMITTED"].includes(request.status)) {
    return { error: "Cette demande ne peut plus être modifiée ou supprimée" };
  }

  const elapsed = Date.now() - new Date(request.created_at).getTime();
  if (elapsed > 4 * 60 * 60 * 1000) {
    return { error: "Délai de modification expiré (4h)" };
  }

  const adminClient = createAdminClient();

  // Delete documents from storage
  const { data: docs } = await adminClient
    .from("request_documents")
    .select("file_path")
    .eq("request_id", requestId);

  if (docs && docs.length > 0) {
    const paths = docs.map((d) => d.file_path);
    await supabase.storage.from("request-documents").remove(paths);
  }

  // Delete documents records
  await adminClient.from("request_documents").delete().eq("request_id", requestId);

  // Delete status history
  await adminClient.from("status_history").delete().eq("request_id", requestId);

  // Delete the request
  const { error } = await supabase.from("analysis_requests").delete().eq("id", requestId).eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/patient/dashboard");
  return { error: null };
}

export async function updateRequest(
  requestId: string,
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "Non authentifié" };
  }

  // Verify ownership and editable window
  const { data: request } = await supabase
    .from("analysis_requests")
    .select("created_at, status")
    .eq("id", requestId)
    .eq("user_id", user.id)
    .single();

  if (!request) return { error: "Demande introuvable" };

  if (!["DRAFT", "REQUEST_SUBMITTED"].includes(request.status)) {
    return { error: "Cette demande ne peut plus être modifiée" };
  }

  const elapsed = Date.now() - new Date(request.created_at).getTime();
  if (elapsed > 4 * 60 * 60 * 1000) {
    return { error: "Délai de modification expiré (4h)" };
  }

  // Update request fields
  const { error: updateError } = await supabase
    .from("analysis_requests")
    .update({
      patient_first_name: formData.get("patient_first_name") as string,
      patient_last_name: formData.get("patient_last_name") as string,
      patient_dob: formData.get("patient_dob") as string,
      patient_gender: formData.get("patient_gender") as string,
      patient_address: (formData.get("patient_address") as string) || null,
      patient_phone: (formData.get("patient_phone") as string) || null,
      physician_name: formData.get("physician_name") as string,
      physician_address: (formData.get("physician_address") as string) || null,
      physician_phone: (formData.get("physician_phone") as string) || null,
      physician_email: (formData.get("physician_email") as string) || null,
      medical_remarks: (formData.get("medical_remarks") as string) || null,
    })
    .eq("id", requestId)
    .eq("user_id", user.id);

  if (updateError) return { error: updateError.message };

  // Handle newly uploaded files
  const filePaths = formData.getAll("file_paths") as string[];
  const fileNames = formData.getAll("file_names") as string[];
  const fileSizes = formData.getAll("file_sizes") as string[];

  if (filePaths.length > 0) {
    const adminClient = createAdminClient();
    const docs = filePaths.map((path, i) => {
      const ext = path.split(".").pop()?.toLowerCase() ?? "";
      const mimeMap: Record<string, string> = {
        pdf: "application/pdf",
        png: "image/png",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        gif: "image/gif",
        doc: "application/msword",
        docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      };
      return {
        request_id: requestId,
        file_category: categoryFromPath(path),
        file_name: fileNames[i] ?? "document",
        file_path: path,
        file_size_bytes: parseInt(fileSizes[i] ?? "0"),
        mime_type: mimeMap[ext] ?? "application/octet-stream",
        uploaded_by: user.id,
        is_verified: false,
      };
    });

    const { error: docError } = await adminClient.from("request_documents").insert(docs);
    if (docError) {
      return { error: `Erreur lors de l'enregistrement des documents: ${docError.message}` };
    }
  }

  revalidatePath("/patient/dashboard");
  revalidatePath(`/patient/requests/${requestId}`);
  redirect(`/patient/requests/${requestId}`);
}
