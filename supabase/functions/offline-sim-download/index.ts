import { createClient } from 'npm:@supabase/supabase-js@2';
import { handleDownload } from './handler.ts';

Deno.serve(async (req) => {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const client = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  return handleDownload(req, {
    password: Deno.env.get('OFFLINE_SIM_DOWNLOAD_PASSWORD'),
    checkRate: async (clientKey) => {
      if (!client) throw new Error('Unavailable');
      const { data, error } = await client.rpc('check_offline_download_rate', { p_client_key: clientKey });
      if (error) throw new Error('Unavailable');
      return data === true;
    },
    signDownload: async (filename, lifetime) => {
      if (!client) throw new Error('Unavailable');
      const { data, error } = await client.storage.from('offline-simulator').createSignedUrl(filename, lifetime, { download: filename });
      if (error || !data?.signedUrl) throw new Error('Unavailable');
      return data.signedUrl;
    },
  });
});