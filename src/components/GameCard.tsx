
import React from 'react';
import { cn } from '@/lib/utils';

export interface GameCardProps {
  type: 'equipment' | 'specialization' | 'attack';
  title: string;
  description: string;
  icon?: React.ReactNode;
  className?: string;
}

const GameCard: React.FC<GameCardProps> = ({
  type,
  title,
  description,
  icon,
  className
}) => {
  const getCardStyles = () => {
    switch (type) {
      case 'equipment':
        return {
          border: 'border-green-500',
          bg: 'bg-green-50/90',
          titleColor: 'text-green-600',
          borderWidth: 'border-4',
          shadow: 'shadow-[0_0_15px_rgba(34,197,94,0.3)]'
        };
      case 'specialization':
        return {
          border: 'border-blue-500',
          bg: 'bg-blue-50/90',
          titleColor: 'text-blue-600',
          borderWidth: 'border-4',
          shadow: 'shadow-[0_0_15px_rgba(59,130,246,0.3)]'
        };
      case 'attack':
        return {
          border: 'border-red-500',
          bg: 'bg-red-50/90',
          titleColor: 'text-red-600',
          borderWidth: 'border-4',
          shadow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]'
        };
    }
  };

  const getDarkModeStyles = () => {
    switch (type) {
      case 'equipment':
        return {
          bg: 'dark:bg-green-900/20',
          titleColor: 'dark:text-green-400'
        };
      case 'specialization':
        return {
          bg: 'dark:bg-blue-900/20',
          titleColor: 'dark:text-blue-400'
        };
      case 'attack':
        return {
          bg: 'dark:bg-red-900/20',
          titleColor: 'dark:text-red-400'
        };
    }
  };

  const cardStyles = getCardStyles();
  const darkStyles = getDarkModeStyles();

  return (
    <div className={cn(
      "relative w-64 h-96 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105",
      cardStyles.border,
      cardStyles.borderWidth,
      cardStyles.shadow,
      "hover:shadow-lg",
      className
    )}>
      {/* Background with circuit pattern */}
      <div className={cn(
        "absolute inset-0 opacity-10",
        "bg-gradient-to-br from-gray-200 to-gray-300",
        "dark:from-gray-700 dark:to-gray-800"
      )}>
        <div className="absolute inset-0 grid-pattern opacity-30"></div>
      </div>
      
      {/* Card content */}
      <div className={cn(
        "relative h-full flex flex-col p-6",
        cardStyles.bg,
        darkStyles.bg
      )}>
        {/* Top section with small icons */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex space-x-1">
            {icon && (
              <div className={cn("w-6 h-6", cardStyles.titleColor, darkStyles.titleColor)}>
                {icon}
              </div>
            )}
          </div>
          <div className="text-xs font-mono opacity-60">WIRED</div>
        </div>

        {/* Title */}
        <div className="flex-1 flex flex-col justify-center">
          <h2 className={cn(
            "text-2xl font-bold text-center mb-6 tracking-wider uppercase",
            cardStyles.titleColor,
            darkStyles.titleColor
          )}>
            {title}
          </h2>

          {/* Main icon/illustration area */}
          {icon && (
            <div className="flex justify-center mb-6">
              <div className={cn(
                "w-20 h-20 flex items-center justify-center",
                cardStyles.titleColor,
                darkStyles.titleColor
              )}>
                {React.cloneElement(icon as React.ReactElement, { 
                  className: "w-full h-full" 
                })}
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="mt-auto">
          <p className="text-sm text-center text-gray-800 dark:text-gray-200 font-medium leading-relaxed">
            {description}
          </p>
        </div>

        {/* Bottom corner decoration */}
        <div className="absolute bottom-4 right-4 flex space-x-1">
          <div className="text-xs font-mono opacity-40 rotate-180">WIRED</div>
          {icon && (
            <div className={cn(
              "w-4 h-4 opacity-40 rotate-180",
              cardStyles.titleColor,
              darkStyles.titleColor
            )}>
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
