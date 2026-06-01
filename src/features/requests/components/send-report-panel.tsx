"use client";

import { useRef } from "react";
import { useActionState } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendReportToPatient } from "@/features/requests/lab-actions";

export function SendReportPanel({ requestId }: { requestId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [state, action, pending] = useActionState(
    sendReportToPatient.bind(null, requestId),
    { error: null }
  );

  return (
    <div
      className="rounded-2xl border border-teal-100/60 bg-white/70 backdrop-blur-sm p-6 shadow-lg space-y-5"
      style={{ boxShadow: "0 4px 24px rgba(13,148,136,0.06)" }}
    >
      <div className="flex items-center gap-2">
        <Send className="w-5 h-5 text-teal-600" />
        <h3 className="font-semibold text-teal-900">Envoyer le bilan au patient</h3>
      </div>

      {state?.error && (
        <div className="p-3 text-sm bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
          {state.error}
        </div>
      )}

      <form action={action} className="space-y-4">
        <input
          ref={inputRef}
          type="file"
          name="file"
          accept=".pdf"
          className="w-full border-2 border-dashed border-teal-200 rounded-2xl p-8 text-center cursor-pointer hover:border-teal-400 hover:bg-teal-50/40 transition-all file:hidden"
          required
        />

        <Button
          type="submit"
          disabled={pending}
          className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white shadow-md"
        >
          {pending ? (
            <><Loader2 className="w-4 h-4 animate-spin mr-1.5" /> Envoi en cours...</>
          ) : (
            <><Send className="w-4 h-4 mr-1.5" /> Envoyer le bilan au patient</>
          )}
        </Button>
      </form>

      <p className="text-xs text-teal-500 text-center">
        Le patient recevra une notification et pourra télécharger le PDF ou prendre rendez-vous.
      </p>
    </div>
  );
}
