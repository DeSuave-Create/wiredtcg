import { Card } from '@/types/game';
import { DraggableCard } from './DraggableCard';

interface PlayerHandDraggableProps {
  cards: Card[];
  isCurrentPlayer: boolean;
  showCards: boolean;
  disabled?: boolean;
}

export function PlayerHandDraggable({ 
  cards, 
  isCurrentPlayer,
  showCards,
  disabled = false,
}: PlayerHandDraggableProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2 p-4">
      {cards.map((card, index) => (
        <div
          key={card.id}
          style={{
            transform: `rotate(${(index - cards.length / 2) * 3}deg)`,
          }}
        >
          {showCards ? (
            <DraggableCard 
              card={card} 
              disabled={disabled || !isCurrentPlayer}
              showFace={true}
            />
          ) : (
            <div className="w-20 h-28 sm:w-24 sm:h-32 rounded-lg border-2 border-gray-600 bg-gray-800 overflow-hidden">
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
        <div className="text-muted-foreground text-sm">No cards in hand</div>
      )}
    </div>
  );
}
