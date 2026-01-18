import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

export type DropZoneType = 'internet' | 'switch' | 'cable' | 'computer' | 'floating' | 'discard' | 'opponent-equipment' | 'own-equipment' | 'classification';

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
        showDropHint && "ring-4 ring-yellow-400 ring-opacity-70 bg-yellow-400/5 rounded-lg",
        isValidDrop && "ring-4 ring-green-400 ring-opacity-100 bg-green-400/20 rounded-lg scale-105",
        isOver && !canDrop && "ring-4 ring-red-400 ring-opacity-100 rounded-lg",
        className
      )}
    >
      {children}
      
      {/* Drop indicator - enhanced visibility */}
      {showDropHint && !isOver && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="bg-yellow-400/30 border-2 border-dashed border-yellow-400 rounded-lg px-3 py-2 text-xs text-yellow-400 font-bold shadow-lg shadow-yellow-400/20">
            Drop here
          </div>
        </div>
      )}
      
      {isValidDrop && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="bg-green-500/40 border-2 border-green-400 rounded-lg px-3 py-2 text-sm text-green-300 font-bold animate-pulse shadow-lg shadow-green-400/30">
            ✓ Release to place
          </div>
        </div>
      )}
    </div>
  );
}
