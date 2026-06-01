"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useActionState } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  FileText,
  FileImage,
  File,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { validateReport, rejectReport } from "@/features/appointments/doctor-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { docLabel } from "@/lib/doc-labels";

type DocWithUrl = {
  id: string;
  file_category: string;
  file_path: string;
  file_name: string;
  mime_type: string;
  file_size_bytes: number;
  is_verified: boolean;
  public_url: string;
};

type DoctorReviewPanelProps = {
  requestId: string;
  patientDocs: DocWithUrl[];
  reportDocs: DocWithUrl[];
};

function getFileIcon(mime: string) {
  if (mime.startsWith("image/")) return FileImage;
  if (mime === "application/pdf") return FileText;
  return File;
}

function isImage(mime: string) {
  return mime.startsWith("image/");
}

function isPdf(mime: string) {
  return mime === "application/pdf";
}

export function DoctorReviewPanel({
  requestId,
  patientDocs,
  reportDocs,
}: DoctorReviewPanelProps) {
  const [selectedDoc, setSelectedDoc] = useState<DocWithUrl | null>(
    patientDocs[0] ?? reportDocs[0] ?? null
  );
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [panel, setPanel] = useState<"patient" | "report">("patient");

  const [actionDone, setActionDone] = useState<"validated" | "rejected" | null>(null);
  const prevValidatePending = useRef(false);
  const prevRejectPending = useRef(false);

  const [validateState, validateAction, validatePending] = useActionState(
    (_prev: { error: string | null }, formData: FormData) =>
      validateReport(requestId, formData),
    { error: null }
  );

  const [rejectState, rejectAction, rejectPending] = useActionState(
    (_prev: { error: string | null }, formData: FormData) =>
      rejectReport(requestId, formData),
    { error: null }
  );

  useEffect(() => {
    if (prevValidatePending.current && !validatePending && validateState && !validateState.error) {
      setActionDone("validated");
    }
    if (prevRejectPending.current && !rejectPending && rejectState && !rejectState.error) {
      setActionDone("rejected");
    }
    prevValidatePending.current = validatePending;
    prevRejectPending.current = rejectPending;
  }, [validatePending, rejectPending, validateState, rejectState]);

  const selectDoc = useCallback((doc: DocWithUrl) => {
    setSelectedDoc(doc);
    setScale(1);
    setRotation(0);
  }, []);

  const zoomIn = () => setScale((s) => Math.min(s + 0.25, 5));
  const zoomOut = () => setScale((s) => Math.max(s - 0.25, 0.25));
  const resetZoom = () => { setScale(1); setRotation(0); };
  const rotate = () => setRotation((r) => (r + 90) % 360);

  const docs = panel === "patient" ? patientDocs : reportDocs;

  return (
    <div className="space-y-5">
      {/* Main 3-panel layout */}
      <div className="grid grid-cols-[220px_1fr_180px] gap-4" style={{ minHeight: "480px" }}>
        {/* Left: Patient documents */}
        <div className="rounded-2xl border border-violet-100/60 bg-white/70 backdrop-blur-sm p-3 shadow-lg overflow-y-auto"
          style={{ boxShadow: "0 4px 24px rgba(139,92,246,0.06)", maxHeight: "540px" }}
        >
          <button
            onClick={() => { setPanel("patient"); if (patientDocs.length > 0) selectDoc(patientDocs[0]); }}
            className={`w-full text-left text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-colors ${
              panel === "patient"
                ? "text-violet-800 bg-violet-100/60"
                : "text-violet-500 hover:text-violet-700"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Documents ({patientDocs.length})
          </button>
          <div className="space-y-2">
            {patientDocs.map((doc) => {
              const Icon = getFileIcon(doc.mime_type);
              const isActive = selectedDoc?.id === doc.id;
              return (
                <button
                  key={doc.id}
                  onClick={() => selectDoc(doc)}
                  className={`w-full text-left rounded-xl p-2.5 transition-all border ${
                    isActive
                      ? "bg-violet-100/80 border-violet-200 shadow-sm"
                      : "bg-white/50 border-transparent hover:bg-violet-50/60 hover:border-violet-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      isImage(doc.mime_type)
                        ? "bg-violet-100"
                        : "bg-amber-50"
                    }`}>
                      {isImage(doc.mime_type) && doc.public_url ? (
                        <img
                          src={doc.public_url}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <Icon className={`w-5 h-5 ${
                          isPdf(doc.mime_type) ? "text-rose-400" : "text-violet-400"
                        }`} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-violet-900 truncate">
                        {docLabel(doc.file_category, doc.file_path)}
                      </p>
                      <p className="text-[10px] text-violet-500 truncate">
                        {(doc.file_size_bytes / 1024).toFixed(0)} Ko
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
            {patientDocs.length === 0 && (
              <p className="text-xs text-violet-400 text-center py-4">Aucun document</p>
            )}
          </div>
        </div>

        {/* Center: Preview */}
        <div className="rounded-2xl border border-violet-100/60 bg-white/70 backdrop-blur-sm shadow-lg flex flex-col overflow-hidden"
          style={{ boxShadow: "0 4px 24px rgba(139,92,246,0.06)" }}
        >
          {/* Zoom toolbar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-violet-100/40 bg-violet-50/30">
            <button
              onClick={() => {
                const idx = docs.findIndex((d) => d.id === selectedDoc?.id);
                if (idx > 0) selectDoc(docs[idx - 1]);
              }}
              disabled={!selectedDoc || docs.findIndex((d) => d.id === selectedDoc.id) <= 0}
              className="p-1.5 rounded-lg text-violet-400 hover:text-violet-700 hover:bg-violet-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1">
              <button onClick={zoomOut} className="p-1.5 rounded-lg text-violet-500 hover:text-violet-700 hover:bg-violet-100 transition-all" title="Zoom arrière">
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-medium text-violet-600 w-12 text-center tabular-nums">
                {Math.round(scale * 100)}%
              </span>
              <button onClick={zoomIn} className="p-1.5 rounded-lg text-violet-500 hover:text-violet-700 hover:bg-violet-100 transition-all" title="Zoom avant">
                <ZoomIn className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-violet-200 mx-1" />
              <button onClick={resetZoom} className="p-1.5 rounded-lg text-violet-500 hover:text-violet-700 hover:bg-violet-100 transition-all" title="Réinitialiser">
                <Maximize2 className="w-4 h-4" />
              </button>
              <button onClick={rotate} className="p-1.5 rounded-lg text-violet-500 hover:text-violet-700 hover:bg-violet-100 transition-all" title="Rotation">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => {
                const idx = docs.findIndex((d) => d.id === selectedDoc?.id);
                if (idx < docs.length - 1) selectDoc(docs[idx + 1]);
              }}
              disabled={!selectedDoc || docs.findIndex((d) => d.id === selectedDoc.id) >= docs.length - 1}
              className="p-1.5 rounded-lg text-violet-400 hover:text-violet-700 hover:bg-violet-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Preview area */}
          <div className="flex-1 flex items-center justify-center p-4 overflow-auto bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.03),transparent)]">
            {selectedDoc ? (
              <div
                className="transition-transform duration-200 ease-out"
                style={{
                  transform: `scale(${scale}) rotate(${rotation}deg)`,
                  maxWidth: "100%",
                  maxHeight: "100%",
                }}
              >
                {isImage(selectedDoc.mime_type) ? (
                  <img
                    src={selectedDoc.public_url}
                    alt={selectedDoc.file_name}
                    className="max-w-full max-h-[420px] rounded-xl shadow-md object-contain"
                    style={{ background: "repeating-conic-gradient(#f1f5f9 0% 25%, transparent 0% 50%) 0 0 / 20px 20px" }}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 p-8">
                    {isPdf(selectedDoc.mime_type) ? (
                      <FileText className="w-20 h-20 text-rose-400" />
                    ) : (
                      <File className="w-20 h-20 text-violet-400" />
                    )}
                    <p className="text-sm font-medium text-violet-800">{selectedDoc.file_name}</p>
                    <a
                      href={selectedDoc.public_url}
                      target="_blank"
                      className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-md shadow-violet-600/20 transition-all"
                    >
                      Ouvrir le fichier
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-violet-400">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Sélectionnez un document</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Lab report */}
        <div className="rounded-2xl border border-violet-100/60 bg-white/70 backdrop-blur-sm p-3 shadow-lg overflow-y-auto"
          style={{ boxShadow: "0 4px 24px rgba(139,92,246,0.06)", maxHeight: "540px" }}
        >
          <button
            onClick={() => { setPanel("report"); if (reportDocs.length > 0) selectDoc(reportDocs[0]); }}
            className={`w-full text-left text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-colors ${
              panel === "report"
                ? "text-violet-800 bg-violet-100/60"
                : "text-violet-500 hover:text-violet-700"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Rapport ({reportDocs.length})
          </button>
          <div className="space-y-2">
            {reportDocs.map((doc) => {
              const Icon = getFileIcon(doc.mime_type);
              const isActive = selectedDoc?.id === doc.id;
              return (
                <button
                  key={doc.id}
                  onClick={() => selectDoc(doc)}
                  className={`w-full text-left rounded-xl p-2.5 transition-all border ${
                    isActive
                      ? "bg-violet-100/80 border-violet-200 shadow-sm"
                      : "bg-white/50 border-transparent hover:bg-violet-50/60 hover:border-violet-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      isImage(doc.mime_type) ? "bg-emerald-100" : "bg-rose-50"
                    }`}>
                      {isImage(doc.mime_type) && doc.public_url ? (
                        <img
                          src={doc.public_url}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <Icon className={`w-5 h-5 ${
                          isPdf(doc.mime_type) ? "text-rose-400" : "text-emerald-400"
                        }`} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-violet-900 truncate">
                        Rapport
                      </p>
                      <p className="text-[10px] text-violet-500 truncate">
                        {(doc.file_size_bytes / 1024).toFixed(0)} Ko
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
            {reportDocs.length === 0 && (
              <p className="text-xs text-violet-400 text-center py-4">Aucun rapport</p>
            )}
          </div>
        </div>
      </div>

      {/* Validation result or panel */}
      <div className="rounded-2xl border border-violet-100/60 bg-white/70 backdrop-blur-sm p-5 shadow-lg"
        style={{ boxShadow: "0 4px 24px rgba(139,92,246,0.06)" }}
      >
        {actionDone === "validated" ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
              <ThumbsUp className="w-8 h-8 text-emerald-600" />
            </div>
            <p className="text-lg font-semibold text-emerald-800">Rapport validé</p>
            <p className="text-sm text-emerald-600 mt-1">
              Le rapport a été validé avec succès. Le laboratoire sera notifié.
            </p>
          </div>
        ) : actionDone === "rejected" ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-3">
              <ThumbsDown className="w-8 h-8 text-rose-600" />
            </div>
            <p className="text-lg font-semibold text-rose-800">Rapport refusé</p>
            <p className="text-sm text-rose-600 mt-1">
              Le rapport a été refusé. Le laboratoire sera notifié de la raison.
            </p>
          </div>
        ) : (
          <>
            {(validateState?.error || rejectState?.error) && (
              <div className="mb-3 p-3 text-sm bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
                {validateState?.error || rejectState?.error}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <form action={validateAction} className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                  Valider le rapport
                </div>
                <Textarea
                  name="medical_remarks"
                  placeholder="Remarques médicales (optionnel)"
                  rows={2}
                  className="border-violet-100 focus-visible:ring-violet-400"
                />
                <Button
                  type="submit"
                  disabled={validatePending}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/20 text-white"
                >
                  {validatePending ? "Validation..." : "Valider le rapport"}
                </Button>
              </form>

              <form action={rejectAction} className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-rose-700">
                  <XCircle className="w-4 h-4" />
                  Rejeter le rapport
                </div>
                <Textarea
                  name="rejection_reason"
                  placeholder="Motif du rejet"
                  rows={2}
                  required
                  className="border-violet-100 focus-visible:ring-violet-400"
                />
                <Button
                  type="submit"
                  disabled={rejectPending}
                  variant="destructive"
                  className="w-full shadow-md"
                >
                  {rejectPending ? "Rejet..." : "Rejeter le rapport"}
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
