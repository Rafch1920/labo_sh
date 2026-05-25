import { RegisterForm } from "@/features/auth/components/register-form";

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Inscription</h1>
        <p className="text-muted-foreground text-sm">
          Créez votre compte patient
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
