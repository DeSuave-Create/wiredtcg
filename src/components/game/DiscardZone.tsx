import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { Card } from '@/types/game';
import { Trash2 } from 'lucide-react';

interface DiscardZoneProps {
  discardPile: Card[];
  isActive: boolean; // Only active during discard phase
  playerId: string;
}

export function DiscardZone({ discardPile, isActive, playerId }: DiscardZoneProps) {
  const { isOver, setNodeRef, active } = useDroppable({
    id: `${playerId}-discard`,
    data: { 
      type: 'discard', 
      accepts: isActive ? ['switch', 'cable-2', 'cable-3', 'computer', 'hacked', 'power-outage', 'new-hire', 'audit', 'secured', 'powered', 'trained', 'helpdesk', 'security-specialist', 'facilities', 'supervisor', 'field-tech', 'head-hunter', 'seal-the-deal'] : [] 
    },
  });

  const canDrop = isActive && active?.data?.current?.card;
  const isValidDrop = isOver && canDrop;

  if (!isActive) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <div className="w-8 h-10 bg-black/40 rounded border border-gray-700 flex items-center justify-center">
          <span className="text-xs">{discardPile.length}</span>
        </div>
        <span>Discard</span>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative flex flex-col items-center p-4 rounded-lg border-2 border-dashed transition-all duration-200",
        canDrop && "ring-2 ring-yellow-400 ring-opacity-50 border-yellow-400",
        isValidDrop && "ring-4 ring-red-400 ring-opacity-100 bg-red-400/20 border-red-400",
        !canDrop && "border-gray-600 bg-black/20"
      )}
    >
      <Trash2 className={cn(
        "w-8 h-8 mb-2",
        isValidDrop ? "text-red-400" : "text-gray-500"
      )} />
      
      <span className={cn(
        "text-sm font-medium",
        isValidDrop ? "text-red-400" : "text-gray-400"
      )}>
        {isValidDrop ? "Release to discard" : "Drag cards here to discard"}
      </span>
      
      <span className="text-xs text-muted-foreground mt-1">
        {discardPile.length} cards in pile
      </span>
    </div>
  );
}
