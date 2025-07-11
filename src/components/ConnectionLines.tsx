import { useEffect, useRef, useState } from 'react';

interface ConnectionLinesProps {
  className?: string;
}

const ConnectionLines = ({ className = "" }: ConnectionLinesProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (svgRef.current) {
      observer.observe(svgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <svg
      ref={svgRef}
      className={`w-full h-32 ${className}`}
      viewBox="0 0 800 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main connection line */}
      <path
        d="M50 64 Q200 20, 400 64 T750 64"
        className={`connection-line ${isVisible ? 'animate' : ''}`}
        style={{ animationDelay: '0s' }}
      />
      
      {/* Branch lines */}
      <path
        d="M200 64 L200 40 L250 40"
        className={`connection-line ${isVisible ? 'animate' : ''}`}
        style={{ animationDelay: '0.3s' }}
      />
      
      <path
        d="M400 64 L400 88 L450 88"
        className={`connection-line ${isVisible ? 'animate' : ''}`}
        style={{ animationDelay: '0.6s' }}
      />
      
      <path
        d="M600 64 L600 40 L650 40"
        className={`connection-line ${isVisible ? 'animate' : ''}`}
        style={{ animationDelay: '0.9s' }}
      />

      {/* Connection nodes */}
      <circle
        cx="50"
        cy="64"
        r="4"
        fill="rgba(11, 206, 49, 0.9)"
        className={isVisible ? 'animate-glow-pulse' : ''}
        style={{ animationDelay: '1.2s' }}
      />
      <circle
        cx="200"
        cy="64"
        r="3"
        fill="rgba(11, 206, 49, 0.7)"
        className={isVisible ? 'animate-glow-pulse' : ''}
        style={{ animationDelay: '1.4s' }}
      />
      <circle
        cx="400"
        cy="64"
        r="3"
        fill="rgba(11, 206, 49, 0.7)"
        className={isVisible ? 'animate-glow-pulse' : ''}
        style={{ animationDelay: '1.6s' }}
      />
      <circle
        cx="600"
        cy="64"
        r="3"
        fill="rgba(11, 206, 49, 0.7)"
        className={isVisible ? 'animate-glow-pulse' : ''}
        style={{ animationDelay: '1.8s' }}
      />
      <circle
        cx="750"
        cy="64"
        r="4"
        fill="rgba(11, 206, 49, 0.9)"
        className={isVisible ? 'animate-glow-pulse' : ''}
        style={{ animationDelay: '2s' }}
      />
    </svg>
  );
};

export default ConnectionLines;