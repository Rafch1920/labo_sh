import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#fcf9f5] via-[#f5f0eb] to-[#eef3f0] flex flex-col">
      {/* ── Animated ambient orbs ── */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] rounded-full"
          style={{
            background: "radial-gradient(circle at 40% 50%, rgba(13,148,136,0.10) 0%, transparent 60%)",
            animation: "aurora-drift 25s ease-in-out infinite",
          }}
        />
        <div
          className="absolute -bottom-1/3 -right-1/4 w-[700px] h-[700px] rounded-full"
          style={{
            background: "radial-gradient(circle at 60% 50%, rgba(217,119,6,0.07) 0%, transparent 55%)",
            animation: "aurora-drift 30s ease-in-out infinite 8s",
          }}
        />
        <div
          className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(30,58,95,0.05) 0%, transparent 50%)",
            animation: "aurora-drift 35s ease-in-out infinite 4s",
          }}
        />
        <div
          className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] rounded-full"
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(236,72,153,0.04) 0%, transparent 50%)",
            animation: "aurora-drift 28s ease-in-out infinite 12s",
          }}
        />
      </div>

      {/* ── Subtle dot pattern ── */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: "radial-gradient(circle, #0f172a 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* ── Main content ── */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          {/* ── Brand ── */}
          <div className="text-center mb-10">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-[18px] mb-5"
              style={{
                background: "linear-gradient(135deg, #0d9488, #0f766e)",
                animation: "logo-glow 4s ease-in-out infinite",
              }}
            >
              <svg className="w-8 h-8 text-white/95" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
            </div>
            <h1 className="text-[28px] font-bold text-stone-800 tracking-tight">
              Lithiasis Bilan
            </h1>
            <p className="text-[15px] text-stone-400 mt-1.5 font-light">
              Votre laboratoire d&apos;analyses — résultats en ligne
            </p>
          </div>

          {/* ── Card ── */}
          <div
            className="relative rounded-2xl bg-white/75 backdrop-blur-2xl p-8 shadow-[0_8px_40px_-8px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.02)]"
          >
            {/* Decorative top border */}
            <div
              className="absolute top-0 left-8 right-8 h-[2px] rounded-full"
              style={{
                background: "linear-gradient(90deg, #0d9488 0%, #d97706 50%, #0d9488 100%)",
                backgroundSize: "200% 100%",
                animation: "shimmer-border 6s ease-in-out infinite",
              }}
            />

            <LoginForm />
          </div>

          {/* ── Trust badge ── */}
          <div className="flex items-center justify-center gap-4 mt-8 text-xs text-stone-300">
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-stone-300" />
              Données chiffrées
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-stone-300" />
              Certifié HDS
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-stone-300" />
              Conformité RGPD
            </span>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="relative z-10 pb-6 text-center">
        <p className="text-xs text-stone-300/80 tracking-wide">
          &copy; {new Date().getFullYear()} Lithiasis Bilan &mdash; Plateforme médicale sécurisée
        </p>
      </div>
    </div>
  );
}
