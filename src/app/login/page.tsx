import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center">
      {/* Animated decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full opacity-[0.08]"
          style={{
            background: "radial-gradient(circle, #f59e0b 0%, transparent 70%)",
            animation: "pulse-orb 7s ease-in-out infinite",
          }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full opacity-[0.06]"
          style={{
            background: "radial-gradient(circle, #ec4899 0%, transparent 70%)",
            animation: "pulse-orb 9s ease-in-out infinite 1.5s",
          }}
        />
        <div
          className="absolute top-1/4 left-1/3 w-[300px] h-[300px] rounded-full opacity-[0.04]"
          style={{
            background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)",
            animation: "pulse-orb 11s ease-in-out infinite 3s",
          }}
        />
        {/* Floating geometric shapes */}
        <div className="absolute top-[20%] right-[12%] w-14 h-14 border-2 border-amber-200/30 rounded-2xl rotate-12"
          style={{ animation: "crystal-float 14s ease-in-out infinite" }} />
        <div className="absolute bottom-[30%] left-[8%] w-10 h-10 border-2 border-rose-200/30 rounded-xl -rotate-6"
          style={{ animation: "crystal-float 16s ease-in-out infinite 2.5s" }} />
        <div className="absolute top-[55%] right-[18%] w-20 h-20 border border-amber-200/20 rounded-[50%]"
          style={{ animation: "drift 22s ease-in-out infinite" }} />
        <div className="absolute bottom-[20%] right-[25%] w-8 h-8 border-2 border-sky-200/20 rounded-lg"
          style={{ animation: "crystal-float 18s ease-in-out infinite 4s" }} />
      </div>

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Content */}
      <div className="relative w-full max-w-md px-4 animate-fade-in-up">
        {/* Brand */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-rose-400 shadow-lg shadow-amber-200/50 mb-3">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-stone-800 tracking-tight">
            Lithiasis Bilan
          </h1>
          <p className="text-sm text-stone-400 font-light tracking-wide">
            Votre laboratoire d&apos;analises — résultats en ligne
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl p-8 shadow-xl shadow-stone-200/50"
        >
          <LoginForm />
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-stone-300 mt-6 tracking-wide">
          &copy; {new Date().getFullYear()} Lithiasis Bilan &mdash; Plateforme médicale sécurisée
        </p>
      </div>
    </div>
  );
}
