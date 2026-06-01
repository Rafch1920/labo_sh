"use client";

import { useState, useRef } from "react";
import { useActionState } from "react";
import { Upload, X, AlertTriangle, Check } from "lucide-react";
import { replaceDocuments } from "@/features/requests/document-actions";
import { docLabel } from "@/lib/doc-labels";

type DocFile = {
  id: string;
  file_name: string;
  file_category: string;
  file_path: string;
  rejection_reason: string | null;
};

export function DocumentCorrectionPanel({
  requestId,
  rejectedDocs,
}: {
  requestId: string;
  rejectedDocs: DocFile[];
}) {
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const [state, action, pending] = useActionState(
    replaceDocuments.bind(null, requestId),
    { error: null }
  );

  function handleFileSelect(docId: string) {
    const input = fileInputs.current[docId];
    if (!input || !input.files?.length) return;
    const file = input.files[0];
    setSelectedFiles((prev) => ({ ...prev, [docId]: file }));
    input.value = "";
  }

  function removeFile(docId: string) {
    setSelectedFiles((prev) => {
      const next = { ...prev };
      delete next[docId];
      return next;
    });
    const input = fileInputs.current[docId];
    if (input) input.value = "";
  }

  const replacedCount = Object.keys(selectedFiles).length;

  return (
    <div className="rounded-2xl border border-amber-200/70 bg-amber-50 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-xl bg-amber-100">
          <AlertTriangle className="w-5 h-5 text-amber-700" />
        </div>
        <div>
          <p className="font-medium text-amber-900">Documents à corriger</p>
          <p className="text-sm text-amber-700/60">
            Remplacez chaque document rejeté par une version valide
          </p>
        </div>
      </div>

      <form action={action} className="space-y-3 mb-4">
        {rejectedDocs.map((doc) => {
          const file = selectedFiles[doc.id];
          return (
            <div
              key={doc.id}
              className={`rounded-xl border p-4 transition-colors ${
                file
                  ? "border-emerald-200 bg-emerald-50/50"
                  : "border-red-200 bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-stone-800">
                    {docLabel(doc.file_category, doc.file_path)}
                    <span className="text-stone-400 font-normal">
                      {" "}— {doc.file_name}
                    </span>
                  </p>
                  <p className="text-xs text-red-500 mt-1">
                    Motif : {doc.rejection_reason ?? "Document non valide"}
                  </p>
                  {file && (
                    <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      {file.name}
                    </p>
                  )}
                </div>
                <div className="shrink-0">
                  {file ? (
                    <button
                      type="button"
                      onClick={() => removeFile(doc.id)}
                      className="p-1.5 rounded-lg bg-white border border-stone-200 text-stone-400 hover:text-red-500 hover:border-red-200 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputs.current[doc.id]?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-medium hover:bg-amber-700 transition-all cursor-pointer"
                    >
                      <Upload className="w-3 h-3" />
                      Remplacer
                    </button>
                  )}
                </div>
              </div>

              <input
                ref={(el) => { fileInputs.current[doc.id] = el; }}
                type="file"
                name={`file_${doc.id}`}
                accept="image/*,.pdf,.doc,.docx"
                className="hidden"
                onChange={() => handleFileSelect(doc.id)}
              />
              <input type="hidden" name="old_doc_ids" value={doc.id} />
              <input type="hidden" name={`cat_${doc.id}`} value={doc.file_category} />
            </div>
          );
        })}

        {state?.error && (
          <p className="text-sm text-red-600">{state.error}</p>
        )}

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={replacedCount === 0 || pending}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pending ? "Envoi en cours..." : "Soumettre les corrections"}
          </button>
          {replacedCount > 0 && (
            <p className="text-xs text-amber-700/60">
              {replacedCount} document{replacedCount > 1 ? "s" : ""} sélectionné{replacedCount > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
