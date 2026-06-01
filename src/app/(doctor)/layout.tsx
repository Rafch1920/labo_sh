import Link from "next/link";
import {
  ClipboardCheck,
  LogOut,
  Activity,
  Stethoscope,
  HeartPulse,
  Calendar,
  Clock,
  LayoutDashboard,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { logout } from "@/features/auth/actions/auth-actions";

export default async function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "Médecin";

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{
        background: `
          radial-gradient(ellipse at 20% 25%, rgba(139,92,246,0.08) 0%, transparent 55%),
          radial-gradient(ellipse at 80% 15%, rgba(99,102,241,0.06) 0%, transparent 45%),
          radial-gradient(ellipse at 50% 80%, rgba(16,185,129,0.05) 0%, transparent 50%),
          radial-gradient(ellipse at 70% 55%, rgba(139,92,246,0.04) 0%, transparent 40%),
          #f5f3ff
        `,
      }}
    >
      {/* Wave SVG overlay */}
      <svg
        className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-[0.025]"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
      >
        <path d="M0,450 C300,220 720,680 1080,350 C1260,200 1440,420 1440,420 L1440,0 L0,0 Z" fill="#7c3aed" />
        <path d="M0,550 C400,320 800,750 1200,450 C1320,350 1440,500 1440,500 L1440,0 L0,0 Z" fill="#6366f1" />
      </svg>

      {/* Ambient orbs */}
      <div
        className="fixed top-[-10%] right-[-4%] w-[500px] h-[500px] rounded-full pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 65%)",
          animation: "pulse-orb 6s ease-in-out infinite",
        }}
      />
      <div
        className="fixed bottom-[-10%] left-[-4%] w-[400px] h-[400px] rounded-full pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 65%)",
          animation: "pulse-orb 6s ease-in-out 2s infinite",
        }}
      />
      <div
        className="fixed top-[35%] left-[48%] w-[300px] h-[300px] rounded-full pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 65%)",
          animation: "pulse-orb 6s ease-in-out 4s infinite",
        }}
      />

      {/* Floating medical icons */}
      <div className="fixed top-[10%] left-[4%] pointer-events-none z-0" style={{ animation: "float-icon 18s ease-in-out infinite" }}>
        <div className="relative">
          <div className="absolute inset-0 bg-violet-400/20 blur-xl rounded-full w-12 h-12" />
          <Stethoscope className="w-11 h-11 text-violet-600/35 relative" />
        </div>
      </div>

      <div className="fixed top-[22%] right-[6%] pointer-events-none z-0" style={{ animation: "float-icon 20s ease-in-out -4s infinite" }}>
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-400/20 blur-xl rounded-full w-10 h-10" />
          <HeartPulse className="w-9 h-9 text-indigo-600/35 relative" />
        </div>
      </div>

      <div className="fixed top-[58%] left-[2%] pointer-events-none z-0" style={{ animation: "float-icon 22s ease-in-out -9s infinite" }}>
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-400/20 blur-xl rounded-full w-11 h-11" />
          <Activity className="w-10 h-10 text-emerald-600/35 relative" />
        </div>
      </div>

      <div className="fixed top-[32%] right-[3%] pointer-events-none z-0" style={{ animation: "float-icon 19s ease-in-out -2s infinite" }}>
        <div className="relative">
          <div className="absolute inset-0 bg-violet-400/15 blur-xl rounded-full w-12 h-12" />
          <Calendar className="w-12 h-12 text-violet-600/30 relative" />
        </div>
      </div>

      <div className="fixed bottom-[20%] right-[12%] pointer-events-none z-0" style={{ animation: "float-icon 21s ease-in-out -6s infinite" }}>
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-400/20 blur-xl rounded-full w-9 h-9" />
          <ClipboardCheck className="w-8 h-8 text-indigo-600/40 relative" />
        </div>
      </div>

      {/* Top shimmer */}
      <div className="fixed top-0 left-0 right-0 h-[1px] z-50 overflow-hidden pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.4), transparent)",
            animation: "shimmer-line 3s ease-in-out infinite",
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-30 border-b border-violet-900/8 bg-white/70 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/doctor/validations" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-sm">
              <Stethoscope className="w-[18px] h-[18px] text-violet-100" />
            </div>
            <div>
              <span className="text-sm font-semibold tracking-tight text-violet-900">
                Marrakchi LAB
              </span>
              <p className="text-[10px] text-violet-500/60 tracking-[0.15em] uppercase font-medium">
                Espace médecin
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              href="/doctor/dashboard"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-violet-700 hover:text-violet-900 hover:bg-violet-50/70 transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <Link
              href="/doctor/validations"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-violet-700 hover:text-violet-900 hover:bg-violet-50/70 transition-all"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Validations</span>
            </Link>
            <Link
              href="/doctor/availability"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-violet-700 hover:text-violet-900 hover:bg-violet-50/70 transition-all"
            >
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Disponibilités</span>
            </Link>
            <Link
              href="/doctor/appointments"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-violet-700 hover:text-violet-900 hover:bg-violet-50/70 transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Rendez-vous</span>
            </Link>
            <div className="w-px h-5 bg-violet-200 mx-2" />
            <div className="flex items-center gap-2 pl-1">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-[11px] font-semibold text-violet-100 shadow-sm">
                {name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-violet-700 hidden sm:inline">Dr. {name}</span>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-violet-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                title="Déconnexion"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </nav>
        </div>
      </header>

      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {children}
      </main>
    </div>
  );
}
