import { fixDocumentCategories } from "@/lib/fix-doc-categories";
import Link from "next/link";

export default async function FixDocsPage() {
  const result = await fixDocumentCategories();

  return (
    <div className="max-w-lg mx-auto mt-12 space-y-6">
      <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-bold text-[#1e3a5f] mb-4">
          Correction des catégories de documents
        </h1>

        <div className="space-y-3">
          <p className="text-sm text-stone-600">
            Cette action analyse tous les documents marqu&eacute;s &laquo; Autre document &raquo;
            et tente de retrouver leur vraie cat&eacute;gorie depuis le chemin de stockage.
          </p>

          <div className={`rounded-xl p-4 ${result.errors.length === 0 ? "bg-emerald-50 border border-emerald-200" : "bg-amber-50 border border-amber-200"}`}>
            <p className="font-medium text-stone-800">
              {result.fixed} document{result.fixed > 1 ? "s" : ""} corrigé{result.fixed > 1 ? "s" : ""}
            </p>
            {result.errors.length > 0 && (
              <div className="mt-2 space-y-1">
                <p className="text-sm font-medium text-red-600">Erreurs :</p>
                {result.errors.map((e, i) => (
                  <p key={i} className="text-xs text-red-500">{e}</p>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Link
            href="/admin/audit-logs"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1e3a5f] text-white text-sm font-medium hover:bg-[#2a4a73] transition-all"
          >
            Retour &agrave; l&apos;admin
          </Link>
          <Link
            href="/lab/queue"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50 transition-all"
          >
            File d&apos;attente
          </Link>
        </div>
      </div>
    </div>
  );
}
