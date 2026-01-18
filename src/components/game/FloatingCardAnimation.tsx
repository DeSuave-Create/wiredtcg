import { Card } from '@/types/game';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface FloatingCardAnimationProps {
  card: Card | null;
  isActive: boolean;
  startPosition: { x: number; y: number };
  endPosition: { x: number; y: number };
  onComplete: () => void;
}

export function FloatingCardAnimation({
  card,
  isActive,
  startPosition,
  endPosition,
  onComplete,
}: FloatingCardAnimationProps) {
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'moving' | 'done'>('idle');
  
  useEffect(() => {
    if (isActive && card) {
      setAnimationPhase('moving');
      const timer = setTimeout(() => {
        setAnimationPhase('done');
        onComplete();
      }, 600);
      return () => clearTimeout(timer);
    } else {
      setAnimationPhase('idle');
    }
  }, [isActive, card, onComplete]);

  if (!isActive || !card || animationPhase === 'idle') {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed z-50 pointer-events-none transition-all duration-500 ease-out",
        animationPhase === 'moving' && "opacity-100 scale-100",
        animationPhase === 'done' && "opacity-0 scale-75"
      )}
      style={{
        left: animationPhase === 'moving' ? endPosition.x : startPosition.x,
        top: animationPhase === 'moving' ? endPosition.y : startPosition.y,
        transform: `translate(-50%, -50%)`,
      }}
    >
      <div className="w-20 h-28 rounded-lg border-2 border-yellow-400 overflow-hidden shadow-lg shadow-yellow-400/50 animate-pulse">
        <img 
          src={card.image} 
          alt={card.name}
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
}

// Simplified version that shows card flying from one area to another
interface AICardPlayAnimationProps {
  card: Card | null;
  action: 'play' | 'draw' | null;
  onComplete: () => void;
}

export function AICardPlayAnimation({ card, action, onComplete }: AICardPlayAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (card && action) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [card, action, onComplete]);

  if (!isVisible || !card) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <div
        className={cn(
          "absolute w-16 h-22 rounded-lg overflow-hidden shadow-xl transition-all duration-700 ease-out",
          action === 'play' 
            ? "animate-[flyToBoard_0.7s_ease-out_forwards] border-2 border-accent-green shadow-accent-green/50"
            : "animate-[flyFromDeck_0.5s_ease-out_forwards] border-2 border-yellow-400 shadow-yellow-400/50"
        )}
        style={{
          // Start position for play (from AI hand area)
          '--start-x': action === 'play' ? '75%' : '50%',
          '--start-y': action === 'play' ? '60%' : '10%',
          // End position 
          '--end-x': action === 'play' ? '75%' : '75%',
          '--end-y': action === 'play' ? '30%' : '60%',
        } as React.CSSProperties}
      >
        <img 
          src={action === 'play' ? card.image : '/lovable-uploads/card-back.png'} 
          alt={card.name}
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
}
