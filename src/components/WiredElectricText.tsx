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
          {/* Glow filter for electric effect */}
          <filter id="electric-glow">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          {/* Electric gradient */}
          <linearGradient id="electric-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#7cc142', stopOpacity: 1 }}>
              <animate attributeName="stop-color" values="#7cc142; #a8d96e; #7cc142" dur="2s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" style={{ stopColor: '#a8d96e', stopOpacity: 1 }}>
              <animate attributeName="stop-color" values="#a8d96e; #7cc142; #a8d96e" dur="2s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        </defs>
        
        {/* WIRED text with stroke animation */}
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          className="wired-electric-text"
          fill="none"
          stroke="url(#electric-gradient)"
          strokeWidth="2"
          filter="url(#electric-glow)"
          fontFamily="Orbitron, sans-serif"
          fontSize="64"
          fontWeight="700"
          letterSpacing="8"
        >
          WIRED
        </text>
        
        {/* Electric sparks that travel along the path */}
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          className="wired-electric-spark"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3"
          filter="url(#electric-glow)"
          fontFamily="Orbitron, sans-serif"
          fontSize="64"
          fontWeight="700"
          letterSpacing="8"
          strokeDasharray="10 990"
        >
          WIRED
        </text>
      </svg>
    </div>
  );
};

export default WiredElectricText;
