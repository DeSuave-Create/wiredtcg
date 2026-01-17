import { Card } from '@/types/game';
import { DraggableCard } from './DraggableCard';
import { cn } from '@/lib/utils';

interface PlayerHandDraggableProps {
  cards: Card[];
  isCurrentPlayer: boolean;
  showCards: boolean;
  disabled?: boolean;
  compact?: boolean;
  gridLayout?: boolean;
}

export function PlayerHandDraggable({ 
  cards, 
  isCurrentPlayer,
  showCards,
  disabled = false,
  compact = false,
  gridLayout = false,
}: PlayerHandDraggableProps) {
  // Single row layout (1x6) for both players
  if (gridLayout) {
    const cardSize = "w-12 h-16";
    
    return (
      <div className="flex justify-center gap-1.5 h-full items-center">
        {cards.map((card) => (
          <div key={card.id} className="flex-shrink-0">
            {showCards ? (
              <DraggableCard 
                card={card} 
                disabled={disabled || !isCurrentPlayer}
                showFace={true}
                compact={true}
              />
            ) : (
              <div className={cn(cardSize, "rounded-lg border-2 border-gray-600 bg-gray-800 overflow-hidden")}>
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
          <div className="text-muted-foreground text-xs text-center">No cards in hand</div>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-wrap justify-center",
      compact ? "gap-0.5 p-1" : "gap-2 p-4"
    )}>
      {cards.map((card, index) => (
        <div
          key={card.id}
          style={{
            transform: compact 
              ? `rotate(${(index - cards.length / 2) * 1}deg)`
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
              compact ? "w-8 h-11" : "w-20 h-28 sm:w-24 sm:h-32"
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
          compact ? "text-[10px]" : "text-sm"
        )}>No cards</div>
      )}
    </div>
  );
}