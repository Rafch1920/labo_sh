"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

type ActionResult = { error: string | null };

export async function acceptAppointment(
  appointmentId: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié" };

  const admin = createAdminClient();

  const { error } = await admin
    .from("appointments")
    .update({ doctor_id: user.id })
    .eq("id", appointmentId);

  if (error) return { error: error.message };

  revalidatePath("/doctor/appointments");
  return { error: null };
}

export async function proposeSlots(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié" };

  const appointmentId = formData.get("appointment_id") as string;
  const d1 = formData.get("slot_1_date") as string;
  const t1 = formData.get("slot_1_time") as string;
  const d2 = formData.get("slot_2_date") as string;
  const t2 = formData.get("slot_2_time") as string;
  const d3 = formData.get("slot_3_date") as string;
  const t3 = formData.get("slot_3_time") as string;
  const slot1 = `${d1}T${t1}:00+01:00`;
  const slot2 = `${d2}T${t2}:00+01:00`;
  const slot3 = `${d3}T${t3}:00+01:00`;

  if (!slot1 || !slot2 || !slot3) {
    return { error: "Veuillez fournir 3 créneaux" };
  }

  const admin = createAdminClient();

  // Get appointment to find patient_id
  const { data: apt } = await admin
    .from("appointments")
    .select("patient_id, request_id, scheduled_at")
    .eq("id", appointmentId)
    .single();

  if (!apt) return { error: "Rendez-vous introuvable" };

  // Store proposals as JSON in notes
  const proposals = JSON.stringify({
    proposed_slots: [slot1, slot2, slot3],
    selected_index: null,
  });

  const { error } = await admin
    .from("appointments")
    .update({
      notes: proposals,
      doctor_id: user.id,
    })
    .eq("id", appointmentId);

  if (error) return { error: error.message };

  // Notify patient
  await admin.from("notifications").insert({
    user_id: apt.patient_id,
    type: "appointment_confirmation",
    title: "Nouveaux créneaux proposés",
    body: "Le médecin vous a proposé 3 créneaux pour votre rendez-vous. Veuillez choisir celui qui vous convient.",
    data: { appointment_id: appointmentId, request_id: apt.request_id },
  });

  revalidatePath("/doctor/appointments");
  return { error: null };
}

export async function selectSlot(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié" };

  const appointmentId = formData.get("appointment_id") as string;
  const slotIndex = parseInt(formData.get("slot_index") as string);

  const admin = createAdminClient();

  const { data: apt } = await admin
    .from("appointments")
    .select("notes, doctor_id")
    .eq("id", appointmentId)
    .single();

  if (!apt || !apt.notes) return { error: "Aucune proposition trouvée" };

  let proposals;
  try {
    proposals = JSON.parse(apt.notes);
  } catch {
    return { error: "Erreur de lecture des propositions" };
  }

  if (!proposals.proposed_slots?.[slotIndex]) {
    return { error: "Créneau invalide" };
  }

  const selectedSlot = proposals.proposed_slots[slotIndex];
  proposals.selected_index = slotIndex;

  await admin
    .from("appointments")
    .update({
      scheduled_at: selectedSlot,
      notes: JSON.stringify(proposals),
      status: "scheduled",
    })
    .eq("id", appointmentId);

  // Notify doctor
  if (apt.doctor_id) {
    await admin.from("notifications").insert({
      user_id: apt.doctor_id,
      type: "appointment_confirmation",
      title: "Créneau confirmé par le patient",
      body: `Le patient a choisi le créneau du ${new Date(selectedSlot).toLocaleDateString("fr-FR")} à ${new Date(selectedSlot).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}.`,
      data: { appointment_id: appointmentId },
    });
  }

  revalidatePath("/patient/appointments");
  revalidatePath("/doctor/appointments");
  return { error: null };
}
