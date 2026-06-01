"use server";

import { createClient } from "@/lib/supabase/server";
import type { Notification } from "@/types/database";

export async function getNotifications(): Promise<{
  unreadCount: number;
  notifications: Pick<Notification, "id" | "title" | "body" | "is_read" | "created_at" | "data">[];
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { unreadCount: 0, notifications: [] };

  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, title, body, is_read, created_at, data")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (!notifications) return { unreadCount: 0, notifications: [] };

  return {
    unreadCount: notifications.filter((n) => !n.is_read).length,
    notifications,
  };
}

export async function markNotificationRead(notificationId: string) {
  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);
}
