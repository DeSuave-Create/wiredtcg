
interface NetworkLogoProps {
  className?: string;
  size?: number;
}

const NetworkLogo = ({ className = "", size = 40 }: NetworkLogoProps) => {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-all duration-300"
      >
        {/* Top left node */}
        <circle cx="20" cy="20" r="8" fill="#0bce31" stroke="#0bce31" strokeWidth="2"/>
        <circle cx="20" cy="20" r="4" fill="white"/>
        
        {/* Top right node */}
        <circle cx="80" cy="20" r="8" fill="#0bce31" stroke="#0bce31" strokeWidth="2"/>
        <circle cx="80" cy="20" r="4" fill="white"/>
        
        {/* Center node */}
        <circle cx="50" cy="50" r="8" fill="#0bce31" stroke="#0bce31" strokeWidth="2"/>
        <circle cx="50" cy="50" r="4" fill="white"/>
        
        {/* Bottom left node */}
        <circle cx="25" cy="80" r="10" fill="#0bce31" stroke="#0bce31" strokeWidth="2"/>
        
        {/* Bottom right node */}
        <circle cx="75" cy="80" r="10" fill="#0bce31" stroke="#0bce31" strokeWidth="2"/>
        
        {/* Connection lines */}
        <line x1="20" y1="20" x2="25" y2="70" stroke="#0bce31" strokeWidth="3"/>
        <line x1="80" y1="20" x2="75" y2="70" stroke="#0bce31" strokeWidth="3"/>
        <line x1="50" y1="50" x2="35" y2="75" stroke="#0bce31" strokeWidth="3"/>
        <line x1="50" y1="50" x2="65" y2="75" stroke="#0bce31" strokeWidth="3"/>
        
        {/* Horizontal connections at top */}
        <line x1="12" y1="20" x2="28" y2="20" stroke="#0bce31" strokeWidth="3"/>
        <line x1="72" y1="20" x2="88" y2="20" stroke="#0bce31" strokeWidth="3"/>
      </svg>
      
      <div 
        className="absolute inset-0 opacity-30 mix-blend-screen animate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(11,206,49,0.3) 0%, rgba(11,206,49,0.2) 50%, transparent 70%)'
        }}
      />
    </div>
  );
};

export default NetworkLogo;
