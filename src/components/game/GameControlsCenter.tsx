import { Button } from '@/components/ui/button';
import { GamePhase } from '@/types/game';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';

interface GameControlsCenterProps {
  phase: GamePhase;
  movesRemaining: number;
  onEndPhase: () => void;
  isCurrentPlayerHuman: boolean;
  isDragging: boolean;
}

export function GameControlsCenter({
  phase,
  movesRemaining,
  onEndPhase,
  isCurrentPlayerHuman,
  isDragging,
}: GameControlsCenterProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const prevMovesRef = useRef(movesRemaining);

  // Animate when moves decrement
  useEffect(() => {
    if (movesRemaining < prevMovesRef.current) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 400);
      return () => clearTimeout(timer);
    }
    prevMovesRef.current = movesRemaining;
  }, [movesRemaining]);

  if (!isCurrentPlayerHuman) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 bg-gray-800/60 rounded-lg border border-gray-700">
        <span className="text-xs text-muted-foreground">moves</span>
        <span className="w-6 h-6 rounded bg-gray-700 flex items-center justify-center text-sm text-gray-400">
          x{movesRemaining}
        </span>
        <span className="text-xs text-muted-foreground">← {6} cards</span>
        <div className="animate-pulse text-accent-green text-xs">Thinking...</div>
      </div>
    );
  }

  const getButtonText = () => {
    switch (phase) {
      case 'moves':
        return 'End Moves';
      case 'discard':
        return 'Done Discarding';
      case 'draw':
        return 'Draw Cards';
      case 'score':
        return 'End Turn';
      default:
        return 'Continue';
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Main Action Button */}
      <Button
        onClick={onEndPhase}
        className="px-8 py-3 bg-accent-green hover:bg-accent-green/80 text-black font-semibold rounded-full text-sm"
      >
        {getButtonText()}
      </Button>

      {/* Moves Counter (shown on opponent side in reference) */}
      {phase === 'moves' && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/60 rounded border border-gray-700">
          <span 
            className={cn(
              "w-6 h-6 rounded flex items-center justify-center text-sm font-bold transition-all duration-300",
              movesRemaining > 0 
                ? "bg-accent-green/20 text-accent-green" 
                : "bg-red-500/20 text-red-400",
              isAnimating && "animate-bounce scale-125 bg-yellow-500/30 text-yellow-300"
            )}
          >
            {movesRemaining}
          </span>
          <span className="text-xs text-muted-foreground">moves x3</span>
          <span className="text-xs text-muted-foreground">← 6 cards</span>
        </div>
      )}

      {/* Dragging hint */}
      {isDragging && phase === 'moves' && (
        <div className="text-xs text-yellow-400 animate-pulse">
          Drop on a valid target
        </div>
      )}
    </div>
  );
}
