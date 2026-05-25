export type Role = "patient" | "lab_admin" | "doctor" | "super_admin";

export type RequestStatus =
  | "DRAFT"
  | "REQUEST_SUBMITTED"
  | "STONE_IN_TRANSIT"
  | "STONE_RECEIVED"
  | "DOCUMENTS_UNDER_REVIEW"
  | "INCOMPLETE_DOSSIER"
  | "DOSSIER_VALIDATED"
  | "ANALYSIS_IN_PROGRESS"
  | "ANALYSIS_COMPLETED"
  | "REPORT_IN_PREPARATION"
  | "PENDING_DOCTOR_VALIDATION"
  | "REPORT_REJECTED"
  | "REPORT_VALIDATED"
  | "RESULT_READY"
  | "APPOINTMENT_SCHEDULED"
  | "REPORT_COLLECTED";

export type AppointmentStatus = "scheduled" | "completed" | "cancelled" | "missed";

export type FileCategory =
  | "identity_document"
  | "prescription"
  | "medical_report"
  | "stone_image"
  | "additional";

export type NotificationType =
  | "status_change"
  | "appointment_confirmation"
  | "appointment_reminder"
  | "document_request"
  | "report_ready";
