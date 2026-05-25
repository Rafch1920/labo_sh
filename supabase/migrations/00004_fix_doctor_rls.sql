-- Fix doctor UPDATE policy: add WITH CHECK so doctors can transition
-- PENDING_DOCTOR_VALIDATION → REPORT_VALIDATED / REPORT_REJECTED
DROP POLICY IF EXISTS requests_doctor_update ON analysis_requests;

CREATE POLICY requests_doctor_update ON analysis_requests
  FOR UPDATE
  USING (
    public.get_user_role() = 'doctor'
    AND status = 'PENDING_DOCTOR_VALIDATION'
  )
  WITH CHECK (
    public.get_user_role() = 'doctor'
    AND status IN ('REPORT_VALIDATED', 'REPORT_REJECTED')
  );
