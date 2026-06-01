import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(circle, #f59e0b 0%, transparent 70%)", animation: "pulse-orb 7s ease-in-out infinite" }} />
        <div className="absolute -bottom-32 -left-32 w-[450px] h-[450px] rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(circle, #ec4899 0%, transparent 70%)", animation: "pulse-orb 9s ease-in-out infinite 1.5s" }} />
      </div>
      <div className="relative w-full max-w-md px-4 animate-fade-in-up">
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-3xl font-bold text-stone-800">Mot de passe oublié</h1>
          <p className="text-sm text-stone-400">Recevez un lien de réinitialisation</p>
        </div>
        <div className="rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl p-8 shadow-xl shadow-stone-200/50">
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  );
}
