"use client";

import { useState, useEffect } from "react";
import { Clock, Edit3, Trash2 } from "lucide-react";
import Link from "next/link";
import { deleteRequest } from "@/features/requests/actions";
import { useRouter } from "next/navigation";

function getRemaining(createdAt: string): { hours: number; minutes: number; seconds: number; expired: boolean } {
  const created = new Date(createdAt).getTime();
  const deadline = created + 4 * 60 * 60 * 1000;
  const now = Date.now();
  const diff = deadline - now;

  if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, expired: true };

  const totalSec = Math.floor(diff / 1000);
  return {
    hours: Math.floor(totalSec / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
    expired: false,
  };
}

export function RequestTimer({
  requestId,
  createdAt,
}: {
  requestId: string;
  createdAt: string;
}) {
  const router = useRouter();
  const [remaining, setRemaining] = useState(getRemaining(createdAt));
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const tick = () => setRemaining(getRemaining(createdAt));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [createdAt]);

  async function handleDelete() {
    if (!confirm("Voulez-vous vraiment supprimer cette demande ?")) return;
    setDeleting(true);
    const result = await deleteRequest(requestId);
    if (result.error) {
      alert(result.error);
      setDeleting(false);
    } else {
      router.push("/patient/dashboard");
    }
  }

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${remaining.expired ? "bg-stone-100" : "bg-blue-50"}`}>
            <Clock className={`w-5 h-5 ${remaining.expired ? "text-stone-400" : "text-blue-600"}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-stone-700">
              {remaining.expired
                ? "Délai de modification expiré"
                : "Temps restant pour modifier"}
            </p>
            {!remaining.expired && (
              <p className="text-2xl font-bold text-blue-700 tabular-nums mt-0.5 tracking-tight">
                {pad(remaining.hours)}:{pad(remaining.minutes)}:{pad(remaining.seconds)}
              </p>
            )}
          </div>
        </div>

        {!remaining.expired && (
          <div className="flex gap-2">
            <Link
              href={`/patient/requests/${requestId}/edit`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1e3a5f] text-white text-sm font-medium hover:bg-[#2a4a73] transition-all shadow-sm"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Modifier
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-all disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {deleting ? "Suppression..." : "Supprimer"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
