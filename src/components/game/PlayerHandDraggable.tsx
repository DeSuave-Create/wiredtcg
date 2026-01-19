import { Card } from '@/types/game';
import { DraggableCard } from './DraggableCard';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';
import { useMobileGameOptional } from '@/contexts/MobileGameContext';

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
  const MAX_HAND_SIZE = 6;
  const mobileContext = useMobileGameOptional();
  const isMobile = mobileContext?.isMobile ?? false;
  const selectedCard = mobileContext?.selectedCard ?? null;
  const selectedCardSource = mobileContext?.selectedCardSource ?? null;
  
  // Track previous card IDs for animations
  const prevCardIdsRef = useRef<string[]>([]);
  const [exitingCardIds, setExitingCardIds] = useState<Set<string>>(new Set());
  const [enteringCardIds, setEnteringCardIds] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    const prevIds = prevCardIdsRef.current;
    const currentIds = cards.map(c => c.id);
    
    // Find cards that left (for exit animation - only track for non-human/computer)
    const removedIds = prevIds.filter(id => !currentIds.includes(id));
    
    // Find new cards (for enter animation)
    const addedIds = currentIds.filter(id => !prevIds.includes(id));
    
    // Trigger exit animations for removed cards
    if (removedIds.length > 0 && !showCards) {
      // For computer's hand - show a brief flash effect
      setExitingCardIds(new Set(removedIds));
      setTimeout(() => setExitingCardIds(new Set()), 300);
    }
    
    // Trigger enter animations for new cards
    if (addedIds.length > 0) {
      setEnteringCardIds(new Set(addedIds));
      setTimeout(() => setEnteringCardIds(new Set()), 500);
    }
    
    prevCardIdsRef.current = currentIds;
  }, [cards, showCards]);

  // Handle mobile card selection
  const handleMobileSelect = (card: Card) => {
    if (!mobileContext || !isCurrentPlayer || disabled) return;
    
    // Toggle selection
    if (selectedCard?.id === card.id && selectedCardSource === 'hand') {
      mobileContext.clearSelection();
    } else {
      mobileContext.setSelectedCard(card, 'hand');
    }
  };
  
  // Single row layout (1x6) for both players
  if (gridLayout) {
    // Mobile-responsive card sizes
    const cardSize = isMobile 
      ? (compact ? "w-10 h-14" : "w-16 h-22") 
      : (compact ? "w-12 h-16" : "w-24 h-32");
    const emptySlots = Math.max(0, MAX_HAND_SIZE - cards.length);
    
    return (
      <div className={cn(
        "flex gap-2 h-full items-center w-full",
        // Mobile: horizontal scroll
        isMobile ? "overflow-x-auto pb-2 justify-start px-2" : "justify-center"
      )}>
        {cards.map((card) => {
          const isEntering = enteringCardIds.has(card.id);
          const isMobileSelected = isMobile && selectedCard?.id === card.id && selectedCardSource === 'hand';
          
          return (
            <div 
              key={card.id} 
              className={cn(
                "flex-shrink-0 transition-all duration-300",
                isEntering && "animate-scale-in"
              )}
            >
              {showCards ? (
                <DraggableCard 
                  card={card} 
                  disabled={disabled || !isCurrentPlayer}
                  showFace={true}
                  compact={compact}
                  isMobileSelected={isMobileSelected}
                  onMobileSelect={() => handleMobileSelect(card)}
                />
              ) : (
                <div className={cn(
                  cardSize, 
                  "rounded-lg border-2 border-gray-600 bg-gray-800 overflow-hidden transition-all duration-300",
                  isEntering && "ring-2 ring-yellow-400 animate-pulse"
                )}>
                  <img 
                    src="/lovable-uploads/card-back.png"
                    alt="Card back"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
            </div>
          );
        })}
        
        {/* Empty slot placeholders - hide on mobile to save space */}
        {!isMobile && Array.from({ length: emptySlots }).map((_, index) => (
          <div 
            key={`empty-${index}`} 
            className={cn(
              cardSize, 
              "flex-shrink-0 rounded-lg border-2 border-dashed border-gray-700/50 bg-gray-800/20 transition-all duration-300"
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-wrap",
      compact ? "gap-0.5 p-1" : "gap-2 p-4",
      // Mobile: horizontal scroll
      isMobile ? "overflow-x-auto flex-nowrap justify-start" : "justify-center"
    )}>
      {cards.map((card, index) => {
        const isEntering = enteringCardIds.has(card.id);
        const isMobileSelected = isMobile && selectedCard?.id === card.id && selectedCardSource === 'hand';
        
        return (
          <div
            key={card.id}
            className={cn(
              "transition-all duration-300 flex-shrink-0",
              isEntering && "animate-scale-in"
            )}
            style={{
              transform: isMobile 
                ? undefined // No rotation on mobile for easier scrolling
                : compact 
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
                isMobileSelected={isMobileSelected}
                onMobileSelect={() => handleMobileSelect(card)}
              />
            ) : (
              <div className={cn(
                "rounded-lg border-2 border-gray-600 bg-gray-800 overflow-hidden transition-all duration-300",
                isMobile ? "w-12 h-16" : (compact ? "w-8 h-11" : "w-20 h-28 sm:w-24 sm:h-32"),
                isEntering && "ring-2 ring-yellow-400 animate-pulse"
              )}>
                <img 
                  src="/lovable-uploads/card-back.png"
                  alt="Card back"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>
        );
      })}
      
      {cards.length === 0 && (
        <div className={cn(
          "text-muted-foreground",
          compact ? "text-[10px]" : "text-sm"
        )}>No cards</div>
      )}
    </div>
  );
}