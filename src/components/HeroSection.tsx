import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Zap, Rocket } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Logo from './Logo';

const KICKSTARTER_URL = 'https://www.kickstarter.com/projects/wiredtcg/wired-the-card-game';

const HeroSection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [ksRevealed, setKsRevealed] = useState(false);

  const handleLearnToPlay = () => {
    navigate('/extras');
    toast({
      title: "Learn to Play",
      description: "Master the art of network building and bitcoin mining!",
    });
  };

  const handleKickstarter = () => {
    // TODO: when live, replace with: window.open(KICKSTARTER_URL, '_blank');
    void KICKSTARTER_URL;
    setKsRevealed(true);
    toast({
      title: "Kickstarter — Coming Soon!",
      description: "Our campaign is launching soon. Stay tuned!",
    });
    setTimeout(() => setKsRevealed(false), 2000);
  };

  return (
    <div className="text-center space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 mb-6 sm:mb-8">
        <Logo size={140} className="hidden sm:block" />
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold font-orbitron text-primary tracking-wider animate-neon-flicker leading-tight">WIRED</h1>
          <p className="text-lg sm:text-2xl md:text-3xl font-orbitron text-primary/90 tracking-wider mt-2 animate-neon-flicker">The Card Game</p>
        </div>
        <Logo size={140} className="hidden sm:block" />
      </div>
      <p className="text-sm sm:text-base text-muted-foreground/80 max-w-xs sm:max-w-md md:max-w-lg mx-auto px-2 sm:px-0 leading-relaxed">
        Build your network, connect to the switch, and start mining bitcoin! Race against other players through strategic network building, cyber attacks, and cunning deals. Will you dominate through superior infrastructure or be sabotaged by your opponents?
      </p>
      <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 px-2 sm:px-0">
        <Button
          onClick={handleLearnToPlay}
          variant="outline"
          className="neon-border text-primary hover:text-primary px-6 sm:px-6 py-3 text-base sm:text-base w-full sm:w-auto min-h-[44px] touch-manipulation"
        >
          <Zap className="h-5 w-5 mr-2" />
          Learn to Play
        </Button>
      </div>

      {/* Kickstarter CTA */}
      <div className="pt-6 mt-2 border-t border-primary/15 max-w-md mx-auto px-2 sm:px-0">
        <div className="relative rounded-xl bg-gradient-to-r from-primary via-accent to-primary border border-primary/40 shadow-lg overflow-hidden p-5 sm:p-6 space-y-3">
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
    </div>
  );
};

export default HeroSection;
