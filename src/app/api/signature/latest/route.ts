import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data: files, error } = await supabase.storage
    .from("signatures")
    .list("", {
      limit: 1,
      sortBy: { column: "created_at", order: "desc" },
    });

  if (error || !files || files.length === 0) {
    return NextResponse.json({ url: null });
  }

  const { data: urlData } = await supabase.storage
    .from("signatures")
    .createSignedUrl(files[0].name, 3600);

  return NextResponse.json({ url: urlData?.signedUrl ?? null });
}
