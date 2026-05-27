import { ExternalLink, Rocket } from 'lucide-react';
import { useCountdown, pad2 } from '@/hooks/useCountdown';

const KICKSTARTER_URL = 'https://www.kickstarter.com/projects/wiredtcg/wired-the-card-game';

const TimeCell = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center justify-center rounded-lg bg-background/20 backdrop-blur-sm border border-primary-foreground/20 px-2 py-2 min-w-[56px]">
    <span className="font-orbitron font-bold text-xl sm:text-2xl text-primary-foreground tabular-nums leading-none">
      {pad2(value)}
    </span>
    <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-primary-foreground/80 mt-1">
      {label}
    </span>
  </div>
);

const KickstarterCTA = () => {
  const { days, hours, minutes, seconds, isLive } = useCountdown();

  return (
    <div className="max-w-md mx-auto px-2 sm:px-0">
      <div className="relative rounded-xl bg-gradient-to-r from-primary via-accent to-primary border border-primary/40 shadow-lg overflow-hidden p-5 sm:p-6 text-center">
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            background:
              'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.55) 50%, transparent 70%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 3.5s linear infinite',
          }}
        />
        <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
        <div className="relative space-y-4">
          <h2 className="font-orbitron text-lg sm:text-xl tracking-wider text-primary-foreground drop-shadow">
            Back Us on Kickstarter
          </h2>

          {isLive ? (
            <p className="text-sm sm:text-base font-bold text-primary-foreground animate-pulse">
              🚀 Campaign is now LIVE!
            </p>
          ) : (
            <>
              <p className="text-xs sm:text-sm text-primary-foreground/90 leading-relaxed">
                Our campaign launches in:
              </p>
              <div className="flex justify-center gap-2 sm:gap-3">
                <TimeCell value={days} label="Days" />
                <TimeCell value={hours} label="Hours" />
                <TimeCell value={minutes} label="Mins" />
                <TimeCell value={seconds} label="Secs" />
              </div>
            </>
          )}

          <p className="text-xs sm:text-sm text-primary-foreground/90 leading-relaxed">
            {isLive
              ? 'Back the campaign now and claim your exclusive rewards.'
              : 'Our Kickstarter page is live — follow us to get notified at launch.'}
          </p>

          <a
            href={KICKSTARTER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-full sm:w-auto min-h-[44px] px-6 py-3 text-base font-semibold rounded-md bg-background text-primary hover:bg-background/90 transition-all touch-manipulation"
          >
            <Rocket className="h-5 w-5 mr-2" />
            {isLive ? 'Back Us Now' : 'Visit Our Kickstarter'}
            <ExternalLink className="h-4 w-4 ml-2 opacity-70" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default KickstarterCTA;
