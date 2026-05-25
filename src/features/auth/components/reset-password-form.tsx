"use client";

import { useActionState } from "react";
import { resetPassword } from "@/features/auth/actions/auth-actions";
import { Button } from "@/components/ui/button";

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(resetPassword, { error: null, success: false });

  if (state?.success) {
    return (
      <div className="text-center space-y-4 p-6">
        <div className="text-green-600 font-medium">Email envoyé !</div>
        <p className="text-sm text-muted-foreground">
          Vérifiez votre boîte de réception pour le lien de réinitialisation.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md">
          {state.error}
        </div>
      )}
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Envoi..." : "Envoyer le lien"}
      </Button>
      <p className="text-sm text-center text-muted-foreground">
        <a href="/login" className="underline hover:text-primary">
          Retour à la connexion
        </a>
      </p>
    </form>
  );
}
