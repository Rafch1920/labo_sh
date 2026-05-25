import { requireAuth } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Activity,
  Plus,
  Clock,
  CheckCircle2,
  ArrowRight,
  Droplets,
} from "lucide-react";
import { StatusBadge } from "@/features/requests/components/status-badge";
import { RequestPathMini } from "@/features/requests/components/request-path";

export default async function PatientDashboardPage() {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: requests, count } = await supabase
    .from("analysis_requests")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const pendingCount =
    requests?.filter((r) => !["REPORT_COLLECTED", "DRAFT"].includes(r.status))
      .length ?? 0;

  const completedCount =
    requests?.filter((r) => ["REPORT_COLLECTED"].includes(r.status)).length ??
    0;

  const name =
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Patient";

  return (
    <div className="space-y-10">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-blue-600/70 tracking-wide">
            <Activity className="w-4 h-4 text-blue-500" />
            Marrakchi LAB
          </div>
          <h1 className="text-3xl font-bold text-[#1e3a5f] mt-2 tracking-tight">
            Bonjour, {name}
          </h1>
          <p className="text-stone-500 mt-1.5 max-w-lg">
            Suivez vos demandes d&apos;analyse de lithiase rénale en toute simplicité.
          </p>
        </div>
        <Link
          href="/patient/requests/new"
          className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1e3a5f] text-white text-sm font-medium hover:bg-[#2a4a73] transition-all shadow-lg shadow-[#1e3a5f]/15 hover:shadow-[#1e3a5f]/25"
        >
          <Plus className="w-4 h-4" />
          Nouvelle demande
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-3">
        {[
          { icon: Activity, label: "Demandes", value: count ?? 0, iconClass: "text-blue-500", bgClass: "bg-blue-50" },
          { icon: Clock, label: "En cours", value: pendingCount, iconClass: "text-amber-500", bgClass: "bg-amber-50" },
          { icon: CheckCircle2, label: "Terminées", value: completedCount, iconClass: "text-stone-400", bgClass: "bg-stone-50" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="group rounded-2xl border border-stone-200 bg-white p-6 hover:shadow-lg hover:shadow-stone-200/60 hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-stone-400 font-medium">{stat.label}</p>
                <p className="text-4xl font-bold text-[#1e3a5f] tabular-nums mt-1.5 tracking-tight">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bgClass}`}>
                <stat.icon className={`w-5 h-5 ${stat.iconClass}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Presentation */}
      <div className="relative overflow-hidden rounded-2xl bg-[#1e3a5f] p-8">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-400/10 flex items-center justify-center">
              <Droplets className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <p className="text-white font-semibold text-lg">Analyse de lithiase rénale</p>
              <p className="text-blue-200/60 text-sm">Laboratoire Marrakchi LAB</p>
            </div>
          </div>
          <p className="text-blue-100/60 text-sm leading-relaxed">
            Analyse morpho-constitutionnelle des calculs rénaux par spectrophotométrie
            infrarouge et microscopie électronique. Chaque dossier est traité avec la plus
            grande rigueur scientifique par notre équipe de biologistes médicaux.
          </p>
        </div>
      </div>

      {/* Requests list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#1e3a5f]">Mes demandes</h2>
          {requests && requests.length > 0 && (
            <span className="text-xs text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full">
              {requests.length} demande{requests.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm">
          {!requests || requests.length === 0 ? (
            <div className="py-16 px-8 text-center">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-blue-50 flex items-center justify-center">
                <Activity className="w-7 h-7 text-blue-400" />
              </div>
              <p className="text-stone-600 font-medium">Aucune demande</p>
              <p className="text-sm text-stone-400 mt-1 mb-6">
                Créez votre première demande d&apos;analyse de lithiase rénale.
              </p>
              <Link
                href="/patient/requests/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1e3a5f] text-white text-sm font-medium hover:bg-[#2a4a73] transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Créer une demande
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {requests.map((req) => (
                <Link
                  key={req.id}
                  href={`/patient/requests/${req.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-blue-50/30 transition-all group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                      <Activity className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-stone-700 group-hover:text-[#1e3a5f] transition-colors truncate">
                        {req.patient_first_name} {req.patient_last_name}
                      </p>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {new Date(req.created_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <RequestPathMini status={req.status} />
                    <StatusBadge status={req.status} />
                    <ArrowRight className="w-4 h-4 text-stone-200 group-hover:text-stone-400 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
