"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LogIn, Eye, EyeOff, AlertCircle } from "lucide-react";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    } catch {
      setError("Erreur de connexion au serveur");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Error */}
      {error && (
        <div
          className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300 animate-fade-in-up"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-white/60 text-xs font-medium uppercase tracking-wider">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="vous@exemple.fr"
          className="h-10 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-sky-400/50 focus:ring-sky-400/20 rounded-xl px-3"
        />
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-white/60 text-xs font-medium uppercase tracking-wider">
          Mot de passe
        </Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className="h-10 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-sky-400/50 focus:ring-sky-400/20 rounded-xl px-3 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/50 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={pending}
        className="w-full h-10 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-white font-medium shadow-lg shadow-sky-500/20 border-0 transition-all duration-300"
      >
        {pending ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Connexion en cours...</>
        ) : (
          <><LogIn className="w-4 h-4 mr-2" /> Se connecter</>
        )}
      </Button>

      {/* Links */}
      <div className="flex items-center justify-between pt-1">
        <a
          href="/register"
          className="text-xs text-white/30 hover:text-white/60 transition-colors"
        >
          Créer un compte
        </a>
        <a
          href="/reset-password"
          className="text-xs text-white/30 hover:text-white/60 transition-colors"
        >
          Mot de passe oublié ?
        </a>
      </div>
    </form>
  );
}
