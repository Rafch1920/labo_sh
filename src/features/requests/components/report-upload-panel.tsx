"use client";

import { useState, useRef } from "react";
import { useActionState } from "react";
import { Upload, FileText, Loader2, Send, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { uploadReport } from "@/features/requests/lab-actions";

export function ReportUploadPanel({
  requestId,
  hasExistingReport,
}: {
  requestId: string;
  hasExistingReport: boolean;
}) {
  const [file, setFile] = useState<{ name: string; path: string; size: number } | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const [state, action, pending] = useActionState(
    uploadReport.bind(null, requestId),
    { error: null }
  );

  async function handleFilePick(files: FileList | null) {
    if (!files?.length) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const f = files[0];
    const fileId = crypto.randomUUID();
    const filePath = `${user.id}/report/${fileId}-${f.name}`;

    const { error } = await supabase.storage
      .from("request-documents")
      .upload(filePath, f);

    if (error) {
      console.error("Upload error:", error.message);
      return;
    }

    const objUrl = URL.createObjectURL(f);
    setPreview(objUrl);
    setFile({ name: f.name, path: filePath, size: f.size });
  }

  return (
    <div className="rounded-2xl border border-indigo-200/70 bg-gradient-to-br from-indigo-50 to-white p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-indigo-100">
          <FileText className="w-5 h-5 text-indigo-700" />
        </div>
        <div>
          <p className="font-medium text-indigo-900">Rapport d&apos;analyse</p>
          <p className="text-sm text-indigo-600/70">
            {hasExistingReport
              ? "Rapport déjà transmis — vous pouvez le remplacer"
              : "Ajoutez le bilan scanné pour l&apos;envoyer au médecin"}
          </p>
        </div>
      </div>

      {/* File pick area */}
      {!file && !hasExistingReport && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-indigo-200 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group"
        >
          <Upload className="w-8 h-8 mx-auto text-indigo-300 group-hover:text-indigo-500 transition-colors" />
          <p className="text-sm font-medium text-indigo-700 mt-2">Cliquez pour ajouter le rapport</p>
          <p className="text-xs text-indigo-400 mt-1">PDF, image — scan du bilan d&apos;analyse</p>
        </div>
      )}

      {/* File selected / preview */}
      {file && (
        <div className="rounded-xl border border-indigo-200 bg-white p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-50">
              {file.name.match(/\.(png|jpe?g|gif|webp)$/i) && preview ? (
                <img src={preview} alt="" className="w-10 h-10 rounded object-cover" />
              ) : (
                <FileText className="w-5 h-5 text-indigo-500" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-stone-700 truncate">{file.name}</p>
              <p className="text-xs text-stone-400">{(file.size / 1024).toFixed(1)} Ko</p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (preview) URL.revokeObjectURL(preview);
                setFile(null);
                setPreview(null);
              }}
              className="text-xs text-red-500 hover:text-red-600"
            >
              Retirer
            </button>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={(e) => handleFilePick(e.target.files)}
      />

      {/* Submit */}
      <form action={action}>
        {file && (
          <>
            <input type="hidden" name="file_path" value={file.path} />
            <input type="hidden" name="file_name" value={file.name} />
            <input type="hidden" name="file_size" value={String(file.size)} />
          </>
        )}

        {state?.error && (
          <p className="text-sm text-red-600 mb-2">{state.error}</p>
        )}

        {file && (
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
          >
            {pending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Transmettre au médecin
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </form>
    </div>
  );
}
