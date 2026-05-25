-- Document review: add rejection reason, reviewer tracking
ALTER TABLE request_documents
  ADD COLUMN rejection_reason TEXT,
  ADD COLUMN reviewed_by UUID REFERENCES profiles(id),
  ADD COLUMN reviewed_at TIMESTAMPTZ;

-- Allow lab/docs to update documents they review
CREATE POLICY documents_staff_update ON request_documents
  FOR UPDATE USING (
    public.get_user_role() IN ('lab_admin', 'doctor', 'super_admin')
  );
