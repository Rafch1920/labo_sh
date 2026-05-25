import { notFound, redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ChevronLeft, Edit3 } from "lucide-react";
import { RequestForm } from "@/features/requests/components/request-form";

export default async function EditRequestPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: request } = await supabase
    .from("analysis_requests")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!request) notFound();

  // Verify editable window
  if (!["DRAFT", "REQUEST_SUBMITTED"].includes(request.status)) {
    redirect(`/patient/requests/${id}`);
  }

  const elapsed = Date.now() - new Date(request.created_at).getTime();
  if (elapsed > 4 * 60 * 60 * 1000) {
    redirect(`/patient/requests/${id}`);
  }

  const initialData = {
    patient_first_name: request.patient_first_name ?? "",
    patient_last_name: request.patient_last_name ?? "",
    patient_dob: request.patient_dob ?? "",
    patient_gender: request.patient_gender ?? "",
    patient_address: request.patient_address ?? "",
    patient_phone: request.patient_phone ?? "",
    physician_name: request.physician_name ?? "",
    physician_address: request.physician_address ?? "",
    physician_phone: request.physician_phone ?? "",
    physician_email: request.physician_email ?? "",
    medical_remarks: request.medical_remarks ?? "",
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href={`/patient/requests/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-[#1e3a5f] transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Retour à la demande
      </Link>

      <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
            <Edit3 className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1e3a5f] tracking-tight">
              Modifier la demande
            </h1>
            <p className="text-sm text-stone-400 mt-0.5">
              Demande #{id.slice(0, 8)}
            </p>
          </div>
        </div>

        <RequestForm initialData={initialData} requestId={id} />
      </div>
    </div>
  );
}
