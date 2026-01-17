import { Button } from '@/components/ui/button';
import { GamePhase } from '@/types/game';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';

interface GameControlsSimpleProps {
  phase: GamePhase;
  movesRemaining: number;
  onEndPhase: () => void;
  isCurrentPlayerHuman: boolean;
  isDragging: boolean;
  compact?: boolean;
}

export function GameControlsSimple({
  phase,
  movesRemaining,
  onEndPhase,
  isCurrentPlayerHuman,
  isDragging,
  compact = false,
}: GameControlsSimpleProps) {
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
      <div className={cn("text-center", compact ? "py-2" : "py-4")}>
        <div className="animate-pulse text-accent-green text-sm">Computer thinking...</div>
      </div>
    );
  }

  const phaseLabels: Record<GamePhase, string> = {
    'trade': 'Trade',
    'moves': 'Play',
    'discard': 'Discard',
    'draw': 'Draw',
    'score': 'Score',
    'game-over': 'Game Over',
    'audit': 'Audit',
  };

  // Compact version for sidebar
  if (compact) {
    return (
      <div className="flex flex-col items-center gap-2 p-3 bg-black/40 rounded-lg border border-accent-green/30">
        {/* Compact phase indicator */}
        <div className="flex flex-wrap justify-center gap-1">
          {(['moves', 'discard', 'draw', 'score'] as GamePhase[]).map((p) => (
            <div
              key={p}
              className={cn(
                "px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider transition-colors",
                phase === p 
                  ? "bg-accent-green text-black" 
                  : "bg-gray-700 text-gray-500"
              )}
            >
              {phaseLabels[p]}
            </div>
          ))}
        </div>
        
        {/* Moves counter */}
        {phase === 'moves' && (
          <div className="flex items-center gap-1 text-sm">
            <span 
              className={cn(
                "inline-flex items-center justify-center w-6 h-6 rounded-full font-bold transition-all duration-300",
                movesRemaining > 0 
                  ? "bg-accent-green/20 text-accent-green" 
                  : "bg-red-500/20 text-red-400",
                isAnimating && "animate-bounce scale-125 bg-yellow-500/30 text-yellow-300"
              )}
            >
              {movesRemaining}
            </span>
            <span className="text-muted-foreground text-xs">moves</span>
          </div>
        )}
        
        {/* Action button */}
        <Button
          onClick={onEndPhase}
          size="sm"
          className="w-full bg-accent-green hover:bg-accent-green/80 text-black text-xs"
        >
          {phase === 'moves' && 'End Moves'}
          {phase === 'discard' && 'Done'}
          {phase === 'draw' && 'Draw'}
          {phase === 'score' && 'End Turn'}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-black/20 rounded-lg">
      {/* Phase indicator */}
      <div className="flex items-center gap-4">
        {(['moves', 'discard', 'draw', 'score'] as GamePhase[]).map((p) => (
          <div
            key={p}
            className={cn(
              "px-3 py-1 rounded text-xs font-medium uppercase tracking-wider transition-colors",
              phase === p 
                ? "bg-accent-green text-black" 
                : "bg-gray-700 text-gray-400"
            )}
          >
            {p}
          </div>
        ))}
      </div>
      
      {/* Current phase info with animated move counter */}
      <div className="text-lg font-semibold text-white flex items-center gap-2">
        {phaseLabels[phase]}
        {phase === 'moves' && (
          <span className="flex items-center gap-1">
            <span className="text-muted-foreground">(</span>
            <span 
              className={cn(
                "inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-full font-bold transition-all duration-300",
                movesRemaining > 0 
                  ? "bg-accent-green/20 text-accent-green" 
                  : "bg-red-500/20 text-red-400",
                isAnimating && "animate-bounce scale-125 bg-yellow-500/30 text-yellow-300 ring-2 ring-yellow-400"
              )}
            >
              {movesRemaining}
            </span>
            <span className="text-muted-foreground">moves left)</span>
          </span>
        )}
      </div>

      {/* Dragging hint */}
      {isDragging && phase === 'moves' && (
        <div className="text-sm text-yellow-400 animate-pulse">
          Drop on a valid target in your network
        </div>
      )}
      
      {/* Phase actions */}
      <div className="flex gap-2">
        {phase === 'moves' && (
          <Button
            onClick={onEndPhase}
            variant="default"
            className="bg-accent-green hover:bg-accent-green/80 text-black"
          >
            End Moves →
          </Button>
        )}
        
        {phase === 'discard' && (
          <Button
            onClick={onEndPhase}
            variant="default"
            className="bg-accent-green hover:bg-accent-green/80 text-black"
          >
            Done Discarding →
          </Button>
        )}
        
        {phase === 'draw' && (
          <Button
            onClick={onEndPhase}
            variant="default"
            className="bg-accent-green hover:bg-accent-green/80 text-black"
          >
            Draw & Score →
          </Button>
        )}
        
        {phase === 'score' && (
          <Button
            onClick={onEndPhase}
            variant="default"
            className="bg-accent-green hover:bg-accent-green/80 text-black"
          >
            End Turn →
          </Button>
        )}
      </div>
      
      {/* Help text */}
      <div className="text-xs text-muted-foreground text-center max-w-md">
        {phase === 'moves' && !isDragging && '🖱️ Drag cards from your hand to your network. Switch → Cable → Computer.'}
        {phase === 'discard' && 'Click cards in hand to discard unwanted cards.'}
        {phase === 'draw' && 'You\'ll draw up to 6 cards.'}
        {phase === 'score' && 'Each connected computer earns 1 bitcoin!'}
      </div>
    </div>
  );
}
