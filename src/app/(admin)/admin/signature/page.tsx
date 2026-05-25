"use client";

import { useState, useRef } from "react";
import { Upload, CheckCircle2, AlertCircle, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminSignaturePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/png")) {
      setResult({ success: false, message: "Seuls les fichiers PNG sont acceptés." });
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/signature/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ success: true, message: "Signature téléchargée avec succès !" });
        setFile(null);
        setPreview(null);
        if (inputRef.current) inputRef.current.value = "";
      } else {
        setResult({ success: false, message: data.error || "Erreur" });
      }
    } catch {
      setResult({ success: false, message: "Erreur réseau" });
    }
    setUploading(false);
  };

  return (
    <div className="space-y-8 max-w-xl mx-auto">
      <div className="flex items-center gap-3 animate-fade-in-up">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <ImageIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Signature du laboratoire</h1>
          <p className="text-sm text-stone-600/70">
            Téléchargez votre signature PNG pour l&apos;ajouter aux rapports générés
          </p>
        </div>
      </div>

      <div
        className="rounded-2xl border border-amber-100/60 bg-white/70 backdrop-blur-sm p-6 shadow-lg animate-fade-in-up-delay-1 space-y-5"
        style={{ boxShadow: "0 4px 24px rgba(217,119,6,0.06)" }}
      >
        {/* Drop zone */}
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-amber-200 rounded-2xl p-8 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/40 transition-all"
        >
          {preview ? (
            <img
              src={preview}
              alt="Aperçu signature"
              className="max-h-32 mx-auto object-contain"
            />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-10 h-10 text-amber-300" />
              <p className="text-sm font-medium text-amber-700">
                Cliquez pour sélectionner votre signature
              </p>
              <p className="text-xs text-amber-500">Format PNG uniquement</p>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/png"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {file && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-100">
            <div className="flex items-center gap-2 text-sm text-amber-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              {file.name}
            </div>
            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-md"
            >
              {uploading ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-1.5" /> Téléchargement...</>
              ) : (
                <><Upload className="w-4 h-4 mr-1.5" /> Upload</>
              )}
            </Button>
          </div>
        )}

        {result && (
          <div className={`p-3 rounded-xl text-sm flex items-center gap-2 ${
            result.success ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
          }`}>
            {result.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {result.message}
          </div>
        )}
      </div>
    </div>
  );
}
