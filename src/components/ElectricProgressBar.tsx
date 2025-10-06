import { Cable, Monitor, Bitcoin } from 'lucide-react';
import { useEffect, useState } from 'react';
import './ElectricProgressBar.css';

interface Segment {
  color: string;
  icon: React.ReactNode;
  label: string;
}

const ElectricProgressBar = () => {
  const [progress, setProgress] = useState(0);
  const [currentSegment, setCurrentSegment] = useState(0);
  const [poweredSegments, setPoweredSegments] = useState<Set<number>>(new Set());
  const [bouncingSegments, setBouncingSegments] = useState<Set<number>>(new Set());

  const segments: Segment[] = [
    { color: 'from-green-500 to-emerald-400', icon: <Cable className="w-6 h-6" />, label: 'Connect' },
    { color: 'from-red-500 to-rose-400', icon: <Monitor className="w-6 h-6" />, label: 'Plan' },
    { color: 'from-yellow-500 to-amber-400', icon: <Bitcoin className="w-6 h-6" />, label: 'Mine' },
  ];

  const getSegmentProgress = (segmentIndex: number) => {
    const segmentWidth = 100 / segments.length;
    const segmentStart = segmentIndex * segmentWidth;
    const segmentEnd = (segmentIndex + 1) * segmentWidth;
    
    if (progress <= segmentStart) return 0;
    if (progress >= segmentEnd) return 100;
    return ((progress - segmentStart) / segmentWidth) * 100;
  };

  const segmentColors = [
    {
      gradient: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
      glow: '0 0 20px rgba(16, 185, 129, 0.8), 0 0 40px rgba(16, 185, 129, 0.6), inset 0 0 10px rgba(16, 185, 129, 0.8)'
    },
    {
      gradient: 'linear-gradient(90deg, #dc2626 0%, #ff1a1a 100%)',
      glow: '0 0 20px rgba(220, 38, 38, 0.8), 0 0 40px rgba(220, 38, 38, 0.6), inset 0 0 10px rgba(220, 38, 38, 0.8)'
    },
    {
      gradient: 'linear-gradient(90deg, #facc15 0%, #fde047 100%)',
      glow: '0 0 20px rgba(250, 204, 21, 0.8), 0 0 40px rgba(250, 204, 21, 0.6), inset 0 0 10px rgba(250, 204, 21, 0.8)'
    }
  ];

  useEffect(() => {
    const duration = 6000; // 6 seconds total
    const pauseDuration = 1000; // 1 second pause before restart
    let startTime = Date.now();
    let isPaused = false;
    let pauseStartTime = 0;

    const interval = setInterval(() => {
      if (isPaused) {
        if (Date.now() - pauseStartTime >= pauseDuration) {
          // Restart
          isPaused = false;
          startTime = Date.now();
          setProgress(0);
          setCurrentSegment(0);
          setPoweredSegments(new Set()); // Reset powered segments
          setBouncingSegments(new Set()); // Reset bouncing segments
        }
        return;
      }

      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);
      
      const segmentIndex = Math.min(
        Math.floor((newProgress / 100) * segments.length),
        segments.length - 1
      );
      setCurrentSegment(segmentIndex);

      // Track which segments have been powered up
      segments.forEach((_, index) => {
        const segmentProgress = (index + 1) / segments.length * 100;
        if (newProgress >= segmentProgress) {
          setPoweredSegments(prev => {
            const wasPowered = prev.has(index);
            const newSet = new Set(prev).add(index);
            
            // Trigger bounce animation for newly powered segments
            if (!wasPowered) {
              setBouncingSegments(prevBouncing => new Set(prevBouncing).add(index));
              // Remove bouncing class after animation completes
              setTimeout(() => {
                setBouncingSegments(prevBouncing => {
                  const newBouncing = new Set(prevBouncing);
                  newBouncing.delete(index);
                  return newBouncing;
                });
              }, 800); // Increased to match smoother animation duration
            }
            
            return newSet;
          });
        }
      });

      if (newProgress >= 100 && !isPaused) {
        isPaused = true;
        pauseStartTime = Date.now();
      }
    }, 16);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="electric-progress-container">
      <div className="electric-progress-bar">
        {/* WIRED Logo at start */}
        <div className="progress-logo">
          <img 
            src="/wire-logo-official.png" 
            alt="WIRED Logo" 
            className="logo-image"
          />
        </div>

        {/* Background segments */}
        <div className="segments-background">
          {segments.map((segment, index) => (
            <div
              key={index}
              className="segment-bg"
              style={{ width: `${100 / segments.length}%` }}
            />
          ))}
        </div>

        {/* Animated fill with electric effect - Multiple segments */}
        {segments.map((segment, index) => {
          const segmentProgress = getSegmentProgress(index);
          const segmentWidth = 100 / segments.length;
          const colors = segmentColors[index];
          
          return segmentProgress > 0 ? (
            <div
              key={index}
              className="electric-fill-segment"
              style={{ 
                left: `${index * segmentWidth}%`,
                width: `${segmentWidth}%`
              }}
            >
              <div
                className="electric-fill"
                style={{ 
                  width: `${segmentProgress}%`,
                  background: colors.gradient,
                  boxShadow: colors.glow
                }}
              >
                <div className="lightning-overlay" />
                <div className="electric-wave" />
                <div className="electric-pulse" />
                {segmentProgress > 95 && <div className="electric-sparks" />}
              </div>
            </div>
          ) : null;
        })}

        {/* Segment icons */}
        {segments.map((segment, index) => {
          const segmentProgress = (index + 1) / segments.length * 100;
          const isPowered = poweredSegments.has(index);
          const isBouncing = bouncingSegments.has(index);
          const isCurrent = currentSegment === index && progress < 100;

          return (
            <div
              key={index}
              className={`segment-icon ${isPowered ? 'powered' : ''} ${isCurrent ? 'current' : ''} ${isBouncing ? 'bouncing' : ''}`}
              style={{ left: `${((index + 1) / segments.length) * 100}%` }}
            >
              <div className={`icon-wrapper bg-gradient-to-br ${segment.color}`}>
                {segment.icon}
                {isCurrent && <div className="electric-pulse" />}
              </div>
              <span className="segment-label">{segment.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ElectricProgressBar;
