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
          console.log('Connection lines triggered!');
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
      className={`w-full h-32 ${className} overflow-visible`}
      viewBox="0 0 800 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main connection line - make it more visible */}
      <path
        d="M50 64 Q200 20, 400 64 T750 64"
        className={`${isVisible ? 'animate-connect-line' : ''}`}
        style={{ 
          stroke: 'rgb(34, 197, 94)',
          strokeWidth: '3',
          fill: 'none',
          strokeDasharray: '1000',
          strokeDashoffset: isVisible ? '0' : '1000',
          transition: 'stroke-dashoffset 2s ease-out',
          animationDelay: '0s' 
        }}
      />
      
      {/* Branch lines - make them more visible */}
      <path
        d="M200 64 L200 40 L250 40"
        style={{ 
          stroke: 'rgb(34, 197, 94)',
          strokeWidth: '2',
          fill: 'none',
          strokeDasharray: '100',
          strokeDashoffset: isVisible ? '0' : '100',
          transition: 'stroke-dashoffset 1s ease-out 0.5s'
        }}
      />
      
      <path
        d="M400 64 L400 88 L450 88"
        style={{ 
          stroke: 'rgb(34, 197, 94)',
          strokeWidth: '2',
          fill: 'none',
          strokeDasharray: '100',
          strokeDashoffset: isVisible ? '0' : '100',
          transition: 'stroke-dashoffset 1s ease-out 1s'
        }}
      />
      
      <path
        d="M600 64 L600 40 L650 40"
        style={{ 
          stroke: 'rgb(34, 197, 94)',
          strokeWidth: '2',
          fill: 'none',
          strokeDasharray: '100',
          strokeDashoffset: isVisible ? '0' : '100',
          transition: 'stroke-dashoffset 1s ease-out 1.5s'
        }}
      />

      {/* Connection nodes - make them more visible */}
      <circle
        cx="50"
        cy="64"
        r="6"
        fill="rgb(34, 197, 94)"
        className={isVisible ? 'animate-ping' : ''}
        style={{ animationDelay: '2s', animationDuration: '2s' }}
      />
      <circle
        cx="200"
        cy="64"
        r="4"
        fill="rgb(34, 197, 94)"
        className={isVisible ? 'animate-pulse' : ''}
        style={{ animationDelay: '2.2s' }}
      />
      <circle
        cx="400"
        cy="64"
        r="4"
        fill="rgb(34, 197, 94)"
        className={isVisible ? 'animate-pulse' : ''}
        style={{ animationDelay: '2.4s' }}
      />
      <circle
        cx="600"
        cy="64"
        r="4"
        fill="rgb(34, 197, 94)"
        className={isVisible ? 'animate-pulse' : ''}
        style={{ animationDelay: '2.6s' }}
      />
      <circle
        cx="750"
        cy="64"
        r="6"
        fill="rgb(34, 197, 94)"
        className={isVisible ? 'animate-ping' : ''}
        style={{ animationDelay: '2.8s', animationDuration: '2s' }}
      />
    </svg>
  );
};

export default ConnectionLines;