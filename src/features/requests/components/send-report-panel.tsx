"use client";

import { useState, useRef } from "react";
import { useActionState } from "react";
import { Loader2, Send, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { sendReportToPatient } from "@/features/requests/lab-actions";

export function SendReportPanel({ requestId }: { requestId: string }) {
  const [file, setFile] = useState<{ name: string; path: string; size: number } | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const [state, action, pending] = useActionState(
    sendReportToPatient.bind(null, requestId),
    { error: null }
  );

  async function handleFilePick(files: FileList | null) {
    if (!files?.length) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setUploading(true);
    const f = files[0];
    const filePath = `${requestId}/report-final-${Date.now()}.pdf`;

    const { error } = await supabase.storage
      .from("request-documents")
      .upload(filePath, f, { contentType: "application/pdf", upsert: true });

    setUploading(false);

    if (error) {
      console.error("Upload error:", error.message);
      return;
    }

    setFile({ name: f.name, path: filePath, size: f.size });
  }

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

      {!file && (
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-teal-200 rounded-2xl p-8 text-center cursor-pointer hover:border-teal-400 hover:bg-teal-50/40 transition-all"
        >
          <Upload className="w-8 h-8 mx-auto text-teal-300 mb-2" />
          <p className="text-sm font-medium text-teal-700">
            {uploading ? "Upload en cours..." : "Cliquez pour sélectionner le PDF"}
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={(e) => handleFilePick(e.target.files)}
      />

      <form action={action} className="space-y-4">
        {file && (
          <>
            <input type="hidden" name="file_path" value={file.path} />
            <input type="hidden" name="file_name" value={file.name} />
            <input type="hidden" name="file_size" value={String(file.size)} />
          </>
        )}

        {file && (
          <>
            <p className="text-sm text-teal-700 text-center">
              {file.name} ({(file.size / 1024).toFixed(1)} Ko)
            </p>
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
          </>
        )}
      </form>

      <p className="text-xs text-teal-500 text-center">
        Le patient recevra une notification et pourra télécharger le PDF ou prendre rendez-vous.
      </p>
    </div>
  );
}
