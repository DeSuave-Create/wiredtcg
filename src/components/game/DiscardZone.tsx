import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { Card } from '@/types/game';
import { Trash2 } from 'lucide-react';

interface DiscardZoneProps {
  discardPile: Card[];
  isActive: boolean; // Active during player's turn
  playerId: string;
  isDiscardPhase?: boolean; // Specifically during discard phase
}

const ALL_CARD_TYPES = [
  'switch', 'cable-2', 'cable-3', 'computer', 
  'hacked', 'power-outage', 'new-hire', 'audit', 
  'secured', 'powered', 'trained', 'helpdesk', 
  'security-specialist', 'facilities', 'supervisor', 'field-tech', 'head-hunter', 'seal-the-deal'
];

export function DiscardZone({ discardPile, isActive, playerId, isDiscardPhase = false }: DiscardZoneProps) {
  const { isOver, setNodeRef, active } = useDroppable({
    id: `${playerId}-discard`,
    data: { 
      type: 'discard', 
      accepts: isActive ? ALL_CARD_TYPES : [] 
    },
  });

  const canDrop = isActive && active?.data?.current?.card;
  const isValidDrop = isOver && canDrop;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative flex flex-col items-center justify-center w-full h-full min-h-[120px] rounded-lg border-2 transition-all duration-200 p-4",
        isActive ? "border-dashed" : "border-solid border-gray-700/50",
        canDrop && "ring-2 ring-yellow-400 ring-opacity-50 border-yellow-400",
        isValidDrop && "ring-4 ring-red-400 ring-opacity-100 bg-red-400/20 border-red-400",
        !isActive && "border-gray-700 bg-black/20 opacity-60",
        isActive && !canDrop && "border-gray-600 bg-black/30",
        isDiscardPhase && "border-orange-500 bg-orange-500/10"
      )}
    >
      <Trash2 className={cn(
        "w-8 h-8 mb-2",
        isValidDrop ? "text-red-400" : isDiscardPhase ? "text-orange-400" : isActive ? "text-gray-400" : "text-gray-600"
      )} />
      
      <span className={cn(
        "text-sm font-medium text-center",
        isValidDrop ? "text-red-400" : isDiscardPhase ? "text-orange-400" : isActive ? "text-gray-300" : "text-gray-500"
      )}>
        {isValidDrop 
          ? "Release to Discard" 
          : isDiscardPhase 
            ? "Discard to 6 cards" 
            : isActive 
              ? "Drag here to discard" 
              : "Discard Pile"
        }
      </span>
      
      <span className="text-xs text-muted-foreground mt-1">
        {discardPile.length} cards
      </span>
    </div>
  );
}
