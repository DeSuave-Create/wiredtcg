import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Card, PlacedCard } from '@/types/game';
import { cn } from '@/lib/utils';

interface DraggablePlacedCardProps {
  placedCard: PlacedCard;
  disabled?: boolean;
  className?: string;
  small?: boolean;
  sourceType: 'switch' | 'cable' | 'computer' | 'floating-cable' | 'floating-computer';
  sourceId: string; // The ID of the placed card
  parentId?: string; // Parent switch/cable ID if applicable
}

export function DraggablePlacedCard({ 
  placedCard, 
  disabled = false, 
  className,
  small = false,
  sourceType,
  sourceId,
  parentId,
}: DraggablePlacedCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `placed-${sourceId}`,
    data: { 
      card: placedCard.card,
      placedCard,
      isPlaced: true,
      sourceType,
      sourceId,
      parentId,
    },
    disabled,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "rounded border-2 overflow-hidden transition-all duration-200 touch-none relative",
        placedCard.isDisabled ? "border-red-500 opacity-70" : small ? "border-green-400" : "border-green-500",
        !disabled && "cursor-grab active:cursor-grabbing hover:scale-105 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent-green/30",
        disabled && "cursor-not-allowed",
        isDragging && "z-50 scale-110 shadow-2xl ring-2 ring-yellow-400",
        className
      )}
    >
      <img 
        src={placedCard.card.image} 
        alt={placedCard.card.name}
        className="w-full h-full object-contain pointer-events-none"
        draggable={false}
      />
      
      {/* Issue indicators */}
      {placedCard.attachedIssues.length > 0 && (
        <IssueIndicator issues={placedCard.attachedIssues} small={small} />
      )}
    </div>
  );
}

interface IssueIndicatorProps {
  issues: Card[];
  small?: boolean;
}

function IssueIndicator({ issues, small = false }: IssueIndicatorProps) {
  return (
    <div className={cn(
      "absolute inset-0 flex flex-col items-center justify-center gap-0.5 pointer-events-none",
    )}>
      {issues.map((issue, idx) => (
        <div
          key={idx}
          className={cn(
            "transform rotate-90 border-2 border-red-500 rounded shadow-lg",
            small ? "w-6 h-8" : "w-10 h-14"
          )}
          title={issue.name}
        >
          <img 
            src={issue.image} 
            alt={issue.name}
            className="w-full h-full object-contain bg-black/80"
          />
        </div>
      ))}
    </div>
  );
}
