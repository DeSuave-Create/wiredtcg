import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';

interface DeckIndicatorProps {
  deckCount: number;
  discardCount: number;
  className?: string;
}

export function DeckIndicator({ deckCount, discardCount, className }: DeckIndicatorProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const prevDeckCountRef = useRef(deckCount);
  
  // Animate when cards are drawn from deck
  useEffect(() => {
    if (deckCount < prevDeckCountRef.current) {
      setIsDrawing(true);
      const timer = setTimeout(() => setIsDrawing(false), 500);
      return () => clearTimeout(timer);
    }
    prevDeckCountRef.current = deckCount;
  }, [deckCount]);

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      {/* Draw Pile */}
      <div className="relative">
        <div 
          className={cn(
            "relative w-16 h-22 transition-transform duration-300",
            isDrawing && "animate-pulse"
          )}
        >
          {/* Stack effect - multiple cards behind */}
          {deckCount > 2 && (
            <div className="absolute inset-0 translate-x-1 translate-y-1 rounded-lg bg-gray-700 border border-gray-600" />
          )}
          {deckCount > 1 && (
            <div className="absolute inset-0 translate-x-0.5 translate-y-0.5 rounded-lg bg-gray-700 border border-gray-600" />
          )}
          
          {/* Top card */}
          <div 
            className={cn(
              "relative w-16 h-22 rounded-lg border-2 overflow-hidden transition-all duration-300",
              deckCount > 0 ? "border-blue-500/50 bg-gray-800" : "border-gray-700 bg-gray-900",
              isDrawing && "scale-95 ring-2 ring-yellow-400"
            )}
          >
            {deckCount > 0 ? (
              <img 
                src="/lovable-uploads/card-back.png" 
                alt="Draw pile"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                Empty
              </div>
            )}
          </div>
          
          {/* Floating draw indicator */}
          {isDrawing && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
              <span className="text-black text-xs font-bold">-1</span>
            </div>
          )}
        </div>
        
        {/* Count badge */}
        <div className={cn(
          "absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-xs font-bold",
          deckCount > 10 
            ? "bg-blue-500/80 text-white" 
            : deckCount > 0 
              ? "bg-yellow-500/80 text-black" 
              : "bg-red-500/80 text-white"
        )}>
          {deckCount}
        </div>
      </div>
      <span className="text-xs text-muted-foreground">Draw</span>

      {/* Discard Pile */}
      <div className="relative mt-2">
        <div className="w-14 h-20 rounded-lg border-2 border-gray-600 bg-gray-800/50 overflow-hidden">
          {discardCount > 0 ? (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-lg font-bold text-gray-400">{discardCount}</span>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
              Empty
            </div>
          )}
        </div>
        <span className="block text-center text-xs text-muted-foreground mt-1">Discard</span>
      </div>
    </div>
  );
}
