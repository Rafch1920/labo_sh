"use client";

import { useState, FormEvent, useRef } from "react";
import { Loader2, LogIn, Eye, EyeOff, AlertCircle, Mail, Lock } from "lucide-react";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [emailValue, setEmailValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

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
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-6">

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50/80 border border-red-200/60 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Email */}
      <div className="relative">
        <div
          className={`
            flex items-center gap-3 rounded-xl border bg-white/80 px-3.5 h-11
            transition-all duration-200
            ${emailFocused || emailValue
              ? "border-teal-400/60 shadow-[0_0_0_3px_rgba(13,148,136,0.06)]"
              : "border-stone-200 hover:border-stone-300"
            }
          `}
        >
          <Mail className={`w-4 h-4 shrink-0 transition-colors duration-200 ${
            emailFocused || emailValue ? "text-teal-500" : "text-stone-300"
          }`} />
          <div className="flex-1 relative">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={emailValue}
              onChange={(e) => setEmailValue(e.target.value)}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              className="w-full bg-transparent text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none h-5 pt-0 pb-0"
              placeholder="Adresse email"
            />
          </div>
        </div>
      </div>

      {/* Password */}
      <div className="relative">
        <div
          className={`
            flex items-center gap-3 rounded-xl border bg-white/80 px-3.5 h-11
            transition-all duration-200
            ${passwordFocused || passwordValue
              ? "border-teal-400/60 shadow-[0_0_0_3px_rgba(13,148,136,0.06)]"
              : "border-stone-200 hover:border-stone-300"
            }
          `}
        >
          <Lock className={`w-4 h-4 shrink-0 transition-colors duration-200 ${
            passwordFocused || passwordValue ? "text-teal-500" : "text-stone-300"
          }`} />
          <div className="flex-1 relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={passwordValue}
              onChange={(e) => setPasswordValue(e.target.value)}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              className="w-full bg-transparent text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none h-5 pt-0 pb-0"
              placeholder="Mot de passe"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="shrink-0 p-0.5 text-stone-300 hover:text-stone-500 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={pending}
        className="
          relative w-full h-11 rounded-xl font-medium text-sm text-white overflow-hidden
          transition-all duration-300
          disabled:opacity-60 disabled:cursor-not-allowed
          group
        "
        style={{
          background: "linear-gradient(135deg, #0d9488, #0f766e)",
          boxShadow: "0 4px 16px rgba(13,148,136,0.25)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "linear-gradient(135deg, #14b8a6, #0d9488)";
          e.currentTarget.style.boxShadow = "0 6px 24px rgba(13,148,136,0.35)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "linear-gradient(135deg, #0d9488, #0f766e)";
          e.currentTarget.style.boxShadow = "0 4px 16px rgba(13,148,136,0.25)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
            transform: "skewX(-20deg)",
          }}
        />
        <span className="relative z-10 flex items-center justify-center gap-2">
          {pending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Connexion en cours...</>
          ) : (
            <><LogIn className="w-4 h-4" /> Se connecter</>
          )}
        </span>
      </button>

      {/* Links */}
      <div className="flex items-center justify-between pt-1">
        <a
          href="/register"
          className="text-sm text-stone-400 hover:text-teal-600 transition-colors duration-200 relative"
        >
          Créer un compte
          <span className="absolute bottom-0 left-0 w-0 h-px bg-teal-500 transition-all duration-300 group-hover:w-full" />
        </a>
        <a
          href="/reset-password"
          className="text-sm text-stone-400 hover:text-teal-600 transition-colors duration-200"
        >
          Mot de passe oublié&nbsp;?
        </a>
      </div>
    </form>
  );
}
