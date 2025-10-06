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
    { color: 'from-red-500 to-rose-400', icon: <Monitor className="w-6 h-6" />, label: 'Power' },
    { color: 'from-yellow-500 to-amber-400', icon: <Bitcoin className="w-6 h-6" />, label: 'Secure' },
  ];

  useEffect(() => {
    const duration = 6000; // 6 seconds total
    const segmentDuration = duration / segments.length;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);
      
      const segmentIndex = Math.min(
        Math.floor(elapsed / segmentDuration),
        segments.length - 1
      );
      setCurrentSegment(segmentIndex);

      if (newProgress >= 100) {
        setTimeout(() => {
          setProgress(0);
          setCurrentSegment(0);
        }, 1000);
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
          style={{ width: `${progress}%` }}
        >
          <div className="lightning-overlay" />
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

      {/* Final text */}
      <div className={`connection-text ${progress >= 100 ? 'visible' : ''}`}>
        <span className="electric-text">GET CONNECTED</span>
      </div>
    </div>
  );
};

export default ElectricProgressBar;
