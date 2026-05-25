import Link from "next/link";
import { ChevronLeft, Activity } from "lucide-react";
import { RequestForm } from "@/features/requests/components/request-form";

export default function NewRequestPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/patient/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-[#1e3a5f] transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Retour au tableau de bord
      </Link>

      <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
            <Activity className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1e3a5f] tracking-tight">
              Nouvelle demande d&apos;analyse
            </h1>
            <p className="text-sm text-stone-400 mt-0.5">
              Analyse morpho-constitutionnelle de calcul rénal
            </p>
          </div>
        </div>

        <RequestForm />
      </div>
    </div>
  );
}
