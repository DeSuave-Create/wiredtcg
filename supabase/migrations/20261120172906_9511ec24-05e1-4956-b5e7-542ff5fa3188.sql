CREATE TABLE public.offline_download_attempts (client_key text PRIMARY KEY, attempts integer NOT NULL DEFAULT 1, window_start timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.offline_download_attempts TO service_role;
ALTER TABLE public.offline_download_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Block visitor access to offline archive" ON storage.objects AS RESTRICTIVE FOR ALL TO anon, authenticated USING (bucket_id <> 'offline-simulator') WITH CHECK (bucket_id <> 'offline-simulator');
CREATE FUNCTION public.check_offline_download_rate(p_client_key text) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE attempt_count integer;
BEGIN
  DELETE FROM public.offline_download_attempts WHERE window_start < now() - interval '1 day';
  INSERT INTO public.offline_download_attempts(client_key, attempts, window_start) VALUES (p_client_key, 1, now())
  ON CONFLICT (client_key) DO UPDATE SET
    attempts = CASE WHEN offline_download_attempts.window_start < now() - interval '1 minute' THEN 1 ELSE offline_download_attempts.attempts + 1 END,
    window_start = CASE WHEN offline_download_attempts.window_start < now() - interval '1 minute' THEN now() ELSE offline_download_attempts.window_start END
  RETURNING attempts INTO attempt_count;
  RETURN attempt_count <= 5;
END;
$$;
REVOKE ALL ON FUNCTION public.check_offline_download_rate(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_offline_download_rate(text) TO service_role;