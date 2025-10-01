
interface LogoProps {
  className?: string;
  size?: number;
}

const Logo = ({ className = "", size = 32 }: LogoProps) => {
  return (
    <img 
      src="/wire-logo-official.png" 
      alt="WIRED Official Logo" 
      className={className}
      style={{ width: size, height: size }}
    />
  );
};

export default Logo;
