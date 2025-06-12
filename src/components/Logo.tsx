
interface LogoProps {
  className?: string;
  size?: number;
}

const Logo = ({ className = "", size = 32 }: LogoProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Glow effect filter */}
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* W shape made of connected lines and dots */}
      {/* Left vertical line */}
      <line x1="20" y1="25" x2="20" y2="75" stroke="hsl(var(--primary))" strokeWidth="3" filter="url(#glow)" />
      {/* Left diagonal down */}
      <line x1="20" y1="75" x2="35" y2="50" stroke="hsl(var(--primary))" strokeWidth="3" filter="url(#glow)" />
      {/* Center vertical */}
      <line x1="35" y1="50" x2="50" y2="65" stroke="hsl(var(--primary))" strokeWidth="3" filter="url(#glow)" />
      {/* Right diagonal up */}
      <line x1="50" y1="65" x2="65" y2="50" stroke="hsl(var(--primary))" strokeWidth="3" filter="url(#glow)" />
      {/* Right diagonal down */}
      <line x1="65" y1="50" x2="80" y2="75" stroke="hsl(var(--primary))" strokeWidth="3" filter="url(#glow)" />
      {/* Right vertical line */}
      <line x1="80" y1="75" x2="80" y2="25" stroke="hsl(var(--primary))" strokeWidth="3" filter="url(#glow)" />
      
      {/* Connection dots */}
      <circle cx="20" cy="25" r="3" fill="hsl(var(--primary))" filter="url(#glow)" />
      <circle cx="20" cy="75" r="3" fill="hsl(var(--primary))" filter="url(#glow)" />
      <circle cx="35" cy="50" r="3" fill="hsl(var(--primary))" filter="url(#glow)" />
      <circle cx="50" cy="65" r="3" fill="hsl(var(--primary))" filter="url(#glow)" />
      <circle cx="65" cy="50" r="3" fill="hsl(var(--primary))" filter="url(#glow)" />
      <circle cx="80" cy="25" r="3" fill="hsl(var(--primary))" filter="url(#glow)" />
      <circle cx="80" cy="75" r="3" fill="hsl(var(--primary))" filter="url(#glow)" />
    </svg>
  );
};

export default Logo;
