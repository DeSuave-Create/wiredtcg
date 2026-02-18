import { useEffect, useState, useId } from 'react';

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
    title: 'LEGENDARY',
    label: 'Legendary Founder',
    rgb: '168, 85, 247',
    rgbDark: '88, 28, 135',
    members: [],
    scale: 1.0,
    animation: 'pulse',
  },
  {
    title: 'GOLD',
    label: 'Gold Founder',
    rgb: '234, 179, 8',
    rgbDark: '133, 100, 0',
    members: [],
    scale: 0.95,
    animation: 'shimmer',
  },
  {
    title: 'VANGUARD',
    label: 'Vanguard Founder',
    rgb: '239, 68, 68',
    rgbDark: '127, 29, 29',
    members: [],
    scale: 0.92,
    animation: 'steady',
  },
  {
    title: 'BETA',
    label: 'Beta Founder',
    rgb: '59, 130, 246',
    rgbDark: '29, 58, 138',
    members: [],
    scale: 0.89,
    animation: 'cool',
  },
  {
    title: 'ALPHA',
    label: 'Alpha Founder',
    rgb: '34, 197, 94',
    rgbDark: '15, 90, 45',
    members: [],
    scale: 0.86,
    animation: 'matte',
  },
];

const trophyAnimationCSS = `
@keyframes founder-pulse {
  0%, 100% { filter: drop-shadow(0 0 4px rgba(168,85,247,0.15)); }
  50% { filter: drop-shadow(0 0 10px rgba(168,85,247,0.30)); }
}
@keyframes founder-shimmer {
  0%, 100% { filter: drop-shadow(0 0 3px rgba(234,179,8,0.12)); }
  50% { filter: drop-shadow(0 0 8px rgba(234,179,8,0.25)); }
}
`;

const FounderTrophyList = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      <style>{trophyAnimationCSS}</style>
      <div className="flex flex-col items-center gap-8 sm:gap-10 w-full">
        {tiers.map((tier, index) => (
          <FounderTrophyRow key={tier.title} tier={tier} mounted={mounted} index={index} />
        ))}
      </div>
    </>
  );
};

const TrophySVGFrame = ({ rgb, rgbDark, animation }: { rgb: string; rgbDark: string; animation: string }) => {
  const filterId = useId();
  const gradId = useId();
  const glowId = useId();
  const metalGradId = useId();
  const innerGlowId = useId();

  const animStyle = animation === 'pulse'
    ? 'founder-pulse 4s ease-in-out infinite'
    : animation === 'shimmer'
    ? 'founder-shimmer 5s ease-in-out infinite'
    : 'none';

  return (
    <svg
      viewBox="0 0 200 320"
      className="w-full h-full"
      style={{ animation: animStyle }}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* Metallic gradient for frame */}
        <linearGradient id={metalGradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgb(90,95,110)" />
          <stop offset="25%" stopColor="rgb(140,145,160)" />
          <stop offset="50%" stopColor="rgb(180,185,195)" />
          <stop offset="75%" stopColor="rgb(120,125,140)" />
          <stop offset="100%" stopColor="rgb(70,75,90)" />
        </linearGradient>

        {/* Inner highlight gradient */}
        <linearGradient id={gradId} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
          <stop offset="40%" stopColor="rgba(255,255,255,0.05)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.0)" />
        </linearGradient>

        {/* Tier color glow */}
        <radialGradient id={glowId} cx="0.5" cy="0.35" r="0.4">
          <stop offset="0%" stopColor={`rgba(${rgb},0.12)`} />
          <stop offset="100%" stopColor={`rgba(${rgb},0.0)`} />
        </radialGradient>

        {/* Inner glow for emblem area */}
        <radialGradient id={innerGlowId} cx="0.5" cy="0.35" r="0.25">
          <stop offset="0%" stopColor={`rgba(${rgb},0.20)`} />
          <stop offset="100%" stopColor={`rgba(${rgb},0.0)`} />
        </radialGradient>

        {/* Bevel filter */}
        <filter id={filterId}>
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feSpecularLighting in="blur" surfaceScale="3" specularConstant="0.6" specularExponent="15" result="spec">
            <fePointLight x="80" y="40" z="120" />
          </feSpecularLighting>
          <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="specOut" />
          </feMerge>
        </filter>
      </defs>

      {/* === OUTER FRAME — Trophy silhouette === */}
      {/* Shadow layer */}
      <path
        d={trophyPath(4)}
        fill="rgba(0,0,0,0.4)"
        transform="translate(2, 3)"
      />

      {/* Outer metallic frame (dark edge) */}
      <path
        d={trophyPath(0)}
        fill={`rgb(${rgbDark})`}
        stroke={`rgba(${rgbDark},0.9)`}
        strokeWidth="1"
      />

      {/* Mid metallic body */}
      <path
        d={trophyPath(6)}
        fill={`url(#${metalGradId})`}
        stroke="rgba(200,205,215,0.3)"
        strokeWidth="0.5"
        filter={`url(#${filterId})`}
      />

      {/* Inner frame border (tier color accent) */}
      <path
        d={trophyPath(12)}
        fill="none"
        stroke={`rgba(${rgb},0.5)`}
        strokeWidth="1.5"
      />

      {/* Inner dark background */}
      <path
        d={trophyPath(14)}
        fill="rgba(15,18,25,0.85)"
      />

      {/* Inner glow behind emblem */}
      <circle cx="100" cy="115" r="50" fill={`url(#${innerGlowId})`} />

      {/* Glass highlight overlay */}
      <path
        d={trophyPath(14)}
        fill={`url(#${gradId})`}
      />

      {/* Ambient tier glow */}
      <rect x="0" y="0" width="200" height="320" fill={`url(#${glowId})`} />
    </svg>
  );
};

