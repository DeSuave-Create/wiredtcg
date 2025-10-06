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

  const segments: Segment[] = [
    { color: 'from-green-500 to-emerald-400', icon: <Cable className="w-6 h-6" />, label: 'Connect' },
    { color: 'from-red-500 to-rose-400', icon: <Monitor className="w-6 h-6" />, label: 'Plan' },
    { color: 'from-yellow-500 to-amber-400', icon: <Bitcoin className="w-6 h-6" />, label: 'Mine' },
  ];

  const getSegmentColor = () => {
    const segmentWidth = 100 / segments.length;
    if (progress <= segmentWidth) {
      return 'linear-gradient(90deg, #10b981 0%, #34d399 100%)'; // Green
    } else if (progress <= segmentWidth * 2) {
      return 'linear-gradient(90deg, #dc2626 0%, #ff1a1a 100%)'; // Bright Red
    } else {
      return 'linear-gradient(90deg, #facc15 0%, #fde047 100%)'; // Bright Yellow
    }
  };

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

        {/* Animated fill with electric effect */}
        <div 
          className="electric-fill"
          style={{ 
            width: `${progress}%`,
            background: getSegmentColor()
          }}
        >
          <div className="lightning-overlay" />
          <div className="electric-wave" />
          <div className="electric-pulse" />
          <div className="electric-sparks" />
        </div>

        {/* Segment icons */}
        {segments.map((segment, index) => {
          const segmentProgress = (index + 1) / segments.length * 100;
          const isActive = progress >= segmentProgress;
          const isCurrent = currentSegment === index;

          return (
            <div
              key={index}
              className={`segment-icon ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}
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
