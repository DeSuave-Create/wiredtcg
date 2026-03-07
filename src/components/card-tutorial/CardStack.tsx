import { memo, useMemo } from 'react';
import { tutorialCards, getCategoryBorderClass } from '@/data/cardInteractions';
import { cn } from '@/lib/utils';

interface CardStackProps {
  stackOrder: string[];
  highlight?: string;
  effectLabel?: string;
  fadeOut?: string[];
}

const offsets: Record<number, { x: number; y: number }> = {
  0: { x: 0, y: 0 },
  1: { x: 18, y: -28 },
  2: { x: -14, y: -56 },
};

const rotations: Record<number, number> = {
  0: 0,
  1: -3,
  2: 3,
};

const effectLabelClass: Record<string, string> = {
  DISABLED: 'border-destructive text-destructive',
  ACTIVE: 'border-primary text-primary',
  MINING: 'border-primary text-primary',
  RESTORED: 'border-primary text-primary',
  RESOLVING: 'border-purple-500 text-purple-400',
  'AUTO-RESOLVE': 'border-purple-500 text-purple-400',
  BLOCKED: 'border-blue-500 text-blue-400',
  COUNTERED: 'border-destructive text-destructive',
  STOLEN: 'border-destructive text-destructive',
  LOCKED: 'border-primary text-primary',
  VULNERABLE: 'border-yellow-500 text-yellow-400',
  'STEAL ATTEMPT': 'border-destructive text-destructive',
  'AUDIT INITIATED': 'border-destructive text-destructive',
  'COMPUTERS RETURNED': 'border-destructive text-destructive',
  '+1 EQUIPMENT MOVE': 'border-primary text-primary',
  'BONUS PLAY': 'border-primary text-primary',
};

const CardStack = memo(({ stackOrder, highlight, effectLabel, fadeOut = [] }: CardStackProps) => {
  const fadeOutSet = useMemo(() => new Set(fadeOut), [fadeOut]);

  return (
    <div className="relative flex items-center justify-center min-h-[260px] sm:min-h-[300px]">
      <div className="relative" style={{ width: '180px', height: '260px' }}>
        {stackOrder.map((cardId, idx) => {
          const card = tutorialCards[cardId];
          if (!card) return null;

          const isFadingOut = fadeOutSet.has(cardId);
          const isHighlighted = highlight === cardId;
          const offset = offsets[idx] || { x: idx * 14, y: idx * -28 };
          const rot = rotations[idx] ?? 0;

          return (
            <div
              key={`${cardId}-${idx}`}
              className="absolute inset-0 will-change-[transform,opacity]"
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rot}deg) scale(${isFadingOut ? 0.9 : isHighlighted ? 1.05 : 1})`,
                opacity: isFadingOut ? 0.2 : 1,
                zIndex: idx + 1,
                transition: 'transform 0.5s ease-out, opacity 0.5s ease-out',
              }}
            >
              <div
                className={cn(
                  'w-[160px] sm:w-[180px] rounded-xl overflow-hidden border-2 shadow-lg',
                  getCategoryBorderClass(card.type),
                  isHighlighted && 'ring-2 ring-primary/30',
                )}
              >
                <img
                  src={card.image}
                  alt={card.name}
                  className="w-full h-auto object-contain"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              {isHighlighted && effectLabel && (
                <div className={cn(
                  'absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold font-orbitron tracking-wider whitespace-nowrap z-40 bg-background/90 border',
                  effectLabelClass[effectLabel] || 'border-primary text-primary',
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
});

CardStack.displayName = 'CardStack';

export default CardStack;
