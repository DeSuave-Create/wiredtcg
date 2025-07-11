
import React from 'react';
import { cn } from '@/lib/utils';

export interface GameCardProps {
  type: 'equipment' | 'specialization' | 'attack';
  title: string;
  description: string;
  icon?: React.ReactNode;
  className?: string;
  illustration?: React.ReactNode;
  cardBackgroundImage?: string;
}

const GameCard: React.FC<GameCardProps> = ({
  type,
  title,
  description,
  icon,
  className,
  illustration,
  cardBackgroundImage
}) => {
  const getCardStyles = () => {
    switch (type) {
      case 'equipment':
        return {
          border: 'border-green-600',
          bg: 'bg-gray-100',
          titleColor: 'text-green-600',
          borderWidth: 'border-8',
          shadow: 'shadow-2xl drop-shadow-lg',
          rounded: 'rounded-3xl'
        };
      case 'specialization':
        return {
          border: 'border-blue-600',
          bg: 'bg-gray-100',
          titleColor: 'text-blue-600',
          borderWidth: 'border-8',
          shadow: 'shadow-2xl drop-shadow-lg',
          rounded: 'rounded-3xl'
        };
      case 'attack':
        return {
          border: 'border-red-600',
          bg: 'bg-gray-100',
          titleColor: 'text-red-600',
          borderWidth: 'border-8',
          shadow: 'shadow-2xl drop-shadow-lg',
          rounded: 'rounded-3xl'
        };
    }
  };

  const cardStyles = getCardStyles();

  const getWaveColor = () => {
    switch (type) {
      case 'equipment':
        return 'rgba(34, 197, 94, 0.3)'; // green-500 with opacity
      case 'specialization':
        return 'rgba(37, 99, 235, 0.3)'; // blue-600 with opacity
      case 'attack':
        return 'rgba(220, 38, 38, 0.3)'; // red-600 with opacity
    }
  };

  return (
    <div className={cn(
      "relative w-64 h-96 overflow-hidden transition-all duration-300 hover:scale-105 circuit-card",
      cardStyles.border,
      cardStyles.borderWidth,
      cardStyles.rounded,
      cardStyles.shadow,
      "hover:shadow-3xl hover:drop-shadow-2xl",
      className
    )}>
      {/* Color wave effect */}
      <div 
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(45deg, transparent 30%, ${getWaveColor()} 50%, transparent 70%)`,
          animation: 'wave-sweep 2s ease-in-out infinite'
        }}
      />
      {/* Custom background or circuit board pattern */}
      <div className="absolute inset-0">
        {cardBackgroundImage ? (
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `url(${cardBackgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
        ) : (
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                radial-gradient(circle at 20% 20%, rgba(200, 200, 200, 0.3) 2px, transparent 2px),
                radial-gradient(circle at 80% 20%, rgba(200, 200, 200, 0.3) 2px, transparent 2px),
                radial-gradient(circle at 20% 80%, rgba(200, 200, 200, 0.3) 2px, transparent 2px),
                radial-gradient(circle at 80% 80%, rgba(200, 200, 200, 0.3) 2px, transparent 2px),
                radial-gradient(circle at 50% 50%, rgba(200, 200, 200, 0.3) 2px, transparent 2px),
                linear-gradient(rgba(200, 200, 200, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(200, 200, 200, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px, 40px 40px, 40px 40px, 40px 40px, 40px 40px, 20px 20px, 20px 20px'
            }}
          />
        )}
      </div>
      
      {/* Card content */}
      <div className={cn("relative h-full flex flex-col p-6", cardStyles.bg)}>
        {/* Top corner icon */}
        <div className="absolute top-4 left-4">
          {icon && (
            <div className={cn("w-6 h-6", cardStyles.titleColor)}>
              {icon}
            </div>
          )}
        </div>

        {/* Title - Bold, all-caps, colored */}
        <div className="mt-4 mb-4">
          <h2 className={cn(
            "text-2xl font-black text-center tracking-wider uppercase leading-tight font-sans",
            cardStyles.titleColor
          )}>
            {title}
          </h2>
        </div>

        {/* Main illustration area - Fixed height */}
        <div className="flex-1 flex items-center justify-center mb-6 px-4 h-32">
          {illustration ? (
            <div className="w-full h-full flex items-center justify-center">
              {illustration}
            </div>
          ) : icon && (
            <div className={cn("w-24 h-24 flex items-center justify-center", cardStyles.titleColor)}>
              {React.cloneElement(icon as React.ReactElement, {
                className: "w-full h-full"
              })}
            </div>
          )}
        </div>

        {/* Description - Fixed height container */}
        <div className="text-center px-2 pb-4 h-20 flex items-center justify-center">
          <p className="text-sm text-black leading-relaxed font-medium">
            {description}
          </p>
        </div>

        {/* Bottom right corner icon */}
        <div className="absolute bottom-4 right-4">
          {icon && (
            <div className={cn("w-4 h-4 transform rotate-180", cardStyles.titleColor)}>
              {React.cloneElement(icon as React.ReactElement, {
                className: "w-full h-full"
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameCard;
