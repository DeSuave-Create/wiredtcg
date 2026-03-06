import { useEffect, useState } from 'react';
import { tutorialCards, getCategoryBorderClass } from '@/data/cardInteractions';
import { cn } from '@/lib/utils';

interface CardStackProps {
  stackOrder: string[];
  highlight?: string;
  effectLabel?: string;
  fadeOut?: string[];
  animateIn?: boolean;
}

const rotations: Record<number, string> = {
  0: 'rotate-0',
  1: '-rotate-3',
  2: 'rotate-3',
};

const offsets: Record<number, { x: number; y: number }> = {
  0: { x: 0, y: 0 },
  1: { x: 18, y: -28 },
  2: { x: -14, y: -56 },
};

const CardStack = ({ stackOrder, highlight, effectLabel, fadeOut = [], animateIn }: CardStackProps) => {
  const [visibleCards, setVisibleCards] = useState<string[]>([]);

  useEffect(() => {
    if (animateIn) {
      setVisibleCards([]);
      stackOrder.forEach((id, idx) => {
        setTimeout(() => {
          setVisibleCards(prev => [...prev, id]);
        }, idx * 400);
      });
    } else {
      setVisibleCards(stackOrder);
    }
  }, [stackOrder, animateIn]);

  return (
    <div className="relative flex items-center justify-center min-h-[280px] sm:min-h-[340px]">
      {/* Ambient glow */}
      <div className="absolute w-48 h-48 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative" style={{ width: '180px', height: '260px' }}>
        {stackOrder.map((cardId, idx) => {
          const card = tutorialCards[cardId];
          if (!card) return null;

          const isFadingOut = fadeOut.includes(cardId);
          const isHighlighted = highlight === cardId;
          const isVisible = visibleCards.includes(cardId);
          const offset = offsets[idx] || { x: idx * 14, y: idx * -28 };
          const rotation = rotations[idx] || 'rotate-0';
          const borderClass = getCategoryBorderClass(card.type);

          return (
            <div
              key={`${cardId}-${idx}`}
              className={cn(
                'absolute inset-0 transition-all duration-700 ease-out',
                rotation,
                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90 translate-y-8',
                isFadingOut && 'opacity-20 scale-90 blur-sm',
                isHighlighted && 'z-30 scale-105',
              )}
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px)`,
                zIndex: idx + 1,
              }}
            >
              <div
                className={cn(
                  'w-[160px] sm:w-[180px] rounded-xl overflow-hidden border-2 shadow-2xl transition-shadow duration-500',
                  borderClass,
                  isHighlighted && 'shadow-[0_0_30px_rgba(var(--primary),0.3)] ring-2 ring-primary/30',
                )}
              >
                <img
                  src={card.image}
                  alt={card.name}
                  className="w-full h-auto object-contain"
                  loading="lazy"
                />
              </div>

              {/* Effect label badge */}
              {isHighlighted && effectLabel && (
                <div className={cn(
                  'absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold font-orbitron tracking-wider whitespace-nowrap z-40',
                  'bg-background/90 backdrop-blur-sm border',
                  effectLabel === 'DISABLED' && 'border-destructive text-destructive',
                  effectLabel === 'ACTIVE' && 'border-primary text-primary',
                  effectLabel === 'MINING' && 'border-primary text-primary',
                  effectLabel === 'RESTORED' && 'border-primary text-primary',
                  effectLabel === 'RESOLVING' && 'border-purple-500 text-purple-400',
                  effectLabel === 'AUTO-RESOLVE' && 'border-purple-500 text-purple-400',
                  effectLabel === 'BLOCKED' && 'border-blue-500 text-blue-400',
                  effectLabel === 'COUNTERED' && 'border-destructive text-destructive',
                  effectLabel === 'STOLEN' && 'border-destructive text-destructive',
                  effectLabel === 'LOCKED' && 'border-primary text-primary',
                  effectLabel === 'VULNERABLE' && 'border-yellow-500 text-yellow-400',
                  effectLabel === 'STEAL ATTEMPT' && 'border-destructive text-destructive',
                  effectLabel === 'AUDIT INITIATED' && 'border-destructive text-destructive',
                  effectLabel === 'COMPUTERS RETURNED' && 'border-destructive text-destructive',
                  effectLabel === '+1 EQUIPMENT MOVE' && 'border-primary text-primary',
                  effectLabel === 'BONUS PLAY' && 'border-primary text-primary',
                )}>
                  {effectLabel}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CardStack;
