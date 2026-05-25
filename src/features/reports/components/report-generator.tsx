"use client";

import { useState, useActionState, useCallback, useEffect, useRef } from "react";
import { FileText, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff, ScanQrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { submitGeneratedReport } from "@/features/reports/actions";
import { generateReportPdf } from "@/features/reports/utils/generate-report-pdf";

type ReportGeneratorProps = {
  requestId: string;
  requestCode: string;
  patientName: string;
  patientDob: string;
  patientGender: string;
  patientEmail: string;
  physicianName: string;
  physicianEmail: string;
  analysisDate: string;
  medicalRemarks: string;
};

export function ReportGenerator(props: ReportGeneratorProps) {
  const [analysisResults, setAnalysisResults] = useState("");
  const [conclusion, setConclusion] = useState("");
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [signatureLoading, setSignatureLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [state, action, pending] = useActionState(
    submitGeneratedReport.bind(null, props.requestId),
    { error: null }
  );

  useEffect(() => {
    async function loadSignature() {
      try {
        const res = await fetch("/api/signature/latest");
        if (res.ok) {
          const data = await res.json();
          if (data.url) setSignatureUrl(data.url);
        }
      } catch { /* ignore */ }
      setSignatureLoading(false);
    }
    loadSignature();
  }, []);

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setPreviewUrl(null);
    setShowPreview(false);
    try {
      const pdfBlob = await generateReportPdf(
        {
          requestId: props.requestId,
          requestCode: props.requestCode,
          patientName: props.patientName,
          patientDob: props.patientDob,
          patientGender: props.patientGender,
          patientEmail: props.patientEmail,
          physicianName: props.physicianName,
          physicianEmail: props.physicianEmail,
          analysisDate: props.analysisDate,
          analysisResults,
          conclusion,
          medicalRemarks: props.medicalRemarks,
          signatureUrl: signatureUrl || "",
        },
        window.location.origin
      );

      const preview = URL.createObjectURL(pdfBlob);
      setPreviewUrl(preview);
      setShowPreview(true);

      const reader = new FileReader();
      reader.onload = () => {
        const b64 = reader.result as string;
        setPdfBase64(b64);
      };
      reader.readAsDataURL(pdfBlob);
    } catch (err) {
      console.error("Generation failed:", err);
    }
    setGenerating(false);
  }, [props, analysisResults, conclusion, signatureUrl]);

  // Auto-submit when pdfBase64 is set
  useEffect(() => {
    if (pdfBase64 && formRef.current && !pending && !state?.error) {
      const input = formRef.current.querySelector<HTMLInputElement>("input[name='pdf_base64']");
      if (input) input.value = pdfBase64;
      formRef.current.requestSubmit();
    }
  }, [pdfBase64, pending, state?.error]);

  return (
    <div
      className="rounded-2xl border border-teal-100/60 bg-white/70 backdrop-blur-sm p-6 shadow-lg space-y-5"
      style={{ boxShadow: "0 4px 24px rgba(13,148,136,0.06)" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-teal-600" />
          <h3 className="font-semibold text-teal-900">Générer le rapport d&apos;analyse</h3>
        </div>
        <div className="flex items-center gap-2">
          {signatureLoading ? (
            <span className="text-xs text-teal-400 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Signature...
            </span>
          ) : signatureUrl ? (
            <span className="text-xs text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Signature chargée
            </span>
          ) : (
            <span className="text-xs text-amber-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Aucune signature
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-teal-800">Résultats d&apos;analyse</label>
            <Textarea
              value={analysisResults}
              onChange={(e) => setAnalysisResults(e.target.value)}
              placeholder="Saisissez les résultats de l'analyse..."
              rows={8}
              className="border-teal-200 focus-visible:ring-teal-400 resize-none"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-teal-800">Conclusion</label>
            <Textarea
              value={conclusion}
              onChange={(e) => setConclusion(e.target.value)}
              placeholder="Conclusion médicale..."
              rows={3}
              className="border-teal-200 focus-visible:ring-teal-400 resize-none"
            />
          </div>
          {props.medicalRemarks && (
            <div className="rounded-xl bg-teal-50 border border-teal-100 p-3">
              <p className="text-xs font-medium text-teal-700 mb-1">Remarques médicales du patient</p>
              <p className="text-xs text-teal-600 whitespace-pre-wrap">{props.medicalRemarks}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2 border-t border-teal-100/40">
        <Button
          onClick={handleGenerate}
          disabled={generating || pending}
          className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white shadow-md shadow-teal-600/20"
        >
          {generating ? (
            <><Loader2 className="w-4 h-4 animate-spin mr-1.5" /> Génération...</>
          ) : (
            <><FileText className="w-4 h-4 mr-1.5" /> Générer le rapport PDF</>
          )}
        </Button>

        {previewUrl && (
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            className="border-teal-200 text-teal-700"
          >
            {showPreview ? <><EyeOff className="w-4 h-4 mr-1.5" /> Masquer</> : <><Eye className="w-4 h-4 mr-1.5" /> Aperçu</>}
          </Button>
        )}

        {state?.error && (
          <span className="text-sm text-rose-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" /> {state.error}
          </span>
        )}
      </div>

      {showPreview && previewUrl && (
        <div className="rounded-xl border border-teal-200 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-50 border-b border-teal-100 text-xs text-teal-600">
            <ScanQrCode className="w-3.5 h-3.5" />
            Aperçu du document — le QR code en haut à droite redirige vers la page de suivi
          </div>
          <iframe
            src={previewUrl}
            className="w-full h-[500px] bg-white"
            title="Aperçu du rapport"
          />
        </div>
      )}

      <form ref={formRef} action={action} className="hidden">
        <input type="hidden" name="pdf_base64" value="" readOnly />
        <input type="hidden" name="file_name" value={`rapport-${props.requestCode}.pdf`} readOnly />
      </form>
    </div>
  );
}
