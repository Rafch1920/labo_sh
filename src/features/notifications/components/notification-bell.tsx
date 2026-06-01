"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { getNotifications, markNotificationRead } from "@/features/notifications/notification-actions";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
  data: Record<string, unknown> | null;
};

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    const result = await getNotifications();
    setUnreadCount(result.unreadCount);
    setNotifications(result.notifications);
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleClick(n: NotificationItem) {
    if (!n.is_read) {
      await markNotificationRead(n.id);
    }
    setOpen(false);
    const reqId = n.data && typeof n.data.request_id === "string" ? n.data.request_id : null;
    if (reqId) {
      router.push(`/patient/requests/${reqId}`);
    }
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-stone-500 hover:text-[#1e3a5f] hover:bg-blue-50/70 transition-all"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-stone-200 bg-white shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-stone-100">
            <p className="text-sm font-semibold text-stone-800">Notifications</p>
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-stone-50">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-sm text-stone-400 text-center">
                Aucune notification
              </p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`w-full text-left px-4 py-3 transition-colors ${
                    n.is_read ? "bg-white" : "bg-blue-50/40"
                  } hover:bg-stone-50`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm ${
                          n.is_read ? "text-stone-600" : "text-stone-800 font-medium"
                        }`}
                      >
                        {n.title}
                      </p>
                      <p className="text-xs text-stone-400 mt-0.5 line-clamp-2">
                        {n.body}
                      </p>
                      <p className="text-[10px] text-stone-300 mt-1">
                        {new Date(n.created_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {!n.is_read && (
                      <span className="shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
