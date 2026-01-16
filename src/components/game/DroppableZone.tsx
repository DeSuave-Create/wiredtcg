import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

export type DropZoneType = 'internet' | 'switch' | 'cable' | 'discard' | 'opponent-equipment' | 'own-equipment' | 'classification';

interface DroppableZoneProps {
  id: string;
  type: DropZoneType;
  accepts: string[]; // Card subtypes that can be dropped here
  children: ReactNode;
  className?: string;
  label?: string;
}

export function DroppableZone({ 
  id, 
  type, 
  accepts, 
  children, 
  className,
  label 
}: DroppableZoneProps) {
  const { isOver, setNodeRef, active } = useDroppable({
    id,
    data: { type, accepts },
  });

  // Check if the currently dragged item can be dropped here
  const activeCard = active?.data?.current?.card;
  const canDrop = activeCard && accepts.includes(activeCard.subtype);
  const isValidDrop = isOver && canDrop;
  const showDropHint = active && canDrop;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative transition-all duration-200",
        showDropHint && "ring-2 ring-yellow-400 ring-opacity-50",
        isValidDrop && "ring-4 ring-green-400 ring-opacity-100 bg-green-400/10",
        isOver && !canDrop && "ring-4 ring-red-400 ring-opacity-100",
        className
      )}
    >
      {children}
      
      {/* Drop indicator */}
      {showDropHint && !isOver && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-yellow-400/20 border-2 border-dashed border-yellow-400 rounded-lg p-2 text-xs text-yellow-400 font-medium">
            Drop here
          </div>
        </div>
      )}
      
      {isValidDrop && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-green-400/30 border-2 border-green-400 rounded-lg p-2 text-xs text-green-400 font-bold animate-pulse">
            ✓ Release to place
          </div>
        </div>
      )}
    </div>
  );
}
