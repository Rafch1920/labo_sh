import Link from "next/link";
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  LogOut,
  Activity,
  Microscope,
  FlaskConical,
  Beaker,
  Dna,
  HeartPulse,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { logout } from "@/features/auth/actions/auth-actions";

export default async function LabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "Laboratoire";

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{
        background: `
          radial-gradient(ellipse at 15% 25%, rgba(13,148,136,0.08) 0%, transparent 55%),
          radial-gradient(ellipse at 85% 15%, rgba(6,182,212,0.06) 0%, transparent 45%),
          radial-gradient(ellipse at 40% 80%, rgba(245,158,11,0.05) 0%, transparent 50%),
          radial-gradient(ellipse at 70% 55%, rgba(13,148,136,0.04) 0%, transparent 40%),
          #f0fdfa
        `,
      }}
    >
      {/* Wave SVG overlay */}
      <svg
        className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-[0.025]"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
      >
        <path d="M0,450 C300,220 720,680 1080,350 C1260,200 1440,420 1440,420 L1440,0 L0,0 Z" fill="#0d9488" />
        <path d="M0,550 C400,320 800,750 1200,450 C1320,350 1440,500 1440,500 L1440,0 L0,0 Z" fill="#06b6d4" />
      </svg>

      {/* Ambient orbs */}
      <div
        className="fixed top-[-10%] right-[-4%] w-[500px] h-[500px] rounded-full pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(13,148,136,0.2) 0%, transparent 65%)",
          animation: "pulse-orb 6s ease-in-out infinite",
        }}
      />
      <div
        className="fixed bottom-[-10%] left-[-4%] w-[400px] h-[400px] rounded-full pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 65%)",
          animation: "pulse-orb 6s ease-in-out 2s infinite",
        }}
      />
      <div
        className="fixed top-[35%] left-[48%] w-[300px] h-[300px] rounded-full pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 65%)",
          animation: "pulse-orb 6s ease-in-out 4s infinite",
        }}
      />

      {/* Floating lab icons */}
      <div className="fixed top-[8%] left-[4%] pointer-events-none z-0" style={{ animation: "float-icon 18s ease-in-out infinite" }}>
        <div className="relative">
          <div className="absolute inset-0 bg-teal-400/20 blur-xl rounded-full w-12 h-12" />
          <Microscope className="w-11 h-11 text-teal-600/35 relative" />
        </div>
      </div>

      <div className="fixed top-[20%] right-[8%] pointer-events-none z-0" style={{ animation: "float-icon 20s ease-in-out -4s infinite" }}>
        <div className="relative">
          <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full w-10 h-10" />
          <FlaskConical className="w-9 h-9 text-cyan-600/35 relative" />
        </div>
      </div>

      <div className="fixed top-[60%] left-[1%] pointer-events-none z-0" style={{ animation: "float-icon 22s ease-in-out -9s infinite" }}>
        <div className="relative">
          <div className="absolute inset-0 bg-amber-400/20 blur-xl rounded-full w-11 h-11" />
          <Beaker className="w-10 h-10 text-amber-600/35 relative" />
        </div>
      </div>

      <div className="fixed top-[30%] right-[2%] pointer-events-none z-0" style={{ animation: "float-icon 19s ease-in-out -2s infinite" }}>
        <div className="relative">
          <div className="absolute inset-0 bg-teal-400/15 blur-xl rounded-full w-12 h-12" />
          <Dna className="w-12 h-12 text-teal-600/30 relative" />
        </div>
      </div>

      <div className="fixed bottom-[18%] right-[15%] pointer-events-none z-0" style={{ animation: "float-icon 21s ease-in-out -6s infinite" }}>
        <div className="relative">
          <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full w-9 h-9" />
          <HeartPulse className="w-8 h-8 text-cyan-600/40 relative" />
        </div>
      </div>

      <div className="fixed bottom-[28%] left-[5%] pointer-events-none z-0" style={{ animation: "float-icon 23s ease-in-out -11s infinite" }}>
        <div className="relative">
          <div className="absolute inset-0 bg-teal-400/20 blur-xl rounded-full w-10 h-10" />
          <Activity className="w-9 h-9 text-teal-600/35 relative" />
        </div>
      </div>

      {/* Kidney stone icon */}
      <div
        className="fixed top-[68%] right-[3%] pointer-events-none z-0"
        style={{ animation: "float-icon 25s ease-in-out -7s infinite" }}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-amber-400/20 blur-xl rounded-full w-14 h-14" />
          <svg className="w-14 h-14 relative" viewBox="0 0 100 100" fill="none">
            <path
              d="M70 15C80 25 85 40 82 55C79 70 70 80 58 85C46 90 35 88 28 82C21 76 18 65 22 55C26 45 35 38 45 35C55 32 65 33 70 15Z"
              stroke="#0d9488" strokeWidth="1.2" fill="#0d9488" opacity="0.25"
            />
            <path
              d="M30 20C20 30 15 45 18 60C21 75 30 85 42 90C54 95 65 92 72 86C79 80 82 70 78 60C74 50 65 43 55 40C45 37 35 38 30 20Z"
              stroke="#06b6d4" strokeWidth="1" fill="#06b6d4" opacity="0.15"
            />
          </svg>
        </div>
      </div>

      {/* Top shimmer */}
      <div className="fixed top-0 left-0 right-0 h-[1px] z-50 overflow-hidden pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(13,148,136,0.4), transparent)",
            animation: "shimmer-line 3s ease-in-out infinite",
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-30 border-b border-teal-900/8 bg-white/70 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/lab/queue" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-600 to-cyan-600 flex items-center justify-center shadow-sm">
              <Microscope className="w-[18px] h-[18px] text-teal-100" />
            </div>
            <div>
              <span className="text-sm font-semibold tracking-tight text-teal-900">
                Marrakchi LAB
              </span>
              <p className="text-[10px] text-teal-500/60 tracking-[0.15em] uppercase font-medium">
                Laboratoire d&apos;analyse
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              href="/lab/queue"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-teal-700 hover:text-teal-900 hover:bg-teal-50/70 transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">File d&apos;attente</span>
            </Link>
            <Link
              href="/lab/requests"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-teal-700 hover:text-teal-900 hover:bg-teal-50/70 transition-all"
            >
              <ClipboardList className="w-4 h-4" />
              <span className="hidden sm:inline">Demandes</span>
            </Link>
            <Link
              href="/lab/reports"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-teal-700 hover:text-teal-900 hover:bg-teal-50/70 transition-all"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Comptes-rendus</span>
            </Link>
            <div className="w-px h-5 bg-teal-200 mx-2" />
            <div className="flex items-center gap-2 pl-1">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-600 to-cyan-600 flex items-center justify-center text-[11px] font-semibold text-teal-100 shadow-sm">
                {name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-teal-700 hidden sm:inline">{name}</span>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-teal-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
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
