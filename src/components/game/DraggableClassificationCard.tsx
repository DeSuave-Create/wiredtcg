import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { PlacedCard } from '@/types/game';
import { cn } from '@/lib/utils';

interface DraggableClassificationCardProps {
  classCard: PlacedCard;
  disabled?: boolean;
  compact?: boolean;
  abilityLabel?: string;
}

export function DraggableClassificationCard({
  classCard,
  disabled = false,
  compact = false,
  abilityLabel,
}: DraggableClassificationCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `classification-${classCard.id}`,
    data: {
      card: classCard.card,
      placedCard: classCard,
      isPlacedClassification: true,
      classificationId: classCard.id,
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
        "relative group touch-none",
        !disabled && "cursor-grab active:cursor-grabbing",
        isDragging && "z-50"
      )}
    >
      <div className={cn(
        "rounded border-2 border-gray-600 overflow-hidden transition-all duration-200",
        compact ? "w-24 h-32" : "w-24 h-32",
        !disabled && "hover:scale-105 hover:border-yellow-400",
        isDragging && "scale-110 shadow-2xl ring-2 ring-yellow-400"
      )}>
        <img 
          src={classCard.card.image} 
          alt={classCard.card.name}
          className="w-full h-full object-contain pointer-events-none"
          draggable={false}
        />
      </div>
      
      {/* Compact ability indicator */}
      {compact && abilityLabel && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] bg-blue-900/90 text-blue-200 px-1 rounded pointer-events-none">
          {abilityLabel}
        </div>
      )}
      
      {/* Full ability tooltip */}
      {!compact && !isDragging && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] bg-blue-900/90 text-blue-200 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
          {classCard.card.name}
        </div>
      )}
    </div>
  );
}
