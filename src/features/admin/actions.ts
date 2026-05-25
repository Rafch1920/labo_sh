"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

type ActionResult = { error: string | null };

export async function getUsers() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function updateUserRole(
  userId: string,
  newRole: string
): Promise<ActionResult> {
  const adminClient = createAdminClient();

  const { error: authError } = await adminClient.auth.admin.updateUserById(
    userId,
    { app_metadata: { role: newRole } }
  );

  if (authError) {
    return { error: authError.message };
  }

  const { error: dbError } = await adminClient
    .from("profiles")
    .update({ role: newRole })
    .eq("id", userId);

  if (dbError) {
    return { error: dbError.message };
  }

  revalidatePath("/admin/users");
  return { error: null };
}

export async function getAnalytics() {
  const supabase = await createClient();

  const [
    { count: total },
    { count: ongoing },
    { count: completed },
    { count: rejected },
    { data: gender },
    { data: monthly },
  ] = await Promise.all([
    supabase.from("analysis_requests").select("*", { count: "exact", head: true }),
    supabase
      .from("analysis_requests")
      .select("*", { count: "exact", head: true })
      .in("status", [
        "ANALYSIS_IN_PROGRESS",
        "REPORT_IN_PREPARATION",
        "PENDING_DOCTOR_VALIDATION",
      ]),
    supabase
      .from("analysis_requests")
      .select("*", { count: "exact", head: true })
      .in("status", ["REPORT_COLLECTED"]),
    supabase
      .from("analysis_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "REPORT_REJECTED"),
    supabase
      .from("analysis_requests")
      .select("patient_gender"),
    supabase
      .from("analysis_requests")
      .select("created_at")
      .gte("created_at", new Date(new Date().getFullYear(), 0, 1).toISOString())
      .order("created_at", { ascending: true }),
  ]);

  const genderCount = (gender ?? []).reduce(
    (acc, r) => {
      const g = r.patient_gender === "male" ? "male" : "female";
      acc[g] = (acc[g] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const monthlyCount = (monthly ?? []).reduce(
    (acc, r) => {
      const month = new Date(r.created_at).getMonth();
      acc[month] = (acc[month] ?? 0) + 1;
      return acc;
    },
    {} as Record<number, number>
  );

  return {
    total: total ?? 0,
    ongoing: ongoing ?? 0,
    completed: completed ?? 0,
    rejected: rejected ?? 0,
    genderDistribution: genderCount,
    monthlyTrend: monthlyCount,
  };
}

export async function getAuditLogs() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("audit_logs")
    .select("*, profiles:user_id(full_name)")
    .order("created_at", { ascending: false })
    .limit(100);

  return data ?? [];
}
