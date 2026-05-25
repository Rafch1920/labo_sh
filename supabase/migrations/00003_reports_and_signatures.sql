-- ============================================================
-- Migration 00003: Reports, Signatures & QR tracking
-- ============================================================

-- 1. Signatures bucket (for lab signature PNG)
INSERT INTO storage.buckets (id, name, public)
VALUES ('signatures', 'signatures', false)
ON CONFLICT (id) DO NOTHING;

-- Lab admins + super admins can upload signatures
CREATE POLICY "Staff can manage signatures"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'signatures'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('lab_admin', 'super_admin')
  )
)
WITH CHECK (
  bucket_id = 'signatures'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('lab_admin', 'super_admin')
  )
);

-- Authenticated users can read signatures (for report generation)
CREATE POLICY "Authenticated users can view signatures"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'signatures');
