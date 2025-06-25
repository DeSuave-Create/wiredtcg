
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
          border: 'border-green-500',
          bg: 'bg-gray-200',
          titleColor: 'text-green-600',
          borderWidth: 'border-8',
          shadow: 'shadow-none',
          rounded: 'rounded-3xl'
        };
      case 'specialization':
        return {
          border: 'border-blue-500',
          bg: 'bg-gray-200',
          titleColor: 'text-blue-600',
          borderWidth: 'border-8',
          shadow: 'shadow-none',
          rounded: 'rounded-3xl'
        };
      case 'attack':
        return {
          border: 'border-red-500',
          bg: 'bg-gray-200',
          titleColor: 'text-red-600',
          borderWidth: 'border-8',
          shadow: 'shadow-none',
          rounded: 'rounded-3xl'
        };
    }
  };

  const getDarkModeStyles = () => {
    switch (type) {
      case 'equipment':
        return {
          bg: 'dark:bg-gray-200',
          titleColor: 'dark:text-green-600'
        };
      case 'specialization':
        return {
          bg: 'dark:bg-gray-200',
          titleColor: 'dark:text-blue-600'
        };
      case 'attack':
        return {
          bg: 'dark:bg-gray-200',
          titleColor: 'dark:text-red-600'
        };
    }
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
      "hover:shadow-lg",
      className
    )}>
      {/* Background with circuit pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 grid-pattern opacity-40"></div>
      </div>
      
      {/* Card content */}
      <div className={cn(
        "relative h-full flex flex-col p-6",
        cardStyles.bg,
        darkStyles.bg
      )}>
        {/* Top section with small corner icons */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex space-x-1">
            {icon && (
              <div className="w-6 h-6 text-gray-600">
                {icon}
              </div>
            )}
          </div>
          <div className="text-xs font-mono text-gray-500">WIRED</div>
        </div>

        {/* Title */}
        <div className="mb-4">
          <h2 className={cn(
            "text-4xl font-black text-center tracking-wider uppercase leading-tight",
            cardStyles.titleColor,
            darkStyles.titleColor
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
            <div className="w-32 h-32 flex items-center justify-center text-gray-700">
              {React.cloneElement(icon as React.ReactElement, { 
                className: "w-full h-full" 
              })}
            </div>
          )}
        </div>

        {/* Description */}
        <div className="mt-auto text-center">
          <p className="text-lg font-bold text-black leading-tight">
            {description}
          </p>
        </div>

        {/* Bottom corner decoration */}
        <div className="absolute bottom-4 right-4 flex space-x-1">
          <div className="text-xs font-mono text-gray-500 rotate-180">WIRED</div>
          {icon && (
            <div className="w-4 h-4 text-gray-600 rotate-180">
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
