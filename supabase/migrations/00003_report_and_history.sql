-- Report upload support + history enhancements

-- Add report storage fields to analysis_requests
ALTER TABLE analysis_requests
  ADD COLUMN report_file_path TEXT,
  ADD COLUMN report_uploaded_at TIMESTAMPTZ;

-- Allow lab/docs to update analysis_requests (report fields)
CREATE POLICY requests_staff_update ON analysis_requests
  FOR UPDATE USING (
    public.get_user_role() IN ('lab_admin', 'doctor', 'super_admin')
  );
