import React from 'react';
import './ElectricProgressBar.css';

interface Segment {
  color: string;
  width: number; // percentage
}

interface ElectricProgressBarProps {
  segments?: Segment[];
  iconSvg?: React.ReactNode;
  height?: number;
  className?: string;
}

const ElectricProgressBar: React.FC<ElectricProgressBarProps> = ({
  segments = [
    { color: '#22c55e', width: 30 }, // green
    { color: '#ef4444', width: 45 }, // red
    { color: '#eab308', width: 25 }, // yellow
  ],
  iconSvg = (
    <svg viewBox="0 0 24 24" fill="currentColor" className="icon-bitcoin">
      <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.548v-.002zm-6.35-4.613c.24-1.59-.974-2.45-2.64-3.03l.54-2.153-1.315-.33-.525 2.107c-.345-.087-.705-.167-1.064-.25l.526-2.127-1.32-.33-.54 2.165c-.285-.067-.565-.132-.84-.2l-1.815-.45-.35 1.407s.975.225.955.236c.535.136.63.486.615.766l-1.477 5.92c-.075.166-.24.406-.614.314.015.02-.96-.24-.96-.24l-.66 1.51 1.71.426.93.242-.54 2.19 1.32.327.54-2.17c.36.1.705.19 1.05.273l-.51 2.154 1.32.33.545-2.19c2.24.427 3.93.257 4.64-1.774.57-1.637-.03-2.58-1.217-3.196.854-.193 1.5-.76 1.68-1.93h.01zm-3.01 4.22c-.404 1.64-3.157.75-4.05.53l.72-2.9c.896.23 3.757.67 3.33 2.37zm.41-4.24c-.37 1.49-2.662.735-3.405.55l.654-2.64c.744.18 3.137.524 2.75 2.084v.006z"/>
    </svg>
  ),
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
        <div className="electric-progress-bar" style={{ height: `${height}px` }}>
          {segments.map((segment, index) => (
            <div
              key={index}
              className={`segment segment-${index}`}
              style={{
                width: `${segment.width}%`,
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
          ))}
        </div>
        
        {/* Icon at the end */}
        <div className="progress-icon" style={{ color: segments[segments.length - 1]?.color || '#eab308' }}>
          {iconSvg}
        </div>
      </div>

      {/* Slogan */}
      <div className="slogan-overlay">
        <h2 className="slogan-text">Get Connected</h2>
      </div>
    </div>
  );
};

export default ElectricProgressBar;
