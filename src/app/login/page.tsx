import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#f7f4f0] via-white to-[#e8f0f0] flex items-center justify-center">

      {/* Animated organic blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-24 -left-24 w-[500px] h-[500px] opacity-20"
          style={{
            background: "linear-gradient(135deg, #5eead4, #a5f3fc)",
            filter: "blur(60px)",
            animation: "blob 14s ease-in-out infinite",
          }}
        />
        <div
          className="absolute -bottom-32 -right-20 w-[450px] h-[450px] opacity-15"
          style={{
            background: "linear-gradient(135deg, #99f6e4, #67e8f9)",
            filter: "blur(60px)",
            animation: "blob 18s ease-in-out infinite 3s",
          }}
        />
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] opacity-10"
          style={{
            background: "linear-gradient(135deg, #fed7aa, #fda4af)",
            filter: "blur(60px)",
            animation: "blob 16s ease-in-out infinite 6s",
          }}
        />
        <div
          className="absolute top-[60%] left-[15%] w-[300px] h-[300px] opacity-10"
          style={{
            background: "linear-gradient(135deg, #bae6fd, #c7d2fe)",
            filter: "blur(60px)",
            animation: "blob 20s ease-in-out infinite 2s",
          }}
        />
      </div>

      {/* Subtle dots pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: "radial-gradient(circle, #0f172a 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Content */}
      <div className="relative w-full max-w-md px-4">
        {/* Brand */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 shadow-lg shadow-teal-200/50 mb-4 animate-float">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-stone-800 tracking-tight">
            Lithiasis Bilan
          </h1>
          <p className="text-sm text-stone-400 mt-1.5 font-light tracking-wide">
            Votre laboratoire d&apos;analyses — résultats en ligne
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl bg-white/80 backdrop-blur-xl p-8 shadow-xl shadow-stone-200/40 border border-white/60 animate-fade-in-up"
          style={{ animationDelay: "0.15s", animationFillMode: "both" }}
        >
          <LoginForm />
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-stone-300 mt-6 animate-fade-in-up tracking-wide"
          style={{ animationDelay: "0.3s", animationFillMode: "both" }}>
          &copy; {new Date().getFullYear()} Lithiasis Bilan &mdash; Plateforme médicale sécurisée
        </p>
      </div>
    </div>
  );
}
