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
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "relative rounded-lg border-2 overflow-hidden transition-all duration-200 touch-none",
        compact ? "w-8 h-11" : "w-20 h-28 sm:w-24 sm:h-32",
        showFace ? getCardTypeColor(card.type) : 'border-gray-600 bg-gray-800',
        !disabled && "cursor-grab active:cursor-grabbing hover:scale-105 hover:-translate-y-2",
        disabled && "opacity-60 cursor-not-allowed",
        isDragging && "z-50 scale-110 shadow-2xl ring-2 ring-yellow-400"
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
