import { Button } from '@/components/ui/button';
import { GamePhase, Card } from '@/types/game';
import { cn } from '@/lib/utils';

interface GameControlsProps {
  phase: GamePhase;
  movesRemaining: number;
  selectedCard: Card | null;
  onPlaySwitch: () => void;
  onEndPhase: () => void;
  onClearSelection: () => void;
  hasSwitch: boolean;
  hasSwitchInNetwork: boolean;
  hasCableWithSpace: boolean;
  isCurrentPlayerHuman: boolean;
}

export function GameControls({
  phase,
  movesRemaining,
  selectedCard,
  onPlaySwitch,
  onEndPhase,
  onClearSelection,
  hasSwitch,
  hasSwitchInNetwork,
  hasCableWithSpace,
  isCurrentPlayerHuman,
}: GameControlsProps) {
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
    'audit': 'Audit Battle',
    'headhunter-battle': 'Head Hunter Battle',
  };

  // Get contextual action based on selected card
  const getSelectedCardAction = () => {
    if (!selectedCard || phase !== 'moves' || movesRemaining <= 0) return null;

    switch (selectedCard.subtype) {
      case 'switch':
        return {
          label: 'Play Switch',
          action: onPlaySwitch,
          enabled: true,
          hint: 'Connects to the Internet',
        };
      case 'cable-2':
      case 'cable-3':
        return {
          label: `Play ${selectedCard.subtype === 'cable-2' ? '2-Cable' : '3-Cable'}`,
          action: null, // Requires clicking a switch
          enabled: hasSwitchInNetwork,
          hint: hasSwitchInNetwork ? 'Click a Switch in your network to attach' : 'You need a Switch first!',
        };
      case 'computer':
        return {
          label: 'Play Computer',
          action: null, // Requires clicking a cable
          enabled: hasCableWithSpace,
          hint: hasCableWithSpace ? 'Click a Cable in your network to attach' : 'You need a Cable with space first!',
        };
      default:
        return {
          label: `Play ${selectedCard.name}`,
          action: null,
          enabled: false,
          hint: 'Attack/Resolution cards coming in Phase 2!',
        };
    }
  };

  const cardAction = getSelectedCardAction();

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

      {/* Selected card action */}
      {phase === 'moves' && selectedCard && cardAction && (
        <div className="flex flex-col items-center gap-2 p-3 bg-yellow-400/10 border border-yellow-400/50 rounded-lg">
          <div className="text-sm text-yellow-400 font-medium">
            Selected: {selectedCard.name}
          </div>
          <div className="flex gap-2">
            {cardAction.action ? (
              <Button
                onClick={cardAction.action}
                disabled={!cardAction.enabled || movesRemaining <= 0}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
              >
                {cardAction.label}
              </Button>
            ) : (
              <div className={cn(
                "px-4 py-2 rounded font-medium",
                cardAction.enabled 
                  ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500" 
                  : "bg-gray-700 text-gray-400"
              )}>
                {cardAction.label}
              </div>
            )}
            <Button
              onClick={onClearSelection}
              variant="outline"
              className="border-gray-500 text-gray-400 hover:bg-gray-700"
            >
              Cancel
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            {cardAction.hint}
          </div>
        </div>
      )}
      
      {/* Phase actions */}
      <div className="flex gap-2">
        {phase === 'moves' && !selectedCard && (
          <div className="text-sm text-muted-foreground">
            Select a card from your hand to play
          </div>
        )}
        
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
        {phase === 'moves' && !selectedCard && 'Click cards in hand to select, then click your network to place. Switch → Cable → Computer.'}
        {phase === 'discard' && 'Click cards in hand to discard unwanted cards.'}
        {phase === 'draw' && 'You\'ll draw up to 6 cards.'}
        {phase === 'score' && 'Each connected computer earns 1 bitcoin!'}
      </div>
    </div>
  );
}
