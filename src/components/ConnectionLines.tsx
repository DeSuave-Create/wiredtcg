import { useEffect, useRef, useState } from 'react';
import { Cable, Computer, Bitcoin } from 'lucide-react';

interface ConnectionLinesProps {
  className?: string;
}

const ConnectionLines = ({ className = "" }: ConnectionLinesProps) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const cycle = () => {
      // Stage 1: Start to Cable (0-2s)
      setCurrentStage(1);
      
      setTimeout(() => {
        // Stage 2: Cable to Computer (2-4s)
        setCurrentStage(2);
      }, 2000);
      
      setTimeout(() => {
        // Stage 3: Computer to Bitcoin (4-6s)
        setCurrentStage(3);
      }, 4000);
      
      setTimeout(() => {
        // Wait and restart (6-7s)
        setCurrentStage(0);
      }, 6000);
    };

    cycle();
    const interval = setInterval(cycle, 7000);

    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-24 flex items-center justify-center ${className}`}
    >
      <div className="relative w-full max-w-4xl h-full">
        {/* SVG for curved wave lines */}
        <svg 
          className="absolute inset-0 w-full h-full" 
          viewBox="0 0 100 24" 
          preserveAspectRatio="none"
        >
          {/* Stage 1: Green wave line to Cable position */}
          <path
            d="M0 12 Q8 6, 16 12 T33 12"
            stroke="rgb(34, 197, 94)"
            strokeWidth="0.5"
            fill="none"
            strokeLinecap="round"
            className={`transition-all duration-1000 ease-out ${
              currentStage >= 1 ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              strokeDasharray: currentStage >= 1 ? '200' : '0',
              strokeDashoffset: currentStage >= 1 ? '0' : '200'
            }}
            {...(currentStage >= 1 && { className: `${className} animate-dash-draw` })}
          />
          
          {/* Stage 1 fade out effect */}
          <path
            d="M0 12 Q8 6, 16 12 T30 12"
            stroke="rgb(34, 197, 94)"
            strokeWidth="0.5"
            fill="none"
            strokeLinecap="round"
            className={`transition-opacity duration-500 ${
              currentStage >= 2 ? 'opacity-0' : 'opacity-100'
            }`}
            style={{
              strokeDasharray: '200',
              strokeDashoffset: '0'
            }}
          />
          
          {/* Stage 2: Red wave line from Cable to Computer */}
          <path
            d="M36 12 Q44 8, 52 12 T66 12"
            stroke="rgb(220, 38, 38)"
            strokeWidth="0.5"
            fill="none"
            strokeLinecap="round"
            className={`transition-all duration-1000 ease-out ${
              currentStage >= 2 ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              strokeDasharray: currentStage >= 2 ? '200' : '0',
              strokeDashoffset: currentStage >= 2 ? '0' : '200'
            }}
            {...(currentStage >= 2 && { className: `${className} animate-dash-draw` })}
          />
          
          {/* Stage 2 fade out effect */}
          <path
            d="M36 12 Q44 8, 52 12 T63 12"
            stroke="rgb(220, 38, 38)"
            strokeWidth="0.5"
            fill="none"
            strokeLinecap="round"
            className={`transition-opacity duration-500 ${
              currentStage >= 3 ? 'opacity-0' : 'opacity-100'
            }`}
            style={{
              strokeDasharray: '200',
              strokeDashoffset: '0'
            }}
          />
          
          {/* Stage 3: Yellow/Gold wave line from Computer to end */}
          <path
            d="M69 12 Q77 16, 85 12 T100 12"
            stroke="rgb(250, 204, 21)"
            strokeWidth="0.5"
            fill="none"
            strokeLinecap="round"
            className={`transition-all duration-1000 ease-out ${
              currentStage >= 3 ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              strokeDasharray: currentStage >= 3 ? '200' : '0',
              strokeDashoffset: currentStage >= 3 ? '0' : '200'
            }}
            {...(currentStage >= 3 && { className: `${className} animate-dash-draw` })}
          />
        </svg>
        
        {/* Icons with higher z-index to stay on top */}
        <div className="relative z-10">
          {/* Cable Icon */}
          <div 
            className={`absolute top-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
              currentStage >= 1 && currentStage < 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
            }`}
            style={{ left: '33.33%' }}
          >
            <div className="bg-white rounded-full p-1 shadow-lg">
              <Cable className="w-6 h-6 text-green-600" />
            </div>
          </div>
          
          {/* Computer Icon */}
          <div 
            className={`absolute top-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
              currentStage >= 2 && currentStage < 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
            }`}
            style={{ left: '66.66%' }}
          >
            <div className="bg-white rounded-full p-1 shadow-lg">
              <Computer className="w-6 h-6 text-red-600" />
            </div>
          </div>
          
          {/* Bitcoin Icon */}
          <div 
            className={`absolute top-1/2 right-0 transform -translate-y-1/2 transition-all duration-500 ${
              currentStage >= 3 
                ? 'opacity-100 scale-100 translate-x-0' 
                : 'opacity-0 scale-50 -translate-x-4'
            }`}
          >
            <div className="bg-white rounded-full p-1 shadow-lg">
              <Bitcoin className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionLines;