import { corsHeaders } from 'npm:@supabase/supabase-js@2.119.2/cors';
import { z } from 'npm:zod@3.23.8';

export const ARCHIVE = 'WIRED_Desktop_v0.27_Classifications_Connections.zip';
export const LINK_LIFETIME = 60;
const origins = new Set([
  'https://wiredtcg.com', 'https://www.wiredtcg.com',
  'https://wired-tcg.lovable.app',
  'https://id-preview--01a84b36-38b5-44f5-84e8-d310aea37c80.lovable.app',
  'http://localhost:8080',
]);
const schema = z.object({ password: z.string().min(1).max(256) }).strict();

export interface DownloadServices {
  password: string | undefined;
  checkRate: (key: string) => Promise<boolean>;
  signDownload: (filename: string, lifetime: number) => Promise<string>;
}

async function digest(value: string) {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)));
}

export async function handleDownload(req: Request, services: DownloadServices) {
  const origin = req.headers.get('origin');
  const headers = {
    ...corsHeaders,
    'Access-Control-Allow-Origin': origin && origins.has(origin) ? origin : 'https://wiredtcg.com',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    'Vary': 'Origin',
  };
  const reply = (status: number, body: object) => new Response(JSON.stringify(body), { status, headers });
  if (origin && !origins.has(origin)) return reply(403, { error: 'Access denied.' });
  if (req.method === 'OPTIONS') return new Response(null, { headers });
  if (req.method !== 'POST') return reply(405, { error: 'Method not allowed.' });
  if (!services.password) return reply(503, { error: 'Download temporarily unavailable.' });
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
    const key = Array.from(await digest(ip), b => b.toString(16).padStart(2, '0')).join('');
    if (!await services.checkRate(key)) return reply(429, { error: 'Too many attempts. Please wait a minute and try again.' });
    const body = await req.text();
    if (body.length > 2048) return reply(400, { error: 'Invalid request.' });
    let parsed;
    try { parsed = schema.safeParse(JSON.parse(body)); }
    catch { return reply(400, { error: 'Invalid request.' }); }
    if (!parsed.success) return reply(400, { error: 'Enter your download password.' });
    const [submitted, expected] = await Promise.all([digest(parsed.data.password), digest(services.password)]);
    let difference = 0;
    for (let i = 0; i < expected.length; i++) difference |= submitted[i] ^ expected[i];
    if (difference !== 0) return reply(401, { error: 'Incorrect password. Please try again.' });
    const url = await services.signDownload(ARCHIVE, LINK_LIFETIME);
    return reply(200, { url, filename: ARCHIVE });
  } catch {
    return reply(503, { error: 'Download temporarily unavailable. Please try again later.' });
  }
}