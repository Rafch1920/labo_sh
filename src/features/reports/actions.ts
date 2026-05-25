"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

type ActionResult = { error: string | null };

export async function submitGeneratedReport(
  requestId: string,
  _prev: { error: string | null },
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "Non authentifié" };
  }

  const pdfBase64 = formData.get("pdf_base64") as string;
  const fileName = formData.get("file_name") as string;

  if (!pdfBase64) return { error: "Aucun PDF généré" };

  // Convert base64 to buffer
  const base64Data = pdfBase64.replace(/^data:application\/pdf;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");

  const filePath = `${requestId}/report/${crypto.randomUUID()}.pdf`;
  const fileSize = buffer.length;

  const admin = createAdminClient();

  // Upload to storage
  const { error: uploadError } = await admin.storage
    .from("request-documents")
    .upload(filePath, buffer, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (uploadError) {
    return { error: `Erreur d'upload : ${uploadError.message}` };
  }

  // Insert document record
  const { error: docError } = await admin.from("request_documents").insert({
    request_id: requestId,
    file_category: "additional",
    file_name: fileName || "rapport-analyse.pdf",
    file_path: filePath,
    file_size_bytes: fileSize,
    mime_type: "application/pdf",
    uploaded_by: user.id,
    is_verified: true,
  });

  if (docError) {
    await admin.storage.from("request-documents").remove([filePath]);
    return { error: `Erreur doc : ${docError.message}` };
  }

  // Transition status
  const { error: statusError } = await supabase
    .from("analysis_requests")
    .update({ status: "PENDING_DOCTOR_VALIDATION" })
    .eq("id", requestId);

  if (statusError) {
    return { error: `Erreur statut : ${statusError.message}` };
  }

  revalidatePath(`/lab/requests/${requestId}`);
  revalidatePath("/lab/queue");
  return { error: null };
}
