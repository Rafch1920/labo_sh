-- Fix trigger to handle null auth.uid() (admin client updates)
-- When auth.uid() is null (service_role / admin client), skip the status_history
-- insert — the server action handles it manually instead.

CREATE OR REPLACE FUNCTION public.log_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  notification_title TEXT;
  notification_body TEXT;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Only insert history when there's an authenticated user session
    -- (admin client updates handle history insertion manually)
    IF auth.uid() IS NOT NULL THEN
      INSERT INTO public.status_history (request_id, from_status, to_status, changed_by)
      VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
    END IF;

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
