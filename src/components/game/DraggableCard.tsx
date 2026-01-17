import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/types/game';
import { cn } from '@/lib/utils';

export interface DraggableCardProps {
  card: Card;
  disabled?: boolean;
  showFace?: boolean;
  compact?: boolean;
}

export function DraggableCard({ card, disabled = false, showFace = true, compact = false }: DraggableCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
    data: { card },
    disabled,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  // All cards use neutral gray border
  const cardBorderColor = 'border-gray-600';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "relative rounded-lg border-2 overflow-hidden transition-all duration-200 touch-none bg-black",
        compact ? "w-14 h-20" : "w-20 h-28 sm:w-24 sm:h-32",
        cardBorderColor,
        !disabled && "cursor-grab active:cursor-grabbing hover:scale-105 hover:-translate-y-2",
        disabled && "opacity-60 cursor-not-allowed",
        isDragging && "z-50 scale-110 shadow-2xl"
      )}
    >
      {showFace ? (
        <img 
          src={card.image} 
          alt={card.name}
          className="w-full h-full object-contain pointer-events-none"
          draggable={false}
        />
      ) : (
        <img 
          src="/lovable-uploads/card-back.png"
          alt="Card back"
          className="w-full h-full object-contain pointer-events-none"
          draggable={false}
        />
      )}
    </div>
  );
}