/** Generate trophy silhouette path with inset */
function trophyPath(inset: number): string {
  const l = 10 + inset;         // left
  const r = 190 - inset;        // right
  const t = 10 + inset;         // top of arch
  const archR = (r - l) / 2;    // arch radius
  const cx = 100;               // center x

  // Neck narrows
  const neckL = 60 + inset * 0.6;
  const neckR = 140 - inset * 0.6;
  const neckTop = 200 - inset * 0.3;
  const neckBot = 230 - inset * 0.2;

  // Base
  const baseL = 35 + inset * 0.5;
  const baseR = 165 - inset * 0.5;
  const baseTop = neckBot;
  const baseBot = 310 - inset;

  return `
    M ${l} ${t + archR}
    A ${archR} ${archR} 0 0 1 ${r} ${t + archR}
    L ${r} ${neckTop}
    C ${r} ${neckTop + 15}, ${neckR} ${neckTop + 20}, ${neckR} ${neckTop + 25}
    L ${neckR} ${neckBot}
    L ${baseR} ${baseTop + 5}
    C ${baseR + 5} ${baseTop + 5}, ${baseR + 5} ${baseTop + 12}, ${baseR} ${baseTop + 15}
    L ${baseR} ${baseBot - 8}
    C ${baseR} ${baseBot}, ${baseR - 5} ${baseBot}, ${baseR - 8} ${baseBot}
    L ${baseL + 8} ${baseBot}
    C ${baseL + 5} ${baseBot}, ${baseL} ${baseBot}, ${baseL} ${baseBot - 8}
    L ${baseL} ${baseTop + 15}
    C ${baseL - 5} ${baseTop + 12}, ${baseL - 5} ${baseTop + 5}, ${baseL} ${baseTop + 5}
    L ${neckL} ${neckBot}
    L ${neckL} ${neckTop + 25}
    C ${neckL} ${neckTop + 20}, ${l} ${neckTop + 15}, ${l} ${neckTop}
    Z
  `;
}

