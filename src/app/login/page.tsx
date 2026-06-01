import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0b1424] flex items-center justify-center">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, rgba(56,189,248,0.4) 0%, rgba(56,189,248,0) 70%)",
            animation: "pulse-orb 6s ease-in-out infinite",
          }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-[450px] h-[450px] rounded-full opacity-15"
          style={{
            background:
              "radial-gradient(circle, rgba(52,211,153,0.3) 0%, rgba(52,211,153,0) 70%)",
            animation: "pulse-orb 8s ease-in-out infinite 1s",
          }}
        />
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-[0.07]"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 70%)",
            animation: "pulse-orb 10s ease-in-out infinite 2s",
          }}
        />
        {/* Floating crystal shapes */}
        <div className="absolute top-[15%] left-[10%] w-16 h-16 border border-white/10 rounded-2xl rotate-12 opacity-20"
          style={{ animation: "crystal-float 12s ease-in-out infinite" }} />
        <div className="absolute top-[60%] right-[12%] w-12 h-12 border border-white/10 rounded-xl -rotate-6 opacity-15"
          style={{ animation: "crystal-float 15s ease-in-out infinite 2s" }} />
        <div className="absolute top-[30%] right-[20%] w-20 h-20 border border-white/10 rounded-[50%] opacity-[0.08]"
          style={{ animation: "drift 20s ease-in-out infinite" }} />
        <div className="absolute bottom-[25%] left-[8%] w-10 h-10 border border-white/10 rounded-lg opacity-10"
          style={{ animation: "crystal-float 18s ease-in-out infinite 4s" }} />
      </div>

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Content */}
      <div
        className="relative w-full max-w-md px-4 animate-fade-in-up"
      >
        {/* Brand */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400/20 to-emerald-400/20 border border-white/10 backdrop-blur-sm mb-4">
            <svg
              className="w-7 h-7 text-sky-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-white/90 tracking-tight">
            Lithiasis Bilan
          </h1>
          <p className="text-sm text-white/40 font-light tracking-wide">
            Espace sécurisé — Analyses &amp; Résultats
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl"
          style={{
            boxShadow:
              "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          <LoginForm />
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-white/20 mt-6 tracking-wide">
          &copy; {new Date().getFullYear()} Lithiasis Bilan &mdash; Plateforme médicale sécurisée
        </p>
      </div>
    </div>
  );
}
