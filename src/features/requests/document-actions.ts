"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

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

  // Auto-transition to INCOMPLETE_DOSSIER if docs are under review
  const { data: req } = await admin
    .from("analysis_requests")
    .select("status")
    .eq("id", requestId)
    .single();

  if (req && req.status === "DOCUMENTS_UNDER_REVIEW") {
    const { error: statusError } = await client
      .from("analysis_requests")
      .update({ status: "INCOMPLETE_DOSSIER" })
      .eq("id", requestId);

    if (statusError) {
      return { error: statusError.message };
    }
  }

  revalidatePath(`/lab/requests/${requestId}`);
  revalidatePath("/patient/dashboard");
  revalidatePath(`/patient/requests/${requestId}`);
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

  const oldDocIds = formData.getAll("old_doc_ids") as string[];
  if (oldDocIds.length === 0) {
    return { error: "Aucun fichier à remplacer" };
  }

  const admin = createAdminClient();
  const mimeMap: Record<string, string> = {
    pdf: "application/pdf",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };

  const newDocs: {
    request_id: string;
    file_category: string;
    file_name: string;
    file_path: string;
    file_size_bytes: number;
    mime_type: string;
    uploaded_by: string;
    is_verified: boolean;
  }[] = [];

  for (const oldDocId of oldDocIds) {
    const file = formData.get(`file_${oldDocId}`) as File | null;
    if (!file || file.size === 0) continue;

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const category = formData.get(`cat_${oldDocId}`) as string || "other";
    const storagePath = `${user.id}/${category}/${crypto.randomUUID()}-${file.name}`;

    const { error: uploadError } = await admin.storage
      .from("request-documents")
      .upload(storagePath, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      return { error: `Erreur upload ${file.name} : ${uploadError.message}` };
    }

    newDocs.push({
      request_id: requestId,
      file_category: category,
      file_name: file.name,
      file_path: storagePath,
      file_size_bytes: file.size,
      mime_type: mimeMap[ext] ?? "application/octet-stream",
      uploaded_by: user.id,
      is_verified: false,
    });
  }

  if (newDocs.length === 0) {
    return { error: "Aucun fichier valide n'a été fourni" };
  }

  // Delete old rejected documents from storage
  const { data: oldDocs } = await admin
    .from("request_documents")
    .select("id, file_path")
    .in("id", oldDocIds);

  if (oldDocs && oldDocs.length > 0) {
    const storagePaths = oldDocs.map((d) => d.file_path);
    await admin.storage.from("request-documents").remove(storagePaths);
    const ids = oldDocs.map((d) => d.id);
    await admin.from("request_documents").delete().in("id", ids);
  }

  // Insert new documents
  const { error: docError } = await admin.from("request_documents").insert(newDocs);
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
