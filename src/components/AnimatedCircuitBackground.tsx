const AnimatedCircuitBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Top Left Corner */}
      <svg className="absolute top-0 left-0 w-[600px] h-[600px]" viewBox="0 0 600 600">
        <defs>
          <filter id="glow-tl">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Circuit paths */}
        <path className="circuit-line circuit-line-1" d="M 0,40 L 100,40 L 100,80 L 180,80" stroke="rgba(34, 211, 238, 0.6)" strokeWidth="2" fill="none" filter="url(#glow-tl)" />
        <path className="circuit-line circuit-line-2" d="M 0,90 L 80,90 L 80,130 L 140,130 L 140,170" stroke="rgba(34, 211, 238, 0.6)" strokeWidth="2" fill="none" filter="url(#glow-tl)" />
        <path className="circuit-line circuit-line-3" d="M 0,140 L 60,140 L 60,190 L 120,190" stroke="rgba(34, 211, 238, 0.6)" strokeWidth="2" fill="none" filter="url(#glow-tl)" />
        <path className="circuit-line circuit-line-4" d="M 40,0 L 40,80 L 90,80 L 90,140" stroke="rgba(34, 211, 238, 0.6)" strokeWidth="2" fill="none" filter="url(#glow-tl)" />
        <path className="circuit-line circuit-line-5" d="M 100,0 L 100,60 L 160,60 L 160,110" stroke="rgba(34, 211, 238, 0.6)" strokeWidth="2" fill="none" filter="url(#glow-tl)" />
        
        {/* Glowing nodes */}
        <circle className="circuit-node circuit-node-1" cx="100" cy="40" r="4" fill="rgba(34, 211, 238, 0.9)" filter="url(#glow-tl)" />
        <circle className="circuit-node circuit-node-2" cx="180" cy="80" r="4" fill="rgba(34, 211, 238, 0.9)" filter="url(#glow-tl)" />
        <circle className="circuit-node circuit-node-3" cx="80" cy="90" r="4" fill="rgba(34, 211, 238, 0.9)" filter="url(#glow-tl)" />
        <circle className="circuit-node circuit-node-4" cx="140" cy="170" r="4" fill="rgba(34, 211, 238, 0.9)" filter="url(#glow-tl)" />
        <circle className="circuit-node circuit-node-5" cx="120" cy="190" r="4" fill="rgba(34, 211, 238, 0.9)" filter="url(#glow-tl)" />
      </svg>

      {/* Top Right Corner */}
      <svg className="absolute top-0 right-0 w-[600px] h-[600px]" viewBox="0 0 600 600">
        <defs>
          <filter id="glow-tr">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <path className="circuit-line circuit-line-6" d="M 600,40 L 500,40 L 500,80 L 420,80" stroke="rgba(34, 211, 238, 0.6)" strokeWidth="2" fill="none" filter="url(#glow-tr)" />
        <path className="circuit-line circuit-line-7" d="M 600,90 L 520,90 L 520,130 L 460,130 L 460,170" stroke="rgba(34, 211, 238, 0.6)" strokeWidth="2" fill="none" filter="url(#glow-tr)" />
        <path className="circuit-line circuit-line-8" d="M 600,140 L 540,140 L 540,190 L 480,190" stroke="rgba(34, 211, 238, 0.6)" strokeWidth="2" fill="none" filter="url(#glow-tr)" />
        <path className="circuit-line circuit-line-9" d="M 560,0 L 560,80 L 510,80 L 510,140" stroke="rgba(34, 211, 238, 0.6)" strokeWidth="2" fill="none" filter="url(#glow-tr)" />
        <path className="circuit-line circuit-line-10" d="M 500,0 L 500,60 L 440,60 L 440,110" stroke="rgba(34, 211, 238, 0.6)" strokeWidth="2" fill="none" filter="url(#glow-tr)" />
        
        <circle className="circuit-node circuit-node-6" cx="500" cy="40" r="4" fill="rgba(34, 211, 238, 0.9)" filter="url(#glow-tr)" />
        <circle className="circuit-node circuit-node-7" cx="420" cy="80" r="4" fill="rgba(34, 211, 238, 0.9)" filter="url(#glow-tr)" />
        <circle className="circuit-node circuit-node-8" cx="520" cy="90" r="4" fill="rgba(34, 211, 238, 0.9)" filter="url(#glow-tr)" />
        <circle className="circuit-node circuit-node-9" cx="460" cy="170" r="4" fill="rgba(34, 211, 238, 0.9)" filter="url(#glow-tr)" />
        <circle className="circuit-node circuit-node-10" cx="480" cy="190" r="4" fill="rgba(34, 211, 238, 0.9)" filter="url(#glow-tr)" />
      </svg>

      {/* Bottom Left Corner */}
      <svg className="absolute bottom-0 left-0 w-[600px] h-[600px]" viewBox="0 0 600 600">
        <defs>
          <filter id="glow-bl">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <path className="circuit-line circuit-line-11" d="M 0,560 L 100,560 L 100,520 L 180,520" stroke="rgba(34, 211, 238, 0.6)" strokeWidth="2" fill="none" filter="url(#glow-bl)" />
        <path className="circuit-line circuit-line-12" d="M 0,510 L 80,510 L 80,470 L 140,470 L 140,430" stroke="rgba(34, 211, 238, 0.6)" strokeWidth="2" fill="none" filter="url(#glow-bl)" />
        <path className="circuit-line circuit-line-13" d="M 0,460 L 60,460 L 60,410 L 120,410" stroke="rgba(34, 211, 238, 0.6)" strokeWidth="2" fill="none" filter="url(#glow-bl)" />
        <path className="circuit-line circuit-line-14" d="M 40,600 L 40,520 L 90,520 L 90,460" stroke="rgba(34, 211, 238, 0.6)" strokeWidth="2" fill="none" filter="url(#glow-bl)" />
        <path className="circuit-line circuit-line-15" d="M 100,600 L 100,540 L 160,540 L 160,490" stroke="rgba(34, 211, 238, 0.6)" strokeWidth="2" fill="none" filter="url(#glow-bl)" />
        
        <circle className="circuit-node circuit-node-11" cx="100" cy="560" r="4" fill="rgba(34, 211, 238, 0.9)" filter="url(#glow-bl)" />
        <circle className="circuit-node circuit-node-12" cx="180" cy="520" r="4" fill="rgba(34, 211, 238, 0.9)" filter="url(#glow-bl)" />
        <circle className="circuit-node circuit-node-13" cx="80" cy="510" r="4" fill="rgba(34, 211, 238, 0.9)" filter="url(#glow-bl)" />
        <circle className="circuit-node circuit-node-14" cx="140" cy="430" r="4" fill="rgba(34, 211, 238, 0.9)" filter="url(#glow-bl)" />
        <circle className="circuit-node circuit-node-15" cx="120" cy="410" r="4" fill="rgba(34, 211, 238, 0.9)" filter="url(#glow-bl)" />
      </svg>

      {/* Bottom Right Corner */}
      <svg className="absolute bottom-0 right-0 w-[600px] h-[600px]" viewBox="0 0 600 600">
        <defs>
          <filter id="glow-br">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <path className="circuit-line circuit-line-16" d="M 600,560 L 500,560 L 500,520 L 420,520" stroke="rgba(34, 211, 238, 0.6)" strokeWidth="2" fill="none" filter="url(#glow-br)" />
        <path className="circuit-line circuit-line-17" d="M 600,510 L 520,510 L 520,470 L 460,470 L 460,430" stroke="rgba(34, 211, 238, 0.6)" strokeWidth="2" fill="none" filter="url(#glow-br)" />
        <path className="circuit-line circuit-line-18" d="M 600,460 L 540,460 L 540,410 L 480,410" stroke="rgba(34, 211, 238, 0.6)" strokeWidth="2" fill="none" filter="url(#glow-br)" />
        <path className="circuit-line circuit-line-19" d="M 560,600 L 560,520 L 510,520 L 510,460" stroke="rgba(34, 211, 238, 0.6)" strokeWidth="2" fill="none" filter="url(#glow-br)" />
        <path className="circuit-line circuit-line-20" d="M 500,600 L 500,540 L 440,540 L 440,490" stroke="rgba(34, 211, 238, 0.6)" strokeWidth="2" fill="none" filter="url(#glow-br)" />
        
        <circle className="circuit-node circuit-node-16" cx="500" cy="560" r="4" fill="rgba(34, 211, 238, 0.9)" filter="url(#glow-br)" />
        <circle className="circuit-node circuit-node-17" cx="420" cy="520" r="4" fill="rgba(34, 211, 238, 0.9)" filter="url(#glow-br)" />
        <circle className="circuit-node circuit-node-18" cx="520" cy="510" r="4" fill="rgba(34, 211, 238, 0.9)" filter="url(#glow-br)" />
        <circle className="circuit-node circuit-node-19" cx="460" cy="430" r="4" fill="rgba(34, 211, 238, 0.9)" filter="url(#glow-br)" />
        <circle className="circuit-node circuit-node-20" cx="480" cy="410" r="4" fill="rgba(34, 211, 238, 0.9)" filter="url(#glow-br)" />
      </svg>
    </div>
  );
};

export default AnimatedCircuitBackground;
