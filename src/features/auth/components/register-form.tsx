"use client";

import { useActionState } from "react";
import { register } from "@/features/auth/actions/auth-actions";
import { Button } from "@/components/ui/button";

export function RegisterForm() {
  const [state, action, pending] = useActionState(register, { error: null, success: false });

  if (state?.success) {
    return (
      <div className="text-center space-y-4 p-6">
        <div className="text-green-600 font-medium">
          Compte créé avec succès !
        </div>
        <p className="text-sm text-muted-foreground">
          Vérifiez votre email pour confirmer votre inscription.
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
        <label htmlFor="full_name" className="text-sm font-medium">
          Nom complet
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          required
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
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
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Inscription..." : "Créer un compte"}
      </Button>
      <p className="text-sm text-center text-muted-foreground">
        <a href="/login" className="underline hover:text-primary">
          Déjà un compte ? Se connecter
        </a>
      </p>
    </form>
  );
}
