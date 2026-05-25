import { requireRole } from "@/lib/auth/helpers";
import { ROLES } from "@/config/roles";
import { Clock } from "lucide-react";

export default function DoctorAvailabilityPage() {
  requireRole([ROLES.DOCTOR, ROLES.SUPER_ADMIN]);
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 animate-fade-in-up">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
          <Clock className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-violet-900">Disponibilités</h1>
          <p className="text-sm text-violet-600/70">Gérez vos créneaux de consultation</p>
        </div>
      </div>
    </div>
  );
}
