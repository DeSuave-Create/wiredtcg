import { Card } from '@/types/game';
import { cn } from '@/lib/utils';

interface PlayerHandProps {
  cards: Card[];
  selectedCard: Card | null;
  onSelectCard: (card: Card) => void;
  onDiscard?: (cardId: string) => void;
  isCurrentPlayer: boolean;
  showCards: boolean;
}

export function PlayerHand({ 
  cards, 
  selectedCard, 
  onSelectCard, 
  onDiscard,
  isCurrentPlayer,
  showCards 
}: PlayerHandProps) {
  const getCardTypeColor = (type: Card['type']) => {
    switch (type) {
      case 'equipment': return 'border-green-500 bg-green-500/10';
      case 'attack': return 'border-red-500 bg-red-500/10';
      case 'resolution': return 'border-purple-500 bg-purple-500/10';
      case 'classification': return 'border-blue-500 bg-blue-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className="flex flex-wrap justify-center gap-2 p-4">
      {cards.map((card, index) => (
        <div
          key={card.id}
          onClick={() => isCurrentPlayer && showCards && onSelectCard(card)}
          className={cn(
            "relative w-20 h-28 sm:w-24 sm:h-32 rounded-lg border-2 overflow-hidden transition-all duration-200",
            showCards ? getCardTypeColor(card.type) : 'border-gray-600 bg-gray-800',
            isCurrentPlayer && showCards && "cursor-pointer hover:scale-105 hover:-translate-y-2",
            selectedCard?.id === card.id && "ring-2 ring-yellow-400 -translate-y-3 scale-110"
          )}
          style={{
            transform: `rotate(${(index - cards.length / 2) * 3}deg)`,
          }}
        >
          {showCards ? (
            <img 
              src={card.image} 
              alt={card.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <img 
              src="/lovable-uploads/card-back.png"
              alt="Card back"
              className="w-full h-full object-contain"
            />
          )}
          
          {selectedCard?.id === card.id && onDiscard && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDiscard(card.id);
              }}
              className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-0.5 rounded"
            >
              Discard
            </button>
          )}
        </div>
      ))}
      
      {cards.length === 0 && (
        <div className="text-muted-foreground text-sm">No cards in hand</div>
      )}
    </div>
  );
}
