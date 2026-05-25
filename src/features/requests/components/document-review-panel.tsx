"use client";

import { useActionState, useState } from "react";
import { verifyDocument, rejectDocument } from "@/features/requests/document-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, FileText, Eye } from "lucide-react";
import { docLabel } from "@/lib/doc-labels";

type Document = {
  id: string;
  file_name: string;
  file_category: string;
  file_path: string;
  file_size_bytes: number;
  is_verified: boolean;
  rejection_reason: string | null;
  public_url: string;
};

type Props = {
  requestId: string;
  documents: Document[];
};

function DocumentCard({ doc, requestId }: { doc: Document; requestId: string }) {
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const [verifyState, verifyAction, verifyPending] = useActionState(
    (_prev: { error: string | null }) => verifyDocument(requestId, doc.id),
    { error: null }
  );

  const [rejectState, rejectAction, rejectPending] = useActionState(
    (_prev: { error: string | null }) => rejectDocument(requestId, doc.id, rejectReason),
    { error: null }
  );

  return (
    <div className={`rounded-lg border p-4 space-y-3 ${doc.is_verified ? "border-green-200 bg-green-50/30" : doc.rejection_reason ? "border-red-200 bg-red-50/30" : "border-stone-200"}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="p-2 rounded-lg bg-stone-100 shrink-0">
            <FileText className="w-5 h-5 text-stone-500" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-stone-700 truncate">
              {docLabel(doc.file_category, doc.file_path)}
            </p>
            <p className="text-xs text-stone-400 truncate">{doc.file_name}</p>
            <p className="text-[10px] text-stone-300">{(doc.file_size_bytes / 1024).toFixed(1)} Ko</p>
          </div>
        </div>
        <a href={doc.public_url} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm"><Eye className="w-3.5 h-3.5" /></Button>
        </a>
      </div>

      {doc.is_verified && (
        <div className="flex items-center gap-1.5 text-xs text-green-600">
          <CheckCircle className="w-3.5 h-3.5" /> Document vérifié
        </div>
      )}

      {doc.rejection_reason && (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-red-600">
            <XCircle className="w-3.5 h-3.5" /> Document refusé
          </div>
          <p className="text-xs text-red-500 bg-red-50 rounded-md px-2 py-1">{doc.rejection_reason}</p>
        </div>
      )}

      {!doc.is_verified && !doc.rejection_reason && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <form action={verifyAction}>
            {verifyState?.error && <p className="text-xs text-red-500 mb-1">{verifyState.error}</p>}
            <Button type="submit" disabled={verifyPending} variant="default" size="sm">
              {verifyPending ? "..." : "Approuver"}
            </Button>
          </form>
          {!showReject ? (
            <Button onClick={() => setShowReject(true)} variant="destructive" size="sm">
              Refuser
            </Button>
          ) : (
            <form action={rejectAction} className="flex items-start gap-2">
              <div className="space-y-1">
                <Textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Motif du refus..."
                  rows={2}
                  required
                  className="text-xs w-48"
                />
                {rejectState?.error && <p className="text-xs text-red-500">{rejectState.error}</p>}
              </div>
              <div className="flex gap-1 pt-0.5">
                <Button type="submit" disabled={rejectPending || !rejectReason} variant="destructive" size="sm">
                  {rejectPending ? "..." : "Confirmer"}
                </Button>
                <Button onClick={() => setShowReject(false)} variant="outline" size="sm">
                  Annuler
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export function DocumentReviewPanel({ requestId, documents }: Props) {
  const pending = documents.filter((d) => !d.is_verified && !d.rejection_reason);
  const verified = documents.filter((d) => d.is_verified);
  const rejected = documents.filter((d) => d.rejection_reason);

  if (documents.length === 0) return null;

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-stone-500">Vérification des documents</h3>
        <div className="flex items-center gap-3 text-xs text-stone-400">
          <span>{verified.length} approuvés</span>
          <span>{rejected.length} refusés</span>
          <span>{pending.length} en attente</span>
        </div>
      </div>

      {pending.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-medium text-amber-600">Documents à vérifier</p>
          {pending.map((doc) => (
            <DocumentCard key={doc.id} doc={doc} requestId={requestId} />
          ))}
        </div>
      )}

      {(pending.length === 0 && verified.length > 0) && (
        <div className="flex items-center gap-2 text-xs text-green-600">
          <CheckCircle className="w-4 h-4" />
          Tous les documents sont vérifiés
        </div>
      )}

      {rejected.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-red-600">Documents refusés</p>
          {rejected.map((doc) => (
            <div key={doc.id} className="text-xs text-stone-500 py-1">
              <div className="flex items-center gap-2">
                <XCircle className="w-3 h-3 text-red-400" />
                <span>{docLabel(doc.file_category, doc.file_path)} — {doc.file_name}</span>
              </div>
              <p className="ml-5 text-red-400 mt-0.5">{doc.rejection_reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
