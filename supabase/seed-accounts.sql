-- ============================================================
-- Seed: Reset & Create test accounts
-- Exécuter dans Supabase Dashboard > SQL Editor
-- Utilise la fonction auth.admin_create_user() officielle
-- ============================================================

-- 1. Supprimer toutes les données existantes (ordre FK)
DELETE FROM public.audit_logs;
DELETE FROM public.notifications;
DELETE FROM public.blocked_dates;
DELETE FROM public.doctor_availability;
DELETE FROM public.appointments;
DELETE FROM public.status_history;
DELETE FROM public.request_documents;
DELETE FROM public.analysis_requests;
DELETE FROM public.profiles;
DELETE FROM auth.identities;
DELETE FROM auth.users;

-- 2. Créer les comptes via la fonction auth.admin_create_user()
-- (gère correctement le hash du mot de passe et toutes les colonnes internes)
SELECT auth.admin_create_user(
  'dr.marrakchi@labo.tn',
  '123456789',
  jsonb_build_object('role', 'doctor'),
  true
);

INSERT INTO public.profiles (id, email, role, full_name)
SELECT id, 'dr.marrakchi@labo.tn', 'doctor', 'Dr. Marrakchi'
FROM auth.users WHERE email = 'dr.marrakchi@labo.tn';

SELECT auth.admin_create_user(
  'shayma@labo.tn',
  '123456789',
  jsonb_build_object('role', 'lab_admin'),
  true
);

INSERT INTO public.profiles (id, email, role, full_name)
SELECT id, 'shayma@labo.tn', 'lab_admin', 'Shayma'
FROM auth.users WHERE email = 'shayma@labo.tn';

SELECT auth.admin_create_user(
  'patient@labo.tn',
  '123456789',
  jsonb_build_object('role', 'patient'),
  true
);

INSERT INTO public.profiles (id, email, role, full_name)
SELECT id, 'patient@labo.tn', 'patient', 'Patient Test'
FROM auth.users WHERE email = 'patient@labo.tn';

SELECT auth.admin_create_user(
  'admin@labo.tn',
  '123456789',
  jsonb_build_object('role', 'super_admin'),
  true
);

INSERT INTO public.profiles (id, email, role, full_name)
SELECT id, 'admin@labo.tn', 'super_admin', 'Super Admin'
FROM auth.users WHERE email = 'admin@labo.tn';

-- 3. Vérification
SELECT
  u.email,
  u.email_confirmed_at IS NOT NULL AS email_confirmed,
  u.raw_app_meta_data->>'role' AS app_role,
  p.role AS profile_role,
  p.full_name
FROM auth.users u
JOIN public.profiles p ON p.id = u.id
ORDER BY p.role;
