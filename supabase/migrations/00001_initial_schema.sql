-- ============================================================
-- Lithiasis Bilan Management Platform - Initial Schema
-- ============================================================

-- 1. ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('patient', 'lab_admin', 'doctor', 'super_admin');

CREATE TYPE request_status AS ENUM (
  'DRAFT',
  'REQUEST_SUBMITTED',
  'STONE_IN_TRANSIT',
  'STONE_RECEIVED',
  'DOCUMENTS_UNDER_REVIEW',
  'INCOMPLETE_DOSSIER',
  'DOSSIER_VALIDATED',
  'ANALYSIS_IN_PROGRESS',
  'ANALYSIS_COMPLETED',
  'REPORT_IN_PREPARATION',
  'PENDING_DOCTOR_VALIDATION',
  'REPORT_REJECTED',
  'REPORT_VALIDATED',
  'RESULT_READY',
  'APPOINTMENT_SCHEDULED',
  'REPORT_COLLECTED'
);

CREATE TYPE appointment_status AS ENUM ('scheduled', 'completed', 'cancelled', 'missed');

CREATE TYPE file_category AS ENUM (
  'identity_document',
  'prescription',
  'medical_report',
  'stone_image',
  'additional'
);

CREATE TYPE notification_type AS ENUM (
  'status_change',
  'appointment_confirmation',
  'appointment_reminder',
  'document_request',
  'report_ready'
);

-- 2. TABLES
-- ============================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'patient',
  full_name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE analysis_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status request_status NOT NULL DEFAULT 'DRAFT',

  -- Patient info
  patient_first_name TEXT NOT NULL,
  patient_last_name TEXT NOT NULL,
  patient_dob DATE NOT NULL,
  patient_gender TEXT NOT NULL,
  patient_address TEXT,
  patient_phone TEXT,

  -- Physician info
  physician_name TEXT NOT NULL,
  physician_address TEXT,
  physician_phone TEXT,
  physician_email TEXT,

  -- Medical
  medical_remarks TEXT,

  -- Assignment
  assigned_lab_admin_id UUID REFERENCES profiles(id),
  assigned_doctor_id UUID REFERENCES profiles(id),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE request_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES analysis_requests(id) ON DELETE CASCADE,
  file_category file_category NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES analysis_requests(id) ON DELETE CASCADE,
  from_status request_status,
  to_status request_status NOT NULL,
  changed_by UUID NOT NULL REFERENCES profiles(id),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES analysis_requests(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES profiles(id),
  doctor_id UUID REFERENCES profiles(id),
  scheduled_at TIMESTAMPTZ NOT NULL,
  status appointment_status NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE doctor_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. INDEXES
-- ============================================================

CREATE INDEX idx_requests_user_id ON analysis_requests(user_id);
CREATE INDEX idx_requests_status ON analysis_requests(status);
CREATE INDEX idx_requests_assigned_lab ON analysis_requests(assigned_lab_admin_id);
CREATE INDEX idx_requests_assigned_doctor ON analysis_requests(assigned_doctor_id);
CREATE INDEX idx_documents_request_id ON request_documents(request_id);
CREATE INDEX idx_status_history_request_id ON status_history(request_id);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_scheduled ON appointments(scheduled_at);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_availability_doctor ON doctor_availability(doctor_id);

-- 4. ROW-LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;

-- Profiles: users see own; lab/doctor/admin see all
CREATE POLICY profiles_self ON profiles
  FOR ALL USING (id = auth.uid());

CREATE POLICY profiles_staff_view ON profiles
  FOR SELECT USING (
    public.get_user_role() IN ('lab_admin', 'doctor', 'super_admin')
  );

-- Analysis requests: patient sees own; lab/admin sees all; doctor sees assigned + pending validation
CREATE POLICY requests_patient ON analysis_requests
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY requests_lab_view ON analysis_requests
  FOR SELECT USING (
    public.get_user_role() IN ('lab_admin', 'super_admin')
  );

CREATE POLICY requests_lab_update ON analysis_requests
  FOR UPDATE USING (
    public.get_user_role() IN ('lab_admin', 'super_admin')
  );

CREATE POLICY requests_doctor_view ON analysis_requests
  FOR SELECT USING (
    public.get_user_role() = 'doctor'
    AND (status = 'PENDING_DOCTOR_VALIDATION' OR assigned_doctor_id = auth.uid())
  );

CREATE POLICY requests_doctor_update ON analysis_requests
  FOR UPDATE USING (
    public.get_user_role() = 'doctor'
    AND status = 'PENDING_DOCTOR_VALIDATION'
  );

-- Documents: patient sees own; lab/admin sees all; doctor sees validated
CREATE POLICY documents_patient ON request_documents
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM analysis_requests WHERE id = request_id AND user_id = auth.uid())
  );

