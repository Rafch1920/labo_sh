"use client";

import { useState, useEffect, useRef } from "react";
import { useActionState } from "react";
import { Upload, X, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { replaceDocuments } from "@/features/requests/document-actions";
import { docLabel, resolveFileCategory } from "@/lib/doc-labels";

type DocFile = {
  id: string;
  file_name: string;
  file_category: string;
  file_path: string;
  rejection_reason: string | null;
};

type NewFile = {
  id: string;
  file: File;
  category: string;
  path: string;
  url: string;
  oldDocId: string;
};

export function DocumentCorrectionPanel({
  requestId,
  rejectedDocs,
}: {
  requestId: string;
  rejectedDocs: DocFile[];
}) {
  const [newFiles, setNewFiles] = useState<NewFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedDoc, setSelectedDoc] = useState<DocFile | null>(null);
  const supabase = createClient();

  const [state, action, pending] = useActionState(
    replaceDocuments.bind(null, requestId),
    { error: null }
  );

  useEffect(() => {
    return () => {
      for (const f of newFiles) URL.revokeObjectURL(f.url);
    };
  }, [newFiles]);

  async function handleFilePick(doc: DocFile, files: FileList | null) {
    if (!files?.length) return;
    setUploadError(null);
    setUploading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setUploadError("Vous devez être connecté pour uploader un fichier.");
      setUploading(false);
      return;
    }

    const resolvedCategory = resolveFileCategory(doc.file_category, doc.file_path);
    const file = files[0];
    const fileId = crypto.randomUUID();
    const filePath = `${user.id}/${resolvedCategory}/${fileId}-${file.name}`;

    const { error } = await supabase.storage
      .from("request-documents")
      .upload(filePath, file);

    if (error) {
      setUploadError(`Échec de l'upload : ${error.message}`);
      setUploading(false);
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setNewFiles((prev) => {
      const existing = prev.find((f) => f.oldDocId === doc.id);
      if (existing) URL.revokeObjectURL(existing.url);
      return [
        ...prev.filter((f) => f.oldDocId !== doc.id),
        { id: fileId, file, category: resolvedCategory, path: filePath, url: previewUrl, oldDocId: doc.id },
      ];
    });

    setUploading(false);
    setSelectedDoc(null);
  }

  function removeFile(oldDocId: string) {
    setNewFiles((prev) => {
      const removed = prev.find((f) => f.oldDocId === oldDocId);
      if (removed) URL.revokeObjectURL(removed.url);
      return prev.filter((f) => f.oldDocId !== oldDocId);
    });
  }

  const replacedCount = newFiles.length;

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

      <div className="space-y-3 mb-5">
        {rejectedDocs.map((doc) => {
          const replacement = newFiles.find((f) => f.oldDocId === doc.id);
          return (
            <div
              key={doc.id}
              className={`rounded-xl border p-4 transition-colors ${
                replacement
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
                  {replacement && (
                    <p className="text-xs text-emerald-600 mt-1">
                      ✓ Nouveau fichier : {replacement.file.name}
                    </p>
                  )}
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  {replacement ? (
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
                      onClick={() => {
                        setSelectedDoc(doc);
                        fileInputRef.current?.click();
                      }}
                      disabled={uploading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-medium hover:bg-amber-700 transition-all disabled:opacity-50"
                    >
                      <Upload className="w-3 h-3" />
                      Remplacer
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.doc,.docx"
        className="hidden"
        onChange={(e) => {
          if (selectedDoc) handleFilePick(selectedDoc, e.target.files);
          e.target.value = "";
        }}
      />

      {uploadError && (
        <p className="text-sm text-red-600 mb-3">{uploadError}</p>
      )}

      <form action={action}>
        {newFiles.map((f) => (
          <div key={f.id}>
            <input type="hidden" name="file_paths" value={f.path} />
            <input type="hidden" name="file_names" value={f.file.name} />
            <input type="hidden" name="file_sizes" value={String(f.file.size)} />
            <input type="hidden" name="file_categories" value={f.category} />
            <input type="hidden" name="old_doc_ids" value={f.oldDocId} />
          </div>
        ))}

        {state?.error && (
          <p className="text-sm text-red-600 mb-3">{state.error}</p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={replacedCount === 0 || pending}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pending ? "Envoi en cours..." : "Soumettre les corrections"}
          </button>
          {replacedCount > 0 && (
            <p className="text-xs text-amber-700/60">
              {replacedCount} document{replacedCount > 1 ? "s" : ""} remplacé
              {replacedCount > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
