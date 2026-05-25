"use server";

import { createClient } from "@/lib/supabase/server";

export async function sendEmailNotification(
  userId: string,
  _subject: string,
  _html: string
) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", userId)
    .single();

  if (!profile?.email) return;

  const { error } = await supabase.auth.admin.inviteUserByEmail(profile.email);

  if (error) {
    console.error("Failed to send email notification:", error.message);
  }
}

export async function createInAppNotification(
  userId: string,
  type: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
) {
  const supabase = await createClient();

  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    type,
    title,
    body,
    data: data ?? null,
  });

  if (error) {
    console.error("Failed to create notification:", error.message);
  }
}
