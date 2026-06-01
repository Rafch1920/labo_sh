"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock, User, ChevronRight } from "lucide-react";
import Link from "next/link";

type Appointment = {
  id: string;
  scheduled_at: string;
  status: string;
  doctor_id: string | null;
  analysis_requests?: { patient_first_name: string; patient_last_name: string } | null;
};

type Props = {
  appointments: Appointment[];
};

export function DoctorAppointmentTicker({ appointments }: Props) {
  const [visibleIndex, setVisibleIndex] = useState(0);

  // Auto-scroll: advance index every 4 seconds
  useEffect(() => {
    if (appointments.length <= 1) return;
    const interval = setInterval(() => {
      setVisibleIndex((prev) => (prev + 1) % appointments.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [appointments.length]);

  if (appointments.length === 0) return null;



  return (
    <div className="fixed top-20 right-4 z-50 w-80 space-y-2 animate-fade-in-up">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-semibold text-violet-500/60 uppercase tracking-widest">
          Rendez-vous cette semaine
        </span>
        <span className="text-[11px] text-violet-400">
          {visibleIndex + 1}/{appointments.length}
        </span>
      </div>

      <div className="relative overflow-hidden rounded-2xl" style={{ height: "160px" }}>
        {appointments.map((apt, i) => {
          const d = new Date(apt.scheduled_at);
          const patient = apt.analysis_requests;
          const isActive = i === visibleIndex;
          const isPast = d < new Date();

          return (
            <div
              key={apt.id}
              className="absolute inset-0 transition-all duration-700 ease-in-out"
              style={{
                transform: isActive ? "translateY(0)" : i < visibleIndex ? "translateY(-120%)" : "translateY(120%)",
                opacity: isActive ? 1 : 0,
              }}
            >
              <Link
                href="/doctor/appointments"
                className="block h-full rounded-2xl border border-violet-100/60 bg-white/90 backdrop-blur-xl p-4 shadow-xl hover:shadow-2xl hover:bg-white transition-all group"
                style={{ boxShadow: "0 8px 32px rgba(139,92,246,0.12)" }}
              >
                <div className="flex items-start gap-3 h-full">
                  <div className={`p-2.5 rounded-xl shrink-0 ${
                    isPast ? "bg-stone-50" : apt.doctor_id ? "bg-emerald-50" : "bg-amber-50"
                  }`}>
                    <User className={`w-5 h-5 ${
                      isPast ? "text-stone-400" : apt.doctor_id ? "text-emerald-500" : "text-amber-500"
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-violet-900 truncate group-hover:text-violet-700 transition-colors">
                      {patient?.patient_first_name} {patient?.patient_last_name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-violet-500">
                      <Calendar className="w-3 h-3" />
                      {d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 text-xs text-violet-500">
                      <Clock className="w-3 h-3" />
                      {d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-xs">
                      {apt.doctor_id ? (
                        <span className="text-emerald-600 font-medium">Confirmé</span>
                      ) : (
                        <span className="text-amber-600 font-medium">En attente</span>
                      )}
                      <ChevronRight className="w-3 h-3 text-violet-300 group-hover:text-violet-500 transition-colors ml-auto" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center gap-1.5">
        {appointments.map((_, i) => (
          <button
            key={i}
            onClick={() => setVisibleIndex(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              i === visibleIndex ? "bg-violet-500 w-4" : "bg-violet-200 hover:bg-violet-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
