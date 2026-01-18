import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type EventType = 'audit-success' | 'audit-blocked' | 'head-hunter' | 'seal-the-deal' | 'ai-action' | 'classification-swap';

interface SwapAnimationData {
  stolenCardImage?: string;
  stolenCardName?: string;
  discardedCardImage?: string;
  discardedCardName?: string;
}

interface GameEventAnimationProps {
  event: EventType | null;
  message?: string;
  swapData?: SwapAnimationData;
  onComplete?: () => void;
}

export function GameEventAnimation({ event, message, swapData, onComplete }: GameEventAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'enter' | 'hold' | 'exit'>('enter');

  useEffect(() => {
    if (event) {
      setIsVisible(true);
      setAnimationPhase('enter');
      
      // For swap animation, use longer duration
      const holdTime = event === 'classification-swap' ? 1500 : 1500;
      const exitTime = event === 'classification-swap' ? 2500 : 2000;
      
      const holdTimer = setTimeout(() => setAnimationPhase('hold'), 300);
      const exitTimer = setTimeout(() => setAnimationPhase('exit'), holdTime);
      const completeTimer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, exitTime);
      
      return () => {
        clearTimeout(holdTimer);
        clearTimeout(exitTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [event, onComplete]);

  if (!event || !isVisible) return null;

  // Classification Swap Animation
  if (event === 'classification-swap' && swapData) {
    return (
      <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div className={cn(
          "absolute inset-0 bg-black/60 transition-opacity duration-300",
          animationPhase === 'enter' ? 'opacity-0' : 'opacity-100',
          animationPhase === 'exit' && 'opacity-0'
        )} />
        
        {/* Main container */}
        <div className="relative flex items-center gap-8">
          {/* Discarded card (flies out to left) */}
          {swapData.discardedCardImage && (
            <div className={cn(
              "relative transition-all duration-500 ease-out",
              animationPhase === 'enter' && "translate-x-16 opacity-100 scale-100",
              animationPhase === 'hold' && "translate-x-0 opacity-100 scale-90",
              animationPhase === 'exit' && "-translate-x-32 opacity-0 scale-75 rotate-[-15deg]"
            )}>
              <div className="w-24 h-36 rounded-lg border-2 border-red-500 overflow-hidden shadow-lg shadow-red-500/40 relative">
                <img 
                  src={swapData.discardedCardImage} 
                  alt={swapData.discardedCardName || 'Discarded'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-red-900/40" />
              </div>
              <div className={cn(
                "absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium text-red-400 transition-opacity duration-300",
                animationPhase === 'exit' && "opacity-0"
              )}>
                🗑️ Discarded
              </div>
            </div>
          )}
          
          {/* Swap arrows */}
          <div className={cn(
            "flex flex-col items-center gap-1 transition-all duration-500",
            animationPhase === 'enter' && "opacity-0 scale-50",
            animationPhase === 'hold' && "opacity-100 scale-100",
            animationPhase === 'exit' && "opacity-0 scale-50"
          )}>
            <span className="text-3xl animate-pulse">⚔️</span>
            <span className="text-sm text-white font-bold bg-purple-600/80 px-2 py-1 rounded">SWAP</span>
          </div>
          
          {/* Stolen card (flies in from right) */}
          {swapData.stolenCardImage && (
            <div className={cn(
              "relative transition-all duration-500 ease-out",
              animationPhase === 'enter' && "translate-x-32 opacity-0 scale-75",
              animationPhase === 'hold' && "translate-x-0 opacity-100 scale-110",
              animationPhase === 'exit' && "-translate-x-16 opacity-100 scale-100"
            )}>
              <div className={cn(
                "w-24 h-36 rounded-lg border-2 border-purple-500 overflow-hidden shadow-2xl relative",
                animationPhase === 'hold' && "shadow-purple-500/60 animate-pulse"
              )}>
                <img 
                  src={swapData.stolenCardImage} 
                  alt={swapData.stolenCardName || 'Stolen'}
                  className="w-full h-full object-cover"
                />
                {/* Glow overlay */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-t from-purple-600/40 to-transparent transition-opacity",
                  animationPhase === 'hold' && "opacity-100",
                  animationPhase !== 'hold' && "opacity-0"
                )} />
              </div>
              <div className={cn(
                "absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium text-purple-300 transition-opacity duration-300",
                animationPhase === 'enter' && "opacity-0"
              )}>
                🎯 Stolen!
              </div>
            </div>
          )}
        </div>
        
        {/* Title */}
        <div className={cn(
          "absolute top-1/4 left-1/2 -translate-x-1/2 text-center transition-all duration-500",
          animationPhase === 'enter' && "opacity-0 -translate-y-4",
          animationPhase === 'hold' && "opacity-100 translate-y-0",
          animationPhase === 'exit' && "opacity-0 translate-y-4"
        )}>
          <span className="text-2xl font-bold text-white drop-shadow-lg">
            {message || 'Classification Swapped!'}
          </span>
        </div>
      </div>
    );
  }

  const getEventStyles = () => {
    switch (event) {
      case 'audit-success':
        return {
          bg: 'bg-gradient-to-r from-yellow-600/90 to-amber-600/90',
          border: 'border-yellow-400',
          icon: '📋',
          glow: 'shadow-yellow-500/50',
        };
      case 'audit-blocked':
        return {
          bg: 'bg-gradient-to-r from-blue-600/90 to-cyan-600/90',
          border: 'border-blue-400',
          icon: '🛡️',
          glow: 'shadow-blue-500/50',
        };
      case 'head-hunter':
        return {
          bg: 'bg-gradient-to-r from-purple-600/90 to-pink-600/90',
          border: 'border-purple-400',
          icon: '🎯',
          glow: 'shadow-purple-500/50',
        };
      case 'seal-the-deal':
        return {
          bg: 'bg-gradient-to-r from-amber-500/90 to-red-600/90',
          border: 'border-amber-400',
          icon: '💎',
          glow: 'shadow-amber-500/50',
        };
      case 'ai-action':
        return {
          bg: 'bg-gradient-to-r from-gray-700/90 to-gray-600/90',
          border: 'border-gray-500',
          icon: '🤖',
          glow: 'shadow-gray-500/30',
        };
      default:
        return {
          bg: 'bg-gray-800/90',
          border: 'border-gray-600',
          icon: '⚡',
          glow: '',
        };
    }
  };

  const styles = getEventStyles();

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <div
        className={cn(
          "px-8 py-4 rounded-xl border-2 shadow-2xl",
          "animate-[scale-in_0.3s_ease-out,fade-out_0.3s_ease-in_1.7s_forwards]",
          styles.bg,
          styles.border,
          styles.glow && `shadow-2xl ${styles.glow}`
        )}
      >
        <div className="flex items-center gap-3">
          <span className="text-4xl animate-bounce">{styles.icon}</span>
          <div>
            <span className="text-xl font-bold text-white block">
              {message || event?.replace('-', ' ').toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook for triggering animations
export function useGameEventAnimation() {
  const [currentEvent, setCurrentEvent] = useState<{
    type: EventType;
    message?: string;
    swapData?: SwapAnimationData;
  } | null>(null);

  const triggerEvent = (type: EventType, message?: string, swapData?: SwapAnimationData) => {
    setCurrentEvent({ type, message, swapData });
  };

  const clearEvent = () => {
    setCurrentEvent(null);
  };

  return {
    currentEvent,
    triggerEvent,
    clearEvent,
  };
}