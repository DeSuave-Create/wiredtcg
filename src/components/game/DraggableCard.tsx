import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/types/game';
import { cn } from '@/lib/utils';
import { useMobileGameOptional } from '@/contexts/MobileGameContext';

export interface DraggableCardProps {
  card: Card;
  disabled?: boolean;
  showFace?: boolean;
  compact?: boolean;
  isMobileSelected?: boolean;
  onMobileSelect?: () => void;
}

export function DraggableCard({ 
  card, 
  disabled = false, 
  showFace = true, 
  compact = false,
  isMobileSelected = false,
  onMobileSelect,
}: DraggableCardProps) {
  const mobileContext = useMobileGameOptional();
  const isMobile = mobileContext?.isMobile ?? false;
  
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
    data: { card },
    disabled: disabled || isMobile, // Disable drag on mobile
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  // Handle tap on mobile
  const handleClick = (e: React.MouseEvent) => {
    if (isMobile && !disabled && onMobileSelect) {
      e.preventDefault();
      e.stopPropagation();
      onMobileSelect();
    }
  };

  // Mobile card sizes - larger for hand cards, allow scrolling
  const getSizeClasses = () => {
    if (isMobile) {
      return compact ? "w-10 h-14" : "w-32 h-44";
    }
    return compact ? "w-12 h-16" : "w-24 h-32";
  };

  // All cards use neutral gray border, green when selected on mobile
  const cardBorderColor = isMobileSelected ? 'border-accent-green ring-2 ring-accent-green/50' : 'border-gray-600';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isMobile ? {} : listeners)}
      {...(isMobile ? {} : attributes)}
      onClick={handleClick}
      className={cn(
        "relative rounded-lg border-2 overflow-hidden transition-all duration-200 bg-black",
        getSizeClasses(),
        cardBorderColor,
        // Mobile: allow touch scrolling, use tap instead of drag
        isMobile ? "touch-auto cursor-pointer" : "touch-none",
        !disabled && !isMobile && "cursor-grab active:cursor-grabbing hover:scale-105 hover:-translate-y-2",
        !disabled && isMobile && "active:scale-95",
        disabled && "opacity-60 cursor-not-allowed",
        isDragging && "z-50 scale-110 shadow-2xl",
        isMobileSelected && "scale-105 -translate-y-1 shadow-lg shadow-accent-green/30"
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