CREATE POLICY documents_staff ON request_documents
  FOR SELECT USING (
    public.get_user_role() IN ('lab_admin', 'super_admin')
  );

CREATE POLICY documents_doctor ON request_documents
  FOR SELECT USING (
    public.get_user_role() = 'doctor'
    AND EXISTS (
      SELECT 1 FROM analysis_requests WHERE id = request_id
      AND status IN ('PENDING_DOCTOR_VALIDATION', 'REPORT_VALIDATED', 'RESULT_READY')
    )
  );

-- Status history: same as requests
CREATE POLICY status_history_patient ON status_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM analysis_requests WHERE id = request_id AND user_id = auth.uid())
  );

CREATE POLICY status_history_staff ON status_history
  FOR SELECT USING (
    public.get_user_role() IN ('lab_admin', 'doctor', 'super_admin')
  );

-- Appointments: patient sees own; staff sees relevant
CREATE POLICY appointments_patient ON appointments
  FOR ALL USING (patient_id = auth.uid());

CREATE POLICY appointments_staff ON appointments
  FOR SELECT USING (
    public.get_user_role() IN ('lab_admin', 'doctor', 'super_admin')
  );

-- Notifications: own only
CREATE POLICY notifications_self ON notifications
  FOR ALL USING (user_id = auth.uid());

-- Audit logs: admin only
CREATE POLICY audit_logs_admin ON audit_logs
  FOR SELECT USING (
    public.get_user_role() = 'super_admin'
  );

-- Doctor availability: doctor owns; admin manages
CREATE POLICY availability_doctor ON doctor_availability
  FOR ALL USING (doctor_id = auth.uid());

CREATE POLICY availability_admin ON doctor_availability
  FOR ALL USING (
    public.get_user_role() = 'super_admin'
  );

-- 5. TRIGGER FUNCTIONS
-- ============================================================

-- Profile creation is handled by the register Server Action (src/features/auth/actions/auth-actions.ts)
-- No database trigger needed

-- Helper function to get user role without RLS recursion
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS public.user_role
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = ''
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Auto-update profile timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_requests_updated_at
  BEFORE UPDATE ON analysis_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Log status changes + create notifications
CREATE OR REPLACE FUNCTION log_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  notification_title TEXT;
  notification_body TEXT;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.status_history (request_id, from_status, to_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid());



    CASE NEW.status
      WHEN 'REQUEST_SUBMITTED' THEN
        notification_title := 'Demande soumise';
        notification_body := 'Votre demande d''analyse a été soumise avec succès.';
      WHEN 'STONE_RECEIVED' THEN
        notification_title := 'Échantillon reçu';
        notification_body := 'Votre calcul a été reçu par le laboratoire.';
      WHEN 'DOSSIER_VALIDATED' THEN
        notification_title := 'Dossier validé';
        notification_body := 'Votre dossier a été validé par le laboratoire.';
      WHEN 'ANALYSIS_IN_PROGRESS' THEN
        notification_title := 'Analyse en cours';
        notification_body := 'L''analyse de votre échantillon a commencé.';
      WHEN 'RESULT_READY' THEN
        notification_title := 'Résultat disponible';
        notification_body := 'Votre résultat d''analyse est disponible.';
      WHEN 'REPORT_REJECTED' THEN
        notification_title := 'Rapport rejeté';
        notification_body := 'Le rapport a besoin de corrections.';
      ELSE
        notification_title := 'Statut mis à jour';
        notification_body := 'Votre demande a été mise à jour.';
    END CASE;

    INSERT INTO public.notifications (user_id, type, title, body, data)
    VALUES (
      NEW.user_id,
      'status_change',
      notification_title,
      notification_body,
      jsonb_build_object('request_id', NEW.id, 'status', NEW.status)
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_request_status_change
  AFTER UPDATE OF status ON analysis_requests
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION log_status_change();
