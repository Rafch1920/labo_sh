import { z } from "zod/v4";

export const personalInfoSchema = z.object({
  patient_first_name: z.string().min(1, "Prénom requis"),
  patient_last_name: z.string().min(1, "Nom requis"),
  patient_dob: z.string().min(1, "Date de naissance requise"),
  patient_gender: z.string().min(1, "Genre requis"),
  patient_address: z.string().optional(),
  patient_phone: z.string().optional(),
});

export const medicalInfoSchema = z.object({
  physician_name: z.string().min(1, "Nom du médecin requis"),
  physician_address: z.string().optional(),
  physician_phone: z.string().optional(),
  physician_email: z.string().email("Email invalide").optional().or(z.literal("")),
  medical_remarks: z.string().optional(),
});

export const createRequestSchema = personalInfoSchema.merge(medicalInfoSchema);

export type PersonalInfoInput = z.infer<typeof personalInfoSchema>;
export type MedicalInfoInput = z.infer<typeof medicalInfoSchema>;
export type CreateRequestInput = z.infer<typeof createRequestSchema>;
