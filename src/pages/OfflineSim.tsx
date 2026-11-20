import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, FileArchive, Loader2, LockKeyhole } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';

export default function OfflineSim() {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [download, setDownload] = useState<{ url: string; filename: string } | null>(null);

  async function unlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { data, error: failure } = await supabase.functions.invoke('offline-sim-download', { body: { password } });
      if (failure) {
        let message = 'Unable to unlock the download. Please try again.';
        if (failure.context instanceof Response) {
          const body = await failure.context.json().catch(() => null);
          if (typeof body?.error === 'string') message = body.error;
        }
        setError(message);
        return;
      }
      if (typeof data?.url !== 'string' || typeof data?.filename !== 'string') throw new Error('Unavailable');
      setDownload(data);
      setPassword('');
      window.setTimeout(() => setDownload(null), 60_000);
    } catch {
      setError('Download temporarily unavailable. Please try again later.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 sm:py-20">
        <div className="mx-auto max-w-xl">
          <Button asChild variant="ghost" className="mb-8"><Link to="/extras"><ArrowLeft className="mr-2 h-4 w-4" />Back to Extras</Link></Button>
          <div className="mb-8 flex items-center gap-4">
            <FileArchive className="h-12 w-12 shrink-0 text-primary" strokeWidth={1.5} />
            <div><h1 className="text-3xl sm:text-4xl font-bold font-orbitron">WIRED Offline Simulator</h1><p className="mt-2 text-foreground/75">Desktop edition · v0.27</p></div>
          </div>
          <div className="border-t border-border/30 pt-8">
            <p className="mb-6 text-foreground/80">Classifications &amp; Connections</p>
            <div className="mb-8 flex items-center justify-between gap-4 border-y border-border/20 py-4 text-sm"><span className="flex items-center gap-2"><FileArchive className="h-4 w-4 text-primary" />Simulator ZIP</span><span>4.4 MB</span></div>
            {download ? (
              <div role="status" className="space-y-4">
                <p className="text-foreground">Download unlocked.</p>
                <Button asChild size="lg" className="w-full"><a href={download.url} download={download.filename}><Download className="mr-2 h-5 w-5" />Download ZIP</a></Button>
                <p className="text-sm text-foreground/70">Your download link expires in one minute.</p>
              </div>
            ) : (
              <form onSubmit={unlock} className="space-y-4">
                <Label htmlFor="offline-password" className="flex items-center gap-2 text-foreground"><LockKeyhole className="h-4 w-4 text-primary" />Download password</Label>
                <Input id="offline-password" type="password" autoComplete="off" value={password} onChange={event => setPassword(event.target.value)} required maxLength={256} disabled={busy} aria-invalid={Boolean(error)} aria-describedby={error ? 'offline-error' : undefined} className="h-12 border-border/40" />
                {error && <p id="offline-error" role="alert" className="text-foreground">{error}</p>}
                <Button type="submit" size="lg" className="w-full" disabled={busy || !password}>{busy ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LockKeyhole className="mr-2 h-5 w-5" />}{busy ? 'Checking…' : 'Unlock Download'}</Button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}