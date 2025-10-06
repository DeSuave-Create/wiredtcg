import React from 'react';
import { Cable, Monitor, Bitcoin } from 'lucide-react';
import './ElectricProgressBar.css';

interface Segment {
  color: string;
  width: number; // percentage
  icon: React.ReactNode;
}

interface ElectricProgressBarProps {
  segments?: Segment[];
  height?: number;
  className?: string;
}

const ElectricProgressBar: React.FC<ElectricProgressBarProps> = ({
  segments = [
    { 
      color: '#22c55e', 
      width: 30,
      icon: <Cable size={20} />
    },
    { 
      color: '#ef4444', 
      width: 40,
      icon: <Monitor size={20} />
    },
    { 
      color: '#eab308', 
      width: 30,
      icon: <Bitcoin size={20} />
    },
  ],
  height = 4,
  className = '',
}) => {
  return (
    <div className={`electric-progress-container ${className}`}>
      {/* SVG Filters */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          {/* Glow filter */}
          <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Lightning/electric filter */}
          <filter id="lightning" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.02 0.8"
              numOctaves="3"
              seed="2"
              result="turbulence"
            >
              <animate
                attributeName="baseFrequency"
                values="0.02 0.8; 0.03 0.9; 0.02 0.8"
                dur="2.5s"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="turbulence"
              scale="3"
              xChannelSelector="R"
              yChannelSelector="G"
              result="displacement"
            />
            <feGaussianBlur in="displacement" stdDeviation="0.5" result="blur" />
            <feMerge>
              <feMergeNode in="SourceGraphic" />
              <feMergeNode in="blur" />
            </feMerge>
          </filter>

          {/* Strong glow for sparks */}
          <filter id="spark-glow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Progress bar */}
      <div className="electric-progress-bar-wrapper">
        {segments.map((segment, index) => (
          <React.Fragment key={index}>
            <div 
              className="segment-wrapper"
              style={{
                animationDelay: `${index * 1.2}s`
              }}
            >
              <div
                className={`segment segment-${index}`}
                style={{
                  width: `${segment.width}%`,
                  height: `${height}px`,
                  backgroundColor: segment.color,
                  boxShadow: `0 0 10px ${segment.color}, 0 0 20px ${segment.color}40`,
                }}
              >
                {/* Lightning overlay */}
                <div
                  className="lightning-overlay"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${segment.color}30, transparent)`,
                  }}
                />
                
                {/* Sparks */}
                <div className="sparks">
                  {[...Array(3)].map((_, sparkIndex) => (
                    <div
                      key={sparkIndex}
                      className={`spark spark-${sparkIndex}`}
                      style={{
                        backgroundColor: segment.color,
                        left: `${20 + sparkIndex * 30}%`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            {/* Icon after each segment */}
            <div 
              className="progress-icon" 
              style={{ 
                color: segment.color,
                animationDelay: `${index * 1.2 + 0.8}s`
              }}
            >
              {segment.icon}
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Slogan */}
      <div className="slogan-overlay">
        <h2 className="slogan-text">Get Connected</h2>
      </div>
    </div>
  );
};

export default ElectricProgressBar;
