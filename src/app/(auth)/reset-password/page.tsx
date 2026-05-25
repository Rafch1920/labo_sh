import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Mot de passe oublié</h1>
        <p className="text-muted-foreground text-sm">
          Recevez un lien de réinitialisation
        </p>
      </div>
      <ResetPasswordForm />
    </div>
  );
}
