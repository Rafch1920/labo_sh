"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });

      const data = await res.json();
      console.log("Login response:", data);

      if (data.error) {
        setError(data.error);
        setPending(false);
        return;
      }

      if (data.redirect) {
        window.location.href = data.redirect;
      } else {
        setError("Aucune redirection reçue");
        setPending(false);
      }
    } catch (err) {
      console.error("Login fetch error:", err);
      setError("Erreur de connexion au serveur");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {error && (
        <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md">
          {error}
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
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Connexion..." : "Se connecter"}
      </Button>
      <p className="text-sm text-center text-muted-foreground">
        <a href="/register" className="underline hover:text-primary">
          Créer un compte
        </a>
        {" | "}
        <a href="/reset-password" className="underline hover:text-primary">
          Mot de passe oublié
        </a>
      </p>
    </form>
  );
}