const FounderTrophyRow = ({ tier, mounted, index }: { tier: FounderTier; mounted: boolean; index: number }) => {
  const { rgb, rgbDark, title, label, members, scale, animation } = tier;

  const outerGlowOpacity = animation === 'steady' ? 0.30
    : animation === 'cool' ? 0.18
    : animation === 'matte' ? 0.10
    : animation === 'pulse' ? 0.25
    : 0.20;

  return (
    <div
      className="flex flex-col sm:flex-row items-center w-full transition-all duration-700"
      style={{
        transform: mounted ? `scale(${scale})` : `scale(${scale * 0.9})`,
        opacity: mounted ? 1 : 0,
        transitionDelay: `${index * 100}ms`,
      }}
    >
      {/* === TROPHY PLAQUE (LEFT) === */}
      <div className="relative flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px] h-[260px] sm:h-[290px] md:h-[320px]">
        {/* SVG Trophy Frame */}
        <TrophySVGFrame rgb={rgb} rgbDark={rgbDark} animation={animation} />

        {/* Overlay content positioned on top of SVG */}
        <div className="absolute inset-0 flex flex-col items-center justify-between pointer-events-none py-6 sm:py-8 px-6 sm:px-8">
          {/* Tier title at top of arch */}
          <span
            className="text-[9px] sm:text-[10px] font-bold font-orbitron tracking-[0.2em] uppercase mt-2 sm:mt-4"
            style={{ color: `rgba(${rgb}, 0.9)` }}
          >
            {title}
          </span>

          {/* WIRED Logo emblem in center */}
          <div className="relative flex items-center justify-center">
            <div
              className="absolute rounded-full"
              style={{
                width: 72, height: 72,
                background: `radial-gradient(circle, rgba(${rgb},0.10) 0%, transparent 70%)`,
              }}
            />
            <img
              src="/wire-logo-official.png"
              alt="WIRED Logo"
              className="w-14 h-14 sm:w-16 sm:h-16 object-contain relative z-10"
              style={{
                filter: `drop-shadow(0 0 4px rgba(${rgb}, 0.25))`,
              }}
            />
          </div>

          {/* Title plate at base */}
          <div
            className="px-3 py-1 rounded text-[8px] sm:text-[9px] font-orbitron tracking-wider uppercase text-center mb-1 sm:mb-2"
            style={{
              border: `1px solid rgba(${rgb}, 0.35)`,
              color: `rgba(${rgb}, 0.8)`,
              background: 'rgba(0,0,0,0.5)',
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), 0 0 8px rgba(${rgb}, 0.08)`,
            }}
          >
            {label}
          </div>
        </div>
      </div>

      {/* === RIBBON PANEL (RIGHT) === */}
      <div
        className="relative flex-1 w-full sm:w-auto mt-[-4px] sm:mt-0 sm:ml-[-12px]"
        style={{
          /* Match trophy plaque height exactly */
          height: 'auto',
          alignSelf: 'stretch',
        }}
      >
        {/* Notch cutout — creates physical connection illusion */}
        <div
          className="hidden sm:block absolute left-0 top-[15%] bottom-[15%] w-[14px] z-20"
          style={{
            background: `linear-gradient(180deg, 
              rgba(${rgbDark},0.6) 0%, 
              rgba(${rgb},0.15) 20%, 
              rgba(${rgb},0.10) 50%, 
              rgba(${rgb},0.15) 80%, 
              rgba(${rgbDark},0.6) 100%
            )`,
            borderRight: `1px solid rgba(${rgb},0.25)`,
            boxShadow: `
              inset -3px 0 6px rgba(0,0,0,0.5),
              inset 2px 0 4px rgba(${rgb},0.08)
            `,
            borderRadius: '0 2px 2px 0',
          }}
        />

        {/* Ribbon body */}
        <div
          className="relative h-full rounded-xl sm:rounded-l-none overflow-hidden flex flex-col justify-center"
          style={{
            minHeight: 260,
            border: `4px solid rgba(120,125,140,0.45)`,
            borderLeft: '0px',
            background: 'linear-gradient(135deg, rgba(35,37,48,0.97) 0%, rgba(22,24,32,0.99) 100%)',
            boxShadow: `
              inset 6px 0 12px rgba(0,0,0,0.5),
              inset 0 2px 0 rgba(255,255,255,0.05),
              inset 0 -2px 0 rgba(0,0,0,0.3),
              0 0 18px rgba(${rgb}, ${outerGlowOpacity * 0.35}),
              0 4px 16px rgba(0,0,0,0.35)
            `,
          }}
        >
          {/* Top bevel highlight */}
          <div
            className="absolute top-0 left-0 right-0 h-[1px]"
            style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 20%, rgba(255,255,255,0.06) 80%, transparent 100%)' }}
          />
          {/* Bottom bevel shadow */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[1px]"
            style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.4) 20%, rgba(0,0,0,0.25) 80%, transparent 100%)' }}
          />
          {/* Diagonal sheen */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, transparent 38%, rgba(255,255,255,0.03) 46%, transparent 54%)',
            }}
          />
          {/* Inner left depth shadow (where ribbon meets trophy) */}
          <div
            className="hidden sm:block absolute left-0 top-0 bottom-0 w-5"
            style={{
              background: 'linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)',
            }}
          />

          {/* Founder names content */}
          <div className="relative z-10 p-5 sm:p-6 sm:pl-8 flex flex-col justify-center">
            {/* Tier indicator line */}
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-10 h-[2px] rounded"
                style={{ background: `rgba(${rgb}, 0.5)` }}
              />
              <span
                className="text-[10px] font-orbitron tracking-widest uppercase"
                style={{ color: `rgba(${rgb}, 0.6)` }}
              >
                Founders
              </span>
            </div>

            {members.length > 0 ? (
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {members.map((name) => (
                  <span
                    key={name}
                    className="text-sm font-medium text-muted-foreground"
                  >
                    {name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground/60 italic">
                Founders will be listed here soon
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FounderTrophyList;
