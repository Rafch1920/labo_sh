"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { categoryFromPath } from "@/lib/doc-labels";

export async function fixDocumentCategories(): Promise<{ fixed: number; errors: string[] }> {
  const admin = createAdminClient();

  const { data: docs, error } = await admin
    .from("request_documents")
    .select("id, file_category, file_path")
    .eq("file_category", "additional");

  if (error) return { fixed: 0, errors: [error.message] };

  const errors: string[] = [];
  let fixed = 0;

  for (const doc of docs ?? []) {
    const realCategory = categoryFromPath(doc.file_path);
    if (realCategory !== "additional") {
      const { error: updateError } = await admin
        .from("request_documents")
        .update({ file_category: realCategory })
        .eq("id", doc.id);

      if (updateError) {
        errors.push(`Doc ${doc.id}: ${updateError.message}`);
      } else {
        fixed++;
      }
    }
  }

  return { fixed, errors };
}
