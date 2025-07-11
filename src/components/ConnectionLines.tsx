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
        {/* Stage 1: Green line to Cable position */}
        <div 
          className={`absolute top-1/2 left-0 h-0.5 bg-green-600 transition-all duration-1000 ease-out ${
            currentStage >= 1 ? 'w-1/3' : 'w-0'
          }`}
          style={{ transform: 'translateY(-50%)' }}
        />
        
        {/* Green line fade out after cable appears */}
        <div 
          className={`absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-transparent to-green-600 transition-all duration-500 ${
            currentStage >= 2 ? 'w-1/3 opacity-0' : 'w-0 opacity-100'
          }`}
          style={{ transform: 'translateY(-50%)' }}
        />
        
        {/* Cable Icon */}
        <div 
          className={`absolute top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
            currentStage >= 1 && currentStage < 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
        >
          <Cable className="w-8 h-8 text-green-600" />
        </div>
        
        {/* Stage 2: Red line from Cable to Computer */}
        <div 
          className={`absolute top-1/2 left-1/3 h-0.5 bg-red-600 transition-all duration-1000 ease-out ${
            currentStage >= 2 ? 'w-1/3' : 'w-0'
          }`}
          style={{ transform: 'translateY(-50%)' }}
        />
        
        {/* Red line fade out after computer appears */}
        <div 
          className={`absolute top-1/2 left-1/3 h-0.5 bg-gradient-to-r from-transparent to-red-600 transition-all duration-500 ${
            currentStage >= 3 ? 'w-1/3 opacity-0' : 'w-0 opacity-100'
          }`}
          style={{ transform: 'translateY(-50%)' }}
        />
        
        {/* Computer Icon */}
        <div 
          className={`absolute top-1/2 left-2/3 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
            currentStage >= 2 && currentStage < 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
        >
          <Computer className="w-8 h-8 text-red-600" />
        </div>
        
        {/* Stage 3: Yellow/Gold line from Computer to end */}
        <div 
          className={`absolute top-1/2 left-2/3 h-0.5 bg-yellow-400 transition-all duration-1000 ease-out ${
            currentStage >= 3 ? 'w-1/3' : 'w-0'
          }`}
          style={{ transform: 'translateY(-50%)' }}
        />
        
        {/* Bitcoin Icon with fly-out animation */}
        <div 
          className={`absolute top-1/2 right-0 transform -translate-y-1/2 transition-all duration-500 ${
            currentStage >= 3 
              ? 'opacity-100 scale-100 translate-x-0' 
              : 'opacity-0 scale-50 -translate-x-4'
          }`}
        >
          <Bitcoin className="w-8 h-8 text-yellow-400" />
        </div>
      </div>
    </div>
  );
};

export default ConnectionLines;