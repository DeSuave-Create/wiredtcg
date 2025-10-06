
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
      {/* Lightning bolt effect */}
      <svg 
        className="absolute inset-0 pointer-events-none lightning-bolt"
        style={{ width: size, height: size }}
        viewBox="0 0 32 32"
      >
        <path
          d="M18 2 L8 16 L14 16 L12 30 L24 14 L18 14 Z"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="bolt-path"
        />
      </svg>
    </div>
  );
};

export default Logo;
