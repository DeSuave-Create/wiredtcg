import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContentSection from '@/components/ContentSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Lock, Eye, EyeOff, Download, RefreshCw, Loader2, Image as ImageIcon } from 'lucide-react';

const CHARACTER_ASSETS = [
  { name: 'Security Specialist', src: '/lovable-uploads/artwork-security.png' },
  { name: 'Headhunter', src: '/lovable-uploads/artwork-headhunter.png' },
  { name: 'Field Tech', src: '/lovable-uploads/artwork-fieldtech.png' },
  { name: 'Facilities Manager', src: '/lovable-uploads/artwork-facilities.png' },
  { name: 'Auditor', src: '/lovable-uploads/artwork-auditor.png' },
  { name: 'Supervisor', src: '/lovable-uploads/artwork-supervisor.png' },
];

const AdminArtwork = () => {
  const { toast } = useToast();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [description, setDescription] = useState('');

  const handleLogin = async () => {
    try {
      setLoading(true);
      // Verify password by calling admin-products GET
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-products`, {
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      });
      if (!res.ok) throw new Error('Unauthorized');
      setAuthenticated(true);
      toast({ title: 'Authenticated', description: 'Welcome to Artwork Generator!' });
    } catch {
      toast({ title: 'Access Denied', description: 'Incorrect password.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const generateArtwork = async () => {
    setGenerating(true);
    setGeneratedImage(null);
    setDescription('');
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-toc-art`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password,
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Generation failed');
      }

      const data = await res.json();
      setGeneratedImage(data.image);
      setDescription(data.description || '');
      toast({ title: 'Artwork Generated!', description: 'Your TOC artwork is ready.' });
    } catch (e: any) {
      toast({ title: 'Generation Failed', description: e.message, variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'wired-toc-artwork.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="container mx-auto px-4 py-8 flex justify-center flex-grow">
          <div className="w-full max-w-md">
            <ContentSection title="Artwork Generator" glowEffect>
              <div className="space-y-4">
                <Lock className="h-12 w-12 text-primary mx-auto" />
                <p className="text-center text-muted-foreground">Enter admin password to access artwork generator</p>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Admin password"
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button onClick={handleLogin} className="w-full" disabled={loading}>
                  {loading ? 'Verifying...' : 'Access Artwork Generator'}
                </Button>
              </div>
            </ContentSection>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-8 flex-grow">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Generate Section */}
          <ContentSection title="WIRED TOC Artwork Generator" glowEffect>
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Generate a cyberpunk-themed Table of Contents image for the WIRED Kickstarter campaign.
              </p>
              <div className="flex justify-center gap-3">
                <Button
                  onClick={generateArtwork}
                  disabled={generating}
                  className="bg-primary hover:bg-primary/90"
                  size="lg"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Generating... (may take 30-60s)
                    </>
                  ) : generatedImage ? (
                    <>
                      <RefreshCw className="h-5 w-5 mr-2" />
                      Regenerate
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-5 w-5 mr-2" />
                      Generate Artwork
                    </>
                  )}
                </Button>
                {generatedImage && (
                  <Button onClick={downloadImage} variant="outline" size="lg">
                    <Download className="h-5 w-5 mr-2" />
                    Download PNG
                  </Button>
                )}
              </div>
            </div>
          </ContentSection>

          {/* Generated Image */}
          {generating && (
            <ContentSection>
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Generating your cyberpunk TOC artwork...</p>
              </div>
            </ContentSection>
          )}

          {generatedImage && !generating && (
            <ContentSection title="Generated Artwork">
              <div className="space-y-4">
                <img
                  src={generatedImage}
                  alt="WIRED TOC Artwork"
                  className="w-full rounded-xl border-2 border-primary/30"
                />
                {description && (
                  <p className="text-sm text-muted-foreground italic">{description}</p>
                )}
              </div>
            </ContentSection>
          )}

          {/* Reference Gallery */}
          <ContentSection title="Character Reference Gallery">
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Existing character artwork for reference — use these to composite with the generated TOC in a design tool.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {CHARACTER_ASSETS.map(asset => (
                <div key={asset.name} className="text-center space-y-2">
                  <img
                    src={asset.src}
                    alt={asset.name}
                    className="w-full rounded-lg border border-primary/20"
                  />
                  <p className="text-xs text-muted-foreground font-medium">{asset.name}</p>
                </div>
              ))}
            </div>
          </ContentSection>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminArtwork;
