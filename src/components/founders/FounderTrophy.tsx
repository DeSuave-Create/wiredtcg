import { useEffect, useState } from 'react';

interface FounderTier {
  title: string;
  label: string;
  rgb: string;
  rgbDark: string;
  members: string[];
  scale: number;
  animation: 'pulse' | 'shimmer' | 'steady' | 'cool' | 'matte';
}

const tiers: FounderTier[] = [
  {
    title: 'LEGENDARY FOUNDER',
    label: 'Purple Tier',
    rgb: '168, 85, 247',
    rgbDark: '107, 33, 168',
    members: [],
    scale: 1.05,
    animation: 'pulse',
  },
  {
    title: 'GOLD FOUNDER',
    label: 'Gold Tier',
    rgb: '234, 179, 8',
    rgbDark: '161, 118, 0',
    members: [],
    scale: 1.0,
    animation: 'shimmer',
  },
  {
    title: 'VANGUARD FOUNDER',
    label: 'Vanguard Tier',
    rgb: '239, 68, 68',
    rgbDark: '153, 27, 27',
    members: [],
    scale: 0.97,
    animation: 'steady',
  },
  {
    title: 'BETA FOUNDER',
    label: 'Beta Tier',
    rgb: '59, 130, 246',
    rgbDark: '29, 78, 166',
    members: [],
    scale: 0.94,
    animation: 'cool',
  },
  {
    title: 'ALPHA FOUNDER',
    label: 'Alpha Tier',
    rgb: '34, 197, 94',
    rgbDark: '15, 118, 54',
    members: [],
    scale: 0.91,
    animation: 'matte',
  },
];

const glowKeyframes = `
@keyframes trophy-pulse {
  0%, 100% { opacity: 0.06; }
  50% { opacity: 0.12; }
}
@keyframes trophy-shimmer {
  0%, 100% { opacity: 0.04; background-position: -200% 0; }
  50% { opacity: 0.09; background-position: 200% 0; }
}
`;

const FounderTrophyList = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      <style>{glowKeyframes}</style>
      <div className="flex flex-col items-center gap-6 sm:gap-8 w-full">
        {tiers.map((tier) => (
          <FounderTrophyRow key={tier.title} tier={tier} mounted={mounted} />
        ))}
      </div>
    </>
  );
};

const FounderTrophyRow = ({ tier, mounted }: { tier: FounderTier; mounted: boolean }) => {
  const { rgb, rgbDark, title, label, members, scale, animation } = tier;

  const glowAnimation = animation === 'pulse'
    ? 'trophy-pulse 4s ease-in-out infinite'
    : animation === 'shimmer'
    ? 'trophy-shimmer 5s ease-in-out infinite'
    : 'none';

  const outerGlowOpacity = animation === 'steady' ? 0.35
    : animation === 'cool' ? 0.2
    : animation === 'matte' ? 0.12
    : 0.25;

  return (
    <div
      className="flex flex-col sm:flex-row items-stretch w-full transition-all duration-500"
      style={{
        transform: mounted ? `scale(${scale})` : `scale(${scale * 0.95})`,
        opacity: mounted ? 1 : 0,
      }}
    >
      {/* TROPHY PLAQUE */}
      <div
        className="relative flex-shrink-0 w-full sm:w-[200px] md:w-[240px] flex flex-col items-center justify-center py-6 sm:py-8 rounded-2xl sm:rounded-r-none overflow-hidden"
        style={{
          border: `5px solid rgba(${rgbDark}, 0.9)`,
          boxShadow: `0 0 20px rgba(${rgb}, ${outerGlowOpacity}), 0 0 50px rgba(255,255,255,0.08), inset 0 0 1px rgba(255,255,255,0.40)`,
          background: `linear-gradient(180deg, rgba(${rgb}, 0.06) 0%, rgba(0,0,0,0.3) 100%)`,
        }}
      >
        {/* Glass edge highlight */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', borderRadius: 'inherit',
          background: 'linear-gradient(160deg, rgba(255,255,255,0.40) 0%, rgba(255,255,255,0.10) 30%, transparent 60%)',
          maskImage: 'linear-gradient(white, white) padding-box, linear-gradient(white, white)',
          maskComposite: 'exclude', WebkitMaskComposite: 'xor' as any,
          padding: '1px', boxSizing: 'border-box' as const,
        }} />
        {/* Diagonal sheen */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', borderRadius: 'inherit',
          background: 'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.10) 48%, transparent 52%, transparent 100%)',
        }} />
        {/* Ambient glow behind logo */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', borderRadius: 'inherit',
          background: `radial-gradient(circle at center, rgba(${rgb}, 0.08) 0%, transparent 70%)`,
          animation: glowAnimation,
        }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-3">
          {/* Tier name */}
          <span
            className="text-[10px] sm:text-xs font-bold font-orbitron tracking-[0.25em] uppercase"
            style={{ color: `rgba(${rgb}, 0.9)` }}
          >
            {title}
          </span>

          {/* WIRED Logo */}
          <div className="relative">
            <img
              src="/wire-logo-official.png"
              alt="WIRED Logo"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
              style={{
                filter: `drop-shadow(0 0 6px rgba(${rgb}, 0.3))`,
              }}
            />
            {/* Color overlay on logo */}
            <div
              className="absolute inset-0"
              style={{
                background: `rgba(${rgb}, 0.15)`,
                mixBlendMode: 'color',
                borderRadius: '50%',
              }}
            />
          </div>

          {/* Title plate */}
          <div
            className="px-4 py-1 rounded-md text-[9px] sm:text-[10px] font-orbitron tracking-wider uppercase"
            style={{
              border: `1px solid rgba(${rgb}, 0.3)`,
              color: `rgba(${rgb}, 0.7)`,
              background: `rgba(0,0,0,0.4)`,
            }}
          >
            {label}
          </div>
        </div>
      </div>

      {/* RIBBON PANEL */}
      <div
        className="relative flex-1 min-h-[80px] sm:min-h-0 rounded-2xl sm:rounded-l-none overflow-hidden mt-[-2px] sm:mt-0 sm:ml-[-2px]"
        style={{
          border: `3px solid rgba(${rgb}, 0.4)`,
          boxShadow: `inset -8px 0 12px rgba(0,0,0,0.3), 0 0 12px rgba(${rgb}, ${outerGlowOpacity * 0.5})`,
          background: `linear-gradient(90deg, rgba(${rgb}, 0.04) 0%, rgba(0,0,0,0.25) 100%)`,
        }}
      >
        {/* Ribbon glass edge */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', borderRadius: 'inherit',
          background: 'linear-gradient(160deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.05) 30%, transparent 60%)',
          maskImage: 'linear-gradient(white, white) padding-box, linear-gradient(white, white)',
          maskComposite: 'exclude', WebkitMaskComposite: 'xor' as any,
          padding: '1px', boxSizing: 'border-box' as const,
        }} />
        {/* Ribbon sheen */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', borderRadius: 'inherit',
          background: 'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.07) 50%, transparent 60%)',
        }} />

        {/* Founder names */}
        <div className="relative z-10 p-4 sm:p-5 flex flex-col justify-center h-full">
          {members.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {members.map((name) => (
                <span
                  key={name}
                  className="text-sm font-medium"
                  style={{ color: `rgba(${rgb}, 0.85)` }}
                >
                  {name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic opacity-60">
              Founders will be listed here soon
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FounderTrophyList;
