import { Button } from '@/components/ui/button';
import { GamePhase } from '@/types/game';
import { cn } from '@/lib/utils';

interface GameControlsSimpleProps {
  phase: GamePhase;
  movesRemaining: number;
  onEndPhase: () => void;
  isCurrentPlayerHuman: boolean;
  isDragging: boolean;
}

export function GameControlsSimple({
  phase,
  movesRemaining,
  onEndPhase,
  isCurrentPlayerHuman,
  isDragging,
}: GameControlsSimpleProps) {
  if (!isCurrentPlayerHuman) {
    return (
      <div className="text-center py-4">
        <div className="animate-pulse text-accent-green">Computer is thinking...</div>
      </div>
    );
  }

  const phaseLabels: Record<GamePhase, string> = {
    'trade': 'Trade Phase',
    'moves': 'Play Cards',
    'discard': 'Discard Phase',
    'draw': 'Draw Cards',
    'score': 'Scoring',
    'game-over': 'Game Over',
  };

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
      
      {/* Current phase info */}
      <div className="text-lg font-semibold text-white">
        {phaseLabels[phase]}
        {phase === 'moves' && (
          <span className="ml-2 text-accent-green">({movesRemaining} moves left)</span>
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
