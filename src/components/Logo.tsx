
interface LogoProps {
  className?: string;
  size?: number;
}

const Logo = ({ className = "", size = 32 }: LogoProps) => {
  return (
    <div className="relative inline-block">
      <img 
        src="/wire-logo-official.png" 
        alt="WIRED Official Logo" 
        className={`animate-neon-flicker ${className}`}
        style={{ width: size, height: size }}
      />
      {/* Lightning bolt effect - overlays the logo */}
      <svg 
        className="absolute top-0 left-0 pointer-events-none lightning-bolt"
        style={{ width: size, height: size }}
        viewBox="0 0 32 32"
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <path
          d="M 20 4 L 12 16 L 16 16 L 10 28 L 22 14 L 18 14 L 24 4 Z"
          fill="none"
          stroke="#60a5fa"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
          className="bolt-path"
        />
      </svg>
    </div>
  );
};

export default Logo;
