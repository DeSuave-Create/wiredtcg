import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type EventType = 'audit-success' | 'audit-blocked' | 'head-hunter' | 'ai-action';

interface GameEventAnimationProps {
  event: EventType | null;
  message?: string;
  onComplete?: () => void;
}

export function GameEventAnimation({ event, message, onComplete }: GameEventAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (event) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [event, onComplete]);

  if (!event || !isVisible) return null;

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
  } | null>(null);

  const triggerEvent = (type: EventType, message?: string) => {
    setCurrentEvent({ type, message });
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