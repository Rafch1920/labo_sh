"use server";

import { createClient } from "@/lib/supabase/server";

const BUCKET_NAME = "request-documents";

export async function uploadDocument(
  requestId: string,
  file: File,
  category: string
) {
  const supabase = await createClient();
  const fileExt = file.name.split(".").pop();
  const filePath = `${requestId}/${category}/${crypto.randomUUID()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  const { data: { user } } = await supabase.auth.getUser();

  const { error: dbError } = await supabase.from("request_documents").insert({
    request_id: requestId,
    file_category: category,
    file_name: file.name,
    file_path: filePath,
    file_size_bytes: file.size,
    mime_type: file.type,
    uploaded_by: user?.id,
  });

  if (dbError) {
    await supabase.storage.from(BUCKET_NAME).remove([filePath]);
    throw new Error(`DB insert failed: ${dbError.message}`);
  }

  return { filePath };
}

export async function getDocumentUrl(filePath: string) {
  const supabase = await createClient();

  const { data } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(filePath, 3600);

  return data?.signedUrl ?? null;
}
