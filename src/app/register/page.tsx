import { RegisterForm } from "@/features/auth/components/register-form";

export default function RegisterPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0b1424] flex items-center justify-center">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(56,189,248,0.3) 0%, rgba(56,189,248,0) 70%)", animation: "pulse-orb 6s ease-in-out infinite" }} />
        <div className="absolute -bottom-32 -left-32 w-[450px] h-[450px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, rgba(52,211,153,0.2) 0%, rgba(52,211,153,0) 70%)", animation: "pulse-orb 8s ease-in-out infinite 1s" }} />
      </div>

      <div className="relative w-full max-w-md px-4 animate-fade-in-up">
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-2xl font-semibold text-white/90">Créer un compte</h1>
          <p className="text-sm text-white/40">Espace patient sécurisé</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl"
          style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)" }}>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
