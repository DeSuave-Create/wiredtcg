import { Card } from '@/types/game';
import { DraggableCard } from './DraggableCard';
import { cn } from '@/lib/utils';

interface PlayerHandDraggableProps {
  cards: Card[];
  isCurrentPlayer: boolean;
  showCards: boolean;
  disabled?: boolean;
  compact?: boolean;
}

export function PlayerHandDraggable({ 
  cards, 
  isCurrentPlayer,
  showCards,
  disabled = false,
  compact = false,
}: PlayerHandDraggableProps) {
  return (
    <div className={cn(
      "flex flex-wrap justify-center",
      compact ? "gap-1 p-2" : "gap-2 p-4"
    )}>
      {cards.map((card, index) => (
        <div
          key={card.id}
          style={{
            transform: compact 
              ? `rotate(${(index - cards.length / 2) * 2}deg)`
              : `rotate(${(index - cards.length / 2) * 3}deg)`,
          }}
        >
          {showCards ? (
            <DraggableCard 
              card={card} 
              disabled={disabled || !isCurrentPlayer}
              showFace={true}
              compact={compact}
            />
          ) : (
            <div className={cn(
              "rounded-lg border-2 border-gray-600 bg-gray-800 overflow-hidden",
              compact ? "w-12 h-16" : "w-20 h-28 sm:w-24 sm:h-32"
            )}>
              <img 
                src="/lovable-uploads/card-back.png"
                alt="Card back"
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>
      ))}
      
      {cards.length === 0 && (
        <div className={cn(
          "text-muted-foreground",
          compact ? "text-xs" : "text-sm"
        )}>No cards in hand</div>
      )}
    </div>
  );
}