import type { Role, RequestStatus, AppointmentStatus, FileCategory, NotificationType } from "./enums";

export interface Profile {
  id: string;
  email: string;
  role: Role;
  full_name: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface AnalysisRequest {
  id: string;
  user_id: string;
  status: RequestStatus;
  patient_first_name: string;
  patient_last_name: string;
  patient_dob: string;
  patient_gender: string;
  patient_address: string | null;
  patient_phone: string | null;
  physician_name: string;
  physician_address: string | null;
  physician_phone: string | null;
  physician_email: string | null;
  medical_remarks: string | null;
  assigned_lab_admin_id: string | null;
  assigned_doctor_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface RequestDocument {
  id: string;
  request_id: string;
  file_category: FileCategory;
  file_name: string;
  file_path: string;
  file_size_bytes: number;
  mime_type: string;
  is_verified: boolean;
  uploaded_by: string;
  created_at: string;
}

export interface StatusHistory {
  id: string;
  request_id: string;
  from_status: RequestStatus | null;
  to_status: RequestStatus;
  changed_by: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface Appointment {
  id: string;
  request_id: string;
  patient_id: string;
  doctor_id: string | null;
  scheduled_at: string;
  status: AppointmentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}
