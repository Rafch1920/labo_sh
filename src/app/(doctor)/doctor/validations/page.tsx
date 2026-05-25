import { requireRole } from "@/lib/auth/helpers";
import { ROLES } from "@/config/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { ClipboardCheck, ArrowRight, CalendarDays } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DoctorValidationsPage() {
  await requireRole([ROLES.DOCTOR, ROLES.SUPER_ADMIN]);
  const supabase = createAdminClient();

  const { data: pending } = await supabase
    .from("analysis_requests")
    .select("*")
    .eq("status", "PENDING_DOCTOR_VALIDATION")
    .order("updated_at", { ascending: true });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <ClipboardCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-violet-900">Validations en attente</h1>
            <p className="text-sm text-violet-600/70">Examinez et validez les rapports d&apos;analyse</p>
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-violet-50 border border-violet-200/50 text-sm text-violet-700 font-medium">
          {pending?.length ?? 0} en attente
        </div>
      </div>

      <div
        className="rounded-2xl border border-violet-100/60 bg-white/70 backdrop-blur-sm overflow-hidden animate-fade-in-up-delay-1 shadow-lg"
        style={{ boxShadow: "0 4px 24px rgba(139,92,246,0.06)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-violet-100/40 bg-violet-50/40">
                {["Patient", "Date reçue", "Médecin prescripteur", ""].map((h) => (
                  <th key={h} className="text-left px-6 py-3.5 font-semibold text-violet-700 text-xs uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-violet-50">
              {pending?.map((req, i) => (
                <tr
                  key={req.id}
                  className="group hover:bg-violet-50/40 transition-colors"
                  style={{ animation: `fade-in-up 0.4s ease-out ${i * 0.03}s both` }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-[11px] font-semibold text-white shadow-sm">
                        {(req.patient_first_name?.charAt(0) || "?").toUpperCase()}
                        {(req.patient_last_name?.charAt(0) || "").toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-violet-900">
                          {req.patient_first_name} {req.patient_last_name}
                        </p>
                        <p className="text-xs text-violet-500">{req.patient_email || "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-violet-600 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5 text-violet-400" />
                      {new Date(req.updated_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-violet-700">{req.physician_name}</td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/doctor/requests/${req.id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-md shadow-violet-600/20 hover:shadow-lg hover:shadow-violet-600/30 transition-all"
                    >
                      Examiner
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
              {(!pending || pending.length === 0) && (
                <tr>
                  <td colSpan={4}>
                    <div className="py-16 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-4">
                        <ClipboardCheck className="w-8 h-8 text-violet-300" />
                      </div>
                      <p className="text-violet-700 font-medium">Aucune validation en attente</p>
                      <p className="text-sm text-violet-500 mt-1">
                        Tous les rapports ont été traités.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
