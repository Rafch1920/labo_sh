export const APP_NAME = "Lithiasis Bilan";
export const APP_DESCRIPTION = "Plateforme de gestion des analyses de lithiase urinaire";

export const REQUEST_STATUSES = [
  "DRAFT",
  "REQUEST_SUBMITTED",
  "STONE_IN_TRANSIT",
  "STONE_RECEIVED",
  "DOCUMENTS_UNDER_REVIEW",
  "INCOMPLETE_DOSSIER",
  "DOSSIER_VALIDATED",
  "ANALYSIS_IN_PROGRESS",
  "ANALYSIS_COMPLETED",
  "REPORT_IN_PREPARATION",
  "PENDING_DOCTOR_VALIDATION",
  "REPORT_REJECTED",
  "REPORT_VALIDATED",
  "RESULT_READY",
  "APPOINTMENT_SCHEDULED",
  "REPORT_COLLECTED",
] as const;

export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const APPOINTMENT_SLOT_DURATION_MINUTES = 15;

export const FILE_SIZE_LIMIT_BYTES = 50 * 1024 * 1024;

export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;

export const FILE_CATEGORIES = [
  "identity_document",
  "prescription",
  "medical_report",
  "stone_image",
  "additional",
] as const;

export type FileCategory = (typeof FILE_CATEGORIES)[number];
