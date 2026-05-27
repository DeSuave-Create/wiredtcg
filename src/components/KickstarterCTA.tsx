import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Rocket } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const KICKSTARTER_URL = 'https://www.kickstarter.com/projects/wiredtcg/wired-the-card-game';

const KickstarterCTA = () => {
  const { toast } = useToast();
  const [ksRevealed, setKsRevealed] = useState(false);

  const handleKickstarter = () => {
    // TODO: when live, replace with: window.open(KICKSTARTER_URL, '_blank');
    void KICKSTARTER_URL;
    setKsRevealed(true);
    toast({
      title: 'Kickstarter — Coming Soon!',
      description: 'Our campaign is launching soon. Stay tuned!',
    });
    setTimeout(() => setKsRevealed(false), 2000);
  };

  return (
    <div className="max-w-md mx-auto px-2 sm:px-0">
      <div className="relative rounded-xl bg-gradient-to-r from-primary via-accent to-primary border border-primary/40 shadow-lg overflow-hidden p-5 sm:p-6 text-center">
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background:
              'linear-gradient(110deg, transparent 30%, hsl(var(--primary-foreground) / 0.35) 50%, transparent 70%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 3.5s linear infinite',
          }}
        />
        <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
        <div className="relative space-y-3">
          <h2 className="font-orbitron text-lg sm:text-xl tracking-wider text-primary-foreground drop-shadow">
            Back Us on Kickstarter
          </h2>
          <p className="text-xs sm:text-sm text-primary-foreground/90 leading-relaxed">
            Our campaign is launching soon.
          </p>
          <Button
            onClick={handleKickstarter}
            className={`w-full sm:w-auto min-h-[44px] px-6 py-3 text-base font-semibold bg-background text-primary hover:bg-background/90 transition-all touch-manipulation ${ksRevealed ? 'animate-pulse scale-105' : ''}`}
          >
            <Rocket className="h-5 w-5 mr-2" />
            {ksRevealed ? 'Coming Soon!' : 'Visit Our Kickstarter'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default KickstarterCTA;
