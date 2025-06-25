
import React from 'react';
import { cn } from '@/lib/utils';

export interface GameCardProps {
  type: 'equipment' | 'specialization' | 'attack';
  title: string;
  description: string;
  icon?: React.ReactNode;
  className?: string;
  illustration?: React.ReactNode;
}

const GameCard: React.FC<GameCardProps> = ({
  type,
  title,
  description,
  icon,
  className,
  illustration
}) => {
  const getCardStyles = () => {
    switch (type) {
      case 'equipment':
        return {
          border: 'border-green-600',
          bg: 'bg-gray-100',
          titleColor: 'text-green-600',
          borderWidth: 'border-8',
          shadow: 'shadow-xl',
          rounded: 'rounded-3xl'
        };
      case 'specialization':
        return {
          border: 'border-blue-600',
          bg: 'bg-gray-100',
          titleColor: 'text-blue-600',
          borderWidth: 'border-8',
          shadow: 'shadow-xl',
          rounded: 'rounded-3xl'
        };
      case 'attack':
        return {
          border: 'border-red-600',
          bg: 'bg-gray-100',
          titleColor: 'text-red-600',
          borderWidth: 'border-8',
          shadow: 'shadow-xl',
          rounded: 'rounded-3xl'
        };
    }
  };

  const cardStyles = getCardStyles();

  // Get the card background from the parent section
  const parentSection = document.querySelector('[data-card-bg]');
  const cardBg = parentSection?.getAttribute('data-card-bg');

  return (
    <div className={cn(
      "relative w-64 h-96 overflow-hidden transition-all duration-300 hover:scale-105",
      cardStyles.border,
      cardStyles.borderWidth,
      cardStyles.rounded,
      cardStyles.shadow,
      "hover:shadow-2xl",
      className
    )}>
      {/* Custom background or circuit board pattern */}
      <div className="absolute inset-0">
        {cardBg ? (
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `url(${cardBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
        ) : (
          <div className="absolute inset-0 opacity-20" style={{
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
          }}></div>
        )}
      </div>
      
      {/* Card content */}
      <div className={cn(
        "relative h-full flex flex-col p-6",
        cardStyles.bg
      )}>
        {/* Top corner icon */}
        <div className="absolute top-4 left-4">
          {icon && (
            <div className={cn("w-6 h-6", cardStyles.titleColor)}>
              {icon}
            </div>
          )}
        </div>

        {/* Title - Bold, all-caps, colored */}
        <div className="mb-6 mt-8">
          <h2 className={cn(
            "text-2xl font-black text-center tracking-wider uppercase leading-tight font-sans",
            cardStyles.titleColor
          )}>
            {title}
          </h2>
        </div>

        {/* Main illustration area */}
        <div className="flex-1 flex items-center justify-center mb-6">
          {illustration ? (
            <div className="w-full h-full flex items-center justify-center">
              {illustration}
            </div>
          ) : icon && (
            <div className={cn("w-32 h-32 flex items-center justify-center", cardStyles.titleColor)}>
              {React.cloneElement(icon as React.ReactElement, { 
                className: "w-full h-full" 
              })}
            </div>
          )}
        </div>

        {/* Description - Monospace font, black text */}
        <div className="mt-auto text-center">
          <p className="text-sm font-mono text-black leading-relaxed font-medium">
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
