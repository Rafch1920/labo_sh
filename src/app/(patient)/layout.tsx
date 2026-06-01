import Link from "next/link";
import { LayoutDashboard, Calendar, LogOut, Activity, Microscope, FlaskConical, Droplets, HeartPulse, Gem } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NotificationBell } from "@/features/notifications/components/notification-bell";

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "Patient";

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{
        background: `
          radial-gradient(ellipse at 20% 30%, rgba(30,58,95,0.08) 0%, transparent 55%),
          radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.06) 0%, transparent 45%),
          radial-gradient(ellipse at 50% 80%, rgba(245,158,11,0.05) 0%, transparent 50%),
          radial-gradient(ellipse at 70% 60%, rgba(30,58,95,0.04) 0%, transparent 40%),
          #f8f9fc
        `,
      }}
    >
      {/* Organic wave overlay */}
      <svg
        className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-[0.03]"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
      >
        <path d="M0,500 C360,300 720,700 1080,400 C1260,250 1440,450 1440,450 L1440,0 L0,0 Z" fill="#1e3a5f" />
        <path d="M0,600 C400,400 800,800 1200,500 C1320,400 1440,550 1440,550 L1440,0 L0,0 Z" fill="#3b82f6" />
      </svg>

      {/* Ambient orbs */}
      <div
        className="fixed top-[-12%] right-[-5%] w-[550px] h-[550px] rounded-full pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(30,58,95,0.25) 0%, transparent 65%)",
          animation: "pulse-orb 6s ease-in-out infinite",
        }}
      />
      <div
        className="fixed bottom-[-12%] left-[-5%] w-[450px] h-[450px] rounded-full pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 65%)",
          animation: "pulse-orb 6s ease-in-out 2s infinite",
        }}
      />
      <div
        className="fixed top-[40%] left-[50%] w-[350px] h-[350px] rounded-full pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 65%)",
          animation: "pulse-orb 6s ease-in-out 4s infinite",
        }}
      />

      {/* Floating medical icons */}
      <div className="fixed top-[6%] left-[5%] pointer-events-none z-0" style={{ animation: "float-icon 18s ease-in-out infinite" }}>
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full w-12 h-12" />
          <Microscope className="w-11 h-11 text-[#1e3a5f]/40 relative" />
        </div>
      </div>

      <div className="fixed top-[18%] right-[10%] pointer-events-none z-0" style={{ animation: "float-icon 20s ease-in-out -4s infinite" }}>
        <div className="relative">
          <div className="absolute inset-0 bg-blue-400/20 blur-xl rounded-full w-10 h-10" />
          <FlaskConical className="w-9 h-9 text-blue-600/35 relative" />
        </div>
      </div>

      <div className="fixed top-[55%] left-[1%] pointer-events-none z-0" style={{ animation: "float-icon 22s ease-in-out -9s infinite" }}>
        <div className="relative">
          <div className="absolute inset-0 bg-amber-400/20 blur-xl rounded-full w-10 h-10" />
          <Droplets className="w-10 h-10 text-amber-600/35 relative" />
        </div>
      </div>

      <div className="fixed top-[28%] right-[3%] pointer-events-none z-0" style={{ animation: "float-icon 19s ease-in-out -2s infinite" }}>
        <div className="relative">
          <div className="absolute inset-0 bg-red-400/15 blur-xl rounded-full w-12 h-12" />
          <HeartPulse className="w-12 h-12 text-red-500/30 relative" />
        </div>
      </div>

      <div className="fixed bottom-[15%] right-[12%] pointer-events-none z-0" style={{ animation: "float-icon 21s ease-in-out -6s infinite" }}>
        <div className="relative">
          <div className="absolute inset-0 bg-amber-400/20 blur-xl rounded-full w-9 h-9" />
          <Gem className="w-8 h-8 text-amber-600/40 relative" />
        </div>
      </div>

      <div className="fixed bottom-[25%] left-[6%] pointer-events-none z-0" style={{ animation: "float-icon 23s ease-in-out -11s infinite" }}>
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full w-10 h-10" />
          <Activity className="w-9 h-9 text-[#1e3a5f]/35 relative" />
        </div>
      </div>

      {/* Kidney SVG icon */}
      <div
        className="fixed top-[65%] right-[4%] pointer-events-none z-0"
        style={{ animation: "float-icon 25s ease-in-out -7s infinite" }}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full w-14 h-14" />
          <svg
            className="w-14 h-14 relative"
            viewBox="0 0 100 100"
            fill="none"
          >
            <path
              d="M70 15C80 25 85 40 82 55C79 70 70 80 58 85C46 90 35 88 28 82C21 76 18 65 22 55C26 45 35 38 45 35C55 32 65 33 70 15Z"
              stroke="#1e3a5f"
              strokeWidth="1.2"
              fill="#1e3a5f"
              opacity="0.25"
            />
            <path
              d="M30 20C20 30 15 45 18 60C21 75 30 85 42 90C54 95 65 92 72 86C79 80 82 70 78 60C74 50 65 43 55 40C45 37 35 38 30 20Z"
              stroke="#3b82f6"
              strokeWidth="1"
              fill="#3b82f6"
              opacity="0.15"
            />
          </svg>
        </div>
      </div>

      {/* Top shimmer */}
      <div className="fixed top-0 left-0 right-0 h-[1px] z-50 overflow-hidden pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(59,130,246,0,3), transparent)",
            animation: "shimmer-line 3s ease-in-out infinite",
          }}
        />
      </div>

      <header className="relative z-10 border-b border-blue-900/8 bg-white/70 backdrop-blur-xl sticky top-0">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/patient/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#1e3a5f] to-[#2a4a73] flex items-center justify-center shadow-sm">
              <Activity className="w-[18px] h-[18px] text-blue-300" />
            </div>
            <div>
              <span className="text-sm font-semibold tracking-tight text-[#1e3a5f]">
                Marrakchi LAB
              </span>
              <p className="text-[10px] text-blue-500/60 tracking-[0.15em] uppercase font-medium">
                Lithiase rénale
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              href="/patient/dashboard"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-stone-500 hover:text-[#1e3a5f] hover:bg-blue-50/70 transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Tableau de bord</span>
            </Link>
            <Link
              href="/patient/appointments"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-stone-500 hover:text-[#1e3a5f] hover:bg-blue-50/70 transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Rendez-vous</span>
            </Link>
            <div className="w-px h-5 bg-stone-200 mx-2" />
            <NotificationBell />
            <div className="flex items-center gap-2 pl-1">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#1e3a5f] to-[#2a4a73] flex items-center justify-center text-[11px] font-semibold text-blue-200 shadow-sm">
                {name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-stone-600 hidden sm:inline">{name}</span>
            </div>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-stone-400 hover:text-red-600 hover:bg-red-50 transition-all"
                title="Déconnexion"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </nav>
        </div>
      </header>

      <main className="relative z-10 flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        {children}
      </main>
    </div>
  );
}
