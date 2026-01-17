import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/types/game';
import { cn } from '@/lib/utils';

interface DraggableAuditedCardProps {
  card: Card;
  index: number;
  disabled?: boolean;
}

function DraggableAuditedCard({ card, index, disabled = false }: DraggableAuditedCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `audited-${card.id}-${index}`,
    data: { 
      card,
      isAudited: true,
      auditedIndex: index,
    },
    disabled,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "w-16 h-22 rounded border-2 overflow-hidden transition-all duration-200 touch-none",
        "border-yellow-500/50 bg-yellow-500/10",
        !disabled && "cursor-grab active:cursor-grabbing hover:scale-105 hover:border-yellow-400",
        disabled && "opacity-60 cursor-not-allowed",
        isDragging && "z-50 scale-110 shadow-2xl shadow-yellow-500/30"
      )}
    >
      <img 
        src={card.image} 
        alt={card.name}
        className="w-full h-full object-contain pointer-events-none"
        draggable={false}
      />
    </div>
  );
}

interface AuditedComputersSectionProps {
  auditedComputers: Card[];
  isCurrentPlayer: boolean;
  canPlay: boolean;
}

export function AuditedComputersSection({ 
  auditedComputers, 
  isCurrentPlayer,
  canPlay 
}: AuditedComputersSectionProps) {
  if (auditedComputers.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-yellow-500/30 animate-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-yellow-400 font-medium">📋 Audited Computers</span>
        <span className="text-xs text-gray-500">
          ({auditedComputers.length} - {canPlay ? 'drag to play' : 'overflow allowed'})
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {auditedComputers.map((card, index) => (
          <DraggableAuditedCard
            key={`audited-${card.id}-${index}`}
            card={card}
            index={index}
            disabled={!isCurrentPlayer || !canPlay}
          />
        ))}
      </div>
    </div>
  );
}