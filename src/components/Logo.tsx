
interface LogoProps {
  className?: string;
  size?: number;
}

const Logo = ({ className = "", size = 32 }: LogoProps) => {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <img
        src="/lovable-uploads/a91d57a1-9b5b-41b7-9e64-7fdd219c8127.png"
        alt="WIRED Logo"
        width={size}
        height={size}
        className="drop-shadow-[0_0_8px_rgba(0,255,255,0.6)] hover:drop-shadow-[0_0_16px_rgba(0,255,255,0.8)] transition-all duration-300"
        style={{
          filter: 'drop-shadow(0 0 4px rgba(255,165,0,0.4)) drop-shadow(0 0 8px rgba(0,255,255,0.6))'
        }}
      />
      <div 
        className="absolute inset-0 opacity-30 mix-blend-screen animate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(255,165,0,0.3) 0%, rgba(0,255,255,0.2) 50%, transparent 70%)'
        }}
      />
    </div>
  );
};

export default Logo;
