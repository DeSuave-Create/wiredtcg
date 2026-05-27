import { useEffect, useState } from 'react';
import { X, Zap, Rocket } from 'lucide-react';
import { toast } from 'sonner';

// TODO: enable when live — swap the <button> for an <a href={KICKSTARTER_URL} target="_blank" rel="noopener noreferrer">
const KICKSTARTER_URL = 'https://www.kickstarter.com/projects/wiredtcg/wired-the-card-game';
const STORAGE_KEY = 'ks-bar-dismissed';

const KickstarterAnnouncementBar = () => {
  const [visible, setVisible] = useState(true);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === 'true') {
      setVisible(false);
    }
  }, []);

  const handleClick = () => {
    if (revealed) return;
    setRevealed(true);
    toast.success("Kickstarter launching soon — we're approved!", {
      description: 'Stay tuned for the official launch date.',
    });
    setTimeout(() => setRevealed(false), 2800);
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    sessionStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="sticky top-0 z-[60] w-full bg-gradient-to-r from-primary via-accent to-primary border-b border-primary/40 shadow-lg overflow-hidden">
      {/* shimmer overlay */}
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

      <div className="relative container mx-auto px-4 flex items-center justify-center min-h-[36px] sm:min-h-[40px]">
        <button
          onClick={handleClick}
          aria-label="Back WIRED on Kickstarter — Coming Soon"
          className={`flex items-center gap-2 text-primary-foreground font-orbitron font-bold text-xs sm:text-sm tracking-wide hover:scale-[1.03] transition-transform duration-200 ${
            revealed ? 'animate-pulse' : ''
          }`}
        >
          {revealed ? (
            <span className="flex items-center gap-2 animate-fade-in">
              <Rocket className="h-4 w-4" />
              COMING SOON — STAY TUNED!
              <Rocket className="h-4 w-4" />
            </span>
          ) : (
            <span className="flex items-center gap-2 animate-fade-in">
              <Zap className="h-4 w-4 animate-pulse" />
              <span className="hidden sm:inline">BACK WIRED ON KICKSTARTER — LAUNCHING SOON</span>
              <span className="sm:hidden">KICKSTARTER — LAUNCHING SOON</span>
              <Zap className="h-4 w-4 animate-pulse" />
            </span>
          )}
        </button>

        <button
          onClick={handleDismiss}
          aria-label="Dismiss announcement"
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 rounded p-1 transition-colors"
        >
          <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>
      </div>
    </div>
  );
};

export default KickstarterAnnouncementBar;
