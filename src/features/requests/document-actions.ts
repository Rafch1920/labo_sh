"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { categoryFromPath } from "@/lib/doc-labels";

type ActionResult = { error: string | null };

export async function verifyDocument(requestId: string, docId: string): Promise<ActionResult> {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return { error: "Non authentifié" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("request_documents")
    .update({ is_verified: true, reviewed_by: user.id, reviewed_at: new Date().toISOString(), rejection_reason: null })
    .eq("id", docId);

  if (error) return { error: error.message };

  revalidatePath(`/lab/requests/${requestId}`);
  return { error: null };
}

export async function rejectDocument(requestId: string, docId: string, reason: string): Promise<ActionResult> {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return { error: "Non authentifié" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("request_documents")
    .update({ is_verified: false, reviewed_by: user.id, reviewed_at: new Date().toISOString(), rejection_reason: reason })
    .eq("id", docId);

  if (error) return { error: error.message };

  revalidatePath(`/lab/requests/${requestId}`);
  return { error: null };
}

export async function replaceDocuments(
  requestId: string,
  _prevState: { error: string | null },
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "Non authentifié" };
  }

  // Verify ownership and INCOMPLETE_DOSSIER status
  const { data: request } = await supabase
    .from("analysis_requests")
    .select("status")
    .eq("id", requestId)
    .eq("user_id", user.id)
    .single();

  if (!request) return { error: "Demande introuvable" };
  if (request.status !== "INCOMPLETE_DOSSIER") {
    return { error: "Cette demande n'est pas en attente de correction" };
  }

  const filePaths = formData.getAll("file_paths") as string[];
  const fileNames = formData.getAll("file_names") as string[];
  const fileSizes = formData.getAll("file_sizes") as string[];
  const oldDocIds = formData.getAll("old_doc_ids") as string[];

  if (filePaths.length === 0) {
    return { error: "Aucun fichier à remplacer" };
  }

  const admin = createAdminClient();

  // Delete old rejected documents
  if (oldDocIds.length > 0) {
    const { data: oldDocs } = await admin
      .from("request_documents")
      .select("id, file_path")
      .in("id", oldDocIds);

    if (oldDocs && oldDocs.length > 0) {
      const storagePaths = oldDocs.map((d) => d.file_path);
      await supabase.storage.from("request-documents").remove(storagePaths);

      const oldIds = oldDocs.map((d) => d.id);
      await admin.from("request_documents").delete().in("id", oldIds);
    }
  }

  // Insert new documents
  const mimeMap: Record<string, string> = {
    pdf: "application/pdf",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };

  const docs = filePaths.map((path, i) => {
    const ext = path.split(".").pop()?.toLowerCase() ?? "";
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

  const { error: docError } = await admin.from("request_documents").insert(docs);
  if (docError) {
    return { error: `Erreur lors de l'enregistrement des documents: ${docError.message}` };
  }

  // Change status back to DOCUMENTS_UNDER_REVIEW
  const { error: statusError } = await supabase
    .from("analysis_requests")
    .update({ status: "DOCUMENTS_UNDER_REVIEW" })
    .eq("id", requestId);

  if (statusError) {
    return { error: `Erreur lors de la mise à jour du statut: ${statusError.message}` };
  }

  revalidatePath("/patient/dashboard");
  revalidatePath(`/patient/requests/${requestId}`);
  revalidatePath(`/lab/requests/${requestId}`);
  revalidatePath("/lab/queue");
  return { error: null };
}
