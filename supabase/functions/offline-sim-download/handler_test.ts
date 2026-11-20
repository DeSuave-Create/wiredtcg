import { assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { handleDownload, type DownloadServices } from './handler.ts';

const fixture = 'test-only-access';
const request = (password?: string) => new Request('https://example.test', {
  method: 'POST', headers: { origin: 'https://wiredtcg.com' },
  body: JSON.stringify(password === undefined ? {} : { password }),
});
const services = (overrides: Partial<DownloadServices> = {}): DownloadServices => ({
  password: fixture, checkRate: async () => true,
  signDownload: async () => 'https://example.test/download', ...overrides,
});
Deno.test('Wrong password cannot request a download link', async () => {
  let signed = false;
  const response = await handleDownload(request('incorrect'), services({ signDownload: async () => { signed = true; return ''; } }));
  assertEquals(response.status, 401);
  assertEquals(signed, false);
  assertEquals('url' in await response.json(), false);
});
Deno.test('Missing password is rejected', async () => {
  assertEquals((await handleDownload(request(), services())).status, 400);
});
Deno.test('Correct password signs only the uploaded archive for 60 seconds', async () => {
  const response = await handleDownload(request(fixture), services({ signDownload: async (filename, lifetime) => {
    assertEquals(filename, 'WIRED_Desktop_v0.27_Classifications_Connections.zip');
    assertEquals(lifetime, 60);
    return 'https://example.test/download';
  } }));
  assertEquals(response.status, 200);
  assertEquals((await response.json()).url, 'https://example.test/download');
  assertEquals(response.headers.get('cache-control'), 'no-store');
});
Deno.test('Rate limited visitors cannot request a signed link', async () => {
  assertEquals((await handleDownload(request(fixture), services({ checkRate: async () => false }))).status, 429);
});
Deno.test('Missing secret fails closed', async () => {
  assertEquals((await handleDownload(request(fixture), services({ password: undefined }))).status, 503);
});
Deno.test('Unapproved website is rejected', async () => {
  const req = new Request('https://example.test', { method: 'POST', headers: { origin: 'https://untrusted.test' }, body: JSON.stringify({ password: fixture }) });
  assertEquals((await handleDownload(req, services())).status, 403);
});