import './WiredElectricText.css';

const WiredElectricText = () => {
  return (
    <div className="wired-electric-container">
      <svg
        viewBox="0 0 400 80"
        className="wired-electric-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Animated mask that reveals the text */}
          <mask id="fill-mask">
            <rect x="0" y="0" width="0%" height="100%" fill="white" className="fill-rect">
              <animate attributeName="width" from="0%" to="100%" dur="3s" fill="freeze" />
            </rect>
          </mask>
          
          {/* Glow filter for electric effect */}
          <filter id="electric-glow">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Background unfilled text */}
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fill="none"
          stroke="hsl(96 48% 54% / 0.3)"
          strokeWidth="2"
          fontFamily="Orbitron, sans-serif"
          fontSize="64"
          fontWeight="700"
          letterSpacing="8"
        >
          WIRED
        </text>
        
        {/* Filled electric text with mask */}
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          className="wired-electric-fill"
          fill="hsl(96 48% 54%)"
          stroke="hsl(96 48% 64%)"
          strokeWidth="1"
          filter="url(#electric-glow)"
          fontFamily="Orbitron, sans-serif"
          fontSize="64"
          fontWeight="700"
          letterSpacing="8"
          mask="url(#fill-mask)"
        >
          WIRED
        </text>
        
        {/* Moving electric pulse/spark at the edge */}
        <rect
          x="0"
          y="0"
          width="10"
          height="100%"
          fill="url(#spark-gradient)"
          mask="url(#fill-mask)"
          className="electric-edge"
          filter="url(#electric-glow)"
        />
        
        <defs>
          <linearGradient id="spark-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: 'rgba(255, 255, 255, 0)', stopOpacity: 0 }} />
            <stop offset="50%" style={{ stopColor: 'rgba(255, 255, 255, 0.9)', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: 'rgba(255, 255, 255, 0)', stopOpacity: 0 }} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default WiredElectricText;
