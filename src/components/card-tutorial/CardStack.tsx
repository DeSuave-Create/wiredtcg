import { memo, useMemo, useEffect, useState, useRef } from 'react';
import { tutorialCards } from '@/data/cardInteractions';
import { cn } from '@/lib/utils';

interface CardStackProps {
  stackOrder: string[];
  highlight?: string;
  effectLabel?: string;
  fadeOut?: string[];
}

const offsets: Record<number, { x: number; y: number }> = {
  0: { x: 0, y: 0 },
  1: { x: 24, y: -30 },
  2: { x: -18, y: -60 },
};

const rotations: Record<number, number> = {
  0: 0,
  1: -4,
  2: 4,
};

// Preload all tutorial card images once on first mount
let preloaded = false;
function preloadAllImages() {
  if (preloaded) return;
  preloaded = true;
  Object.values(tutorialCards).forEach(card => {
    const img = new Image();
    img.src = card.image;
  });
}

const CardStack = memo(({ stackOrder, highlight, fadeOut = [] }: CardStackProps) => {
  const fadeOutSet = useMemo(() => new Set(fadeOut), [fadeOut]);
  const [isVisible, setIsVisible] = useState(true);
  const prevStackRef = useRef(stackOrder.join(','));

  useEffect(() => { preloadAllImages(); }, []);

  // Detect when the stack composition changes (not just highlight/fade changes)
  // and trigger a smooth crossfade
  useEffect(() => {
    const newKey = stackOrder.join(',');
    if (newKey !== prevStackRef.current) {
      setIsVisible(false);
      const timer = setTimeout(() => {
        prevStackRef.current = newKey;
        setIsVisible(true);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [stackOrder]);

  return (
    <div
      className="relative flex items-center justify-center min-h-[420px] sm:min-h-[480px] pt-16"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'scale(1)' : 'scale(0.97)',
        transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
      }}
    >
      <div className="relative" style={{ width: '220px', height: '310px' }}>
        {stackOrder.map((cardId, idx) => {
          const card = tutorialCards[cardId];
          if (!card) return null;

          const isFadingOut = fadeOutSet.has(cardId);
          const isHighlighted = highlight === cardId;
          const offset = offsets[idx] || { x: idx * 18, y: idx * -35 };
          const rot = rotations[idx] ?? 0;

          return (
            <div
              key={`${cardId}-${idx}`}
              className="absolute inset-0 will-change-[transform,opacity]"
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rot}deg) scale(${isFadingOut ? 0.9 : isHighlighted ? 1.05 : 1})`,
                opacity: isFadingOut ? 0.2 : 1,
                zIndex: idx + 1,
                transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <div className="w-[200px] sm:w-[220px] rounded-xl overflow-hidden">
                <img
                  src={card.image}
                  alt={card.name}
                  width={220}
                  height={308}
                  className="w-full h-auto object-contain"
                  loading="eager"
                  decoding="async"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

CardStack.displayName = 'CardStack';

export default CardStack;
