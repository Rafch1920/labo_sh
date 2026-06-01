-- ============================================================
-- Seed: Reset & Create test accounts
-- Exécuter dans Supabase Dashboard > SQL Editor
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

-- 2. Créer les comptes
-- La fonction crypt() nécessite l'extension pgcrypto (activée par défaut sur Supabase)
DO $$
DECLARE
  v_id UUID;
BEGIN
  -- ============================
  -- Médecin
  -- ============================
  v_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, confirmation_sent_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES ('00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', 'dr.marrakchi@labo.tn', crypt('123456789', gen_salt('bf')), now(), now(), '{"provider":"email","providers":["email"],"role":"doctor"}'::jsonb, '{}'::jsonb, now(), now());
  INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (gen_random_uuid(), v_id, jsonb_build_object('sub', v_id, 'email', 'dr.marrakchi@labo.tn'), 'email', now(), now(), now());
  INSERT INTO public.profiles (id, email, role, full_name)
  VALUES (v_id, 'dr.marrakchi@labo.tn', 'doctor', 'Dr. Marrakchi');

  -- ============================
  -- Admin laboratoire
  -- ============================
  v_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, confirmation_sent_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES ('00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', 'shayma@labo.tn', crypt('123456789', gen_salt('bf')), now(), now(), '{"provider":"email","providers":["email"],"role":"lab_admin"}'::jsonb, '{}'::jsonb, now(), now());
  INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (gen_random_uuid(), v_id, jsonb_build_object('sub', v_id, 'email', 'shayma@labo.tn'), 'email', now(), now(), now());
  INSERT INTO public.profiles (id, email, role, full_name)
  VALUES (v_id, 'shayma@labo.tn', 'lab_admin', 'Shayma');

  -- ============================
  -- Patient
  -- ============================
  v_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, confirmation_sent_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES ('00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', 'patient@labo.tn', crypt('123456789', gen_salt('bf')), now(), now(), '{"provider":"email","providers":["email"],"role":"patient"}'::jsonb, '{}'::jsonb, now(), now());
  INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (gen_random_uuid(), v_id, jsonb_build_object('sub', v_id, 'email', 'patient@labo.tn'), 'email', now(), now(), now());
  INSERT INTO public.profiles (id, email, role, full_name)
  VALUES (v_id, 'patient@labo.tn', 'patient', 'Patient Test');

  -- ============================
  -- Super Admin
  -- ============================
  v_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, confirmation_sent_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES ('00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', 'admin@labo.tn', crypt('123456789', gen_salt('bf')), now(), now(), '{"provider":"email","providers":["email"],"role":"super_admin"}'::jsonb, '{}'::jsonb, now(), now());
  INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (gen_random_uuid(), v_id, jsonb_build_object('sub', v_id, 'email', 'admin@labo.tn'), 'email', now(), now(), now());
  INSERT INTO public.profiles (id, email, role, full_name)
  VALUES (v_id, 'admin@labo.tn', 'super_admin', 'Super Admin');

END;
$$;

-- 3. Vérification
SELECT
  u.email,
  u.confirmed_at IS NOT NULL AS email_confirmed,
  u.app_metadata->>'role' AS app_role,
  p.role AS profile_role,
  p.full_name
FROM auth.users u
JOIN public.profiles p ON p.id = u.id
ORDER BY p.role;
