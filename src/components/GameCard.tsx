
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
          border: 'border-blue-500',
          bg: 'bg-gray-50',
          titleColor: 'text-blue-600',
          borderWidth: 'border-4',
          shadow: 'shadow-lg',
          rounded: 'rounded-2xl'
        };
      case 'specialization':
        return {
          border: 'border-blue-500',
          bg: 'bg-gray-50',
          titleColor: 'text-blue-600',
          borderWidth: 'border-4',
          shadow: 'shadow-lg',
          rounded: 'rounded-2xl'
        };
      case 'attack':
        return {
          border: 'border-blue-500',
          bg: 'bg-gray-50',
          titleColor: 'text-blue-600',
          borderWidth: 'border-4',
          shadow: 'shadow-lg',
          rounded: 'rounded-2xl'
        };
    }
  };

  const getDarkModeStyles = () => {
    return {
      bg: 'dark:bg-gray-50',
      titleColor: 'dark:text-blue-600'
    };
  };

  const cardStyles = getCardStyles();
  const darkStyles = getDarkModeStyles();

  return (
    <div className={cn(
      "relative w-64 h-96 overflow-hidden transition-all duration-300 hover:scale-105",
      cardStyles.border,
      cardStyles.borderWidth,
      cardStyles.rounded,
      cardStyles.shadow,
      "hover:shadow-xl",
      className
    )}>
      {/* Light tech-themed background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 150, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 150, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}></div>
      </div>
      
      {/* Card content */}
      <div className={cn(
        "relative h-full flex flex-col p-6",
        cardStyles.bg,
        darkStyles.bg
      )}>
        {/* Top section with corner icon */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex space-x-1">
            {icon && (
              <div className="w-6 h-6 text-blue-500">
                {icon}
              </div>
            )}
          </div>
        </div>

        {/* Title - Bold, all-caps, bright blue */}
        <div className="mb-6">
          <h2 className={cn(
            "text-2xl font-black text-center tracking-wider uppercase leading-tight font-sans",
            "text-blue-500" // Using #0096FF equivalent
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
            <div className="w-32 h-32 flex items-center justify-center text-blue-500">
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
            <div className="w-4 h-4 text-blue-400 transform rotate-180">
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
