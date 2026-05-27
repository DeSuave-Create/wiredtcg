import { Zap, ExternalLink } from 'lucide-react';

const KICKSTARTER_URL = 'https://www.kickstarter.com/projects/wiredtcg/wired-the-card-game';

const KickstarterAnnouncementBar = () => {
  return (
    <a
      href={KICKSTARTER_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="sticky top-0 z-[60] w-full block bg-gradient-to-r from-primary via-accent to-primary border-b border-primary/40 shadow-lg overflow-hidden"
    >
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

      <div className="relative container mx-auto px-4 flex items-center justify-center min-h-[48px] sm:min-h-[54px]">
        <span className="flex items-center gap-2 text-primary-foreground font-orbitron font-bold text-xs sm:text-sm tracking-wide hover:scale-[1.03] transition-transform duration-200 cursor-pointer">
          <Zap className="h-4 w-4 animate-pulse" />
          <span className="hidden sm:inline">BACK WIRED ON KICKSTARTER — LAUNCHING SOON</span>
          <span className="sm:hidden">KICKSTARTER — LAUNCHING SOON</span>
          <ExternalLink className="h-3 w-3 opacity-70" />
          <Zap className="h-4 w-4 animate-pulse" />
        </span>
      </div>
    </a>
  );
};

export default KickstarterAnnouncementBar;
