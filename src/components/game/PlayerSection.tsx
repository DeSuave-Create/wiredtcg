import { Player, Card, GamePhase } from '@/types/game';
import { NetworkBoardDroppable } from './NetworkBoardDroppable';
import { ClassificationSection } from './ClassificationSection';
import { PlayerHandDraggable } from './PlayerHandDraggable';
import { DiscardZone } from './DiscardZone';
import { AuditedComputersSection } from './AuditedComputersSection';
import { Button } from '@/components/ui/button';
import { Bitcoin, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';

interface PlayerSectionProps {
  player: Player;
  isHuman: boolean;
  isCurrentTurn: boolean;
  canPlayCards: boolean;
  canDiscard: boolean;
  isDiscardPhase: boolean;
  hasResolutionCards: boolean;
  hasDisabledEquipment: boolean;
  discardPile: Card[];
  connectedComputers: number;
  playerId: string;
  gamePhase: GamePhase;
  movesRemaining?: number;
  onEndPhase?: () => void;
  isDragging?: boolean;
}

export function PlayerSection({
  player,
  isHuman,
  isCurrentTurn,
  canPlayCards,
  canDiscard,
  isDiscardPhase,
  hasResolutionCards,
  hasDisabledEquipment,
  discardPile,
  connectedComputers,
  playerId,
  gamePhase,
  movesRemaining = 0,
  onEndPhase,
  isDragging = false,
}: PlayerSectionProps) {
  const sectionTitle = isHuman ? 'YOUR NETWORK' : "COMPUTER'S NETWORK";
  const handLabel = isHuman ? 'Your Hand' : "Computer's Hand";
  const playerLabel = isHuman ? 'You' : 'Computer';
  const borderColor = isHuman ? 'border-accent-green/40' : 'border-gray-600';
  const titleColor = isHuman ? 'text-accent-green' : 'text-gray-400';

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

  const getButtonText = () => {
    switch (gamePhase) {
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
    <div className={cn(
      "bg-gray-900/60 rounded-lg border flex flex-col h-full",
      borderColor
    )}>
      {/* Section Header */}
      <div className={cn(
        "px-4 py-2 border-b",
        isHuman ? "border-accent-green/30" : "border-gray-700"
      )}>
        <h2 className={cn("text-sm font-bold uppercase tracking-wider", titleColor)}>
          {sectionTitle}
        </h2>
      </div>

      {/* Content Container */}
      <div className="flex-1 p-4 space-y-4">
        {/* Network Board */}
        <NetworkBoardDroppable
          network={player.network}
          isCurrentPlayer={isHuman && isCurrentTurn}
          label={isHuman ? 'Your Network' : "Computer's Network"}
          playerId={playerId}
          canReceiveAttacks={!isHuman && canPlayCards}
          canReceiveResolutions={isHuman && canPlayCards && hasResolutionCards && hasDisabledEquipment}
          canRearrange={isHuman && canPlayCards}
        />

        {/* Classifications Row - consistent height for both players */}
        <div className="flex gap-3 items-stretch min-h-[80px]">
          <div className="flex-1">
            <ClassificationSection
              classificationCards={player.classificationCards}
              isCurrentPlayer={isHuman}
              playerId={playerId}
              canDrag={isHuman && canPlayCards}
            />
          </div>
          
          {/* Game Controls - only for human player, otherwise empty space for alignment */}
          {isHuman && onEndPhase ? (
            <div className="flex flex-col items-center justify-center gap-2 p-3 bg-black/30 rounded-lg border border-accent-green/30 min-w-[140px]">
              <Button
                onClick={onEndPhase}
                className="w-full px-4 py-2 bg-accent-green hover:bg-accent-green/80 text-black font-semibold rounded-full text-sm"
              >
                {getButtonText()}
              </Button>
              
              {gamePhase === 'moves' && (
                <div className="flex items-center gap-2 text-xs">
                  <span 
                    className={cn(
                      "w-6 h-6 rounded flex items-center justify-center font-bold transition-all duration-300",
                      movesRemaining > 0 
                        ? "bg-accent-green/20 text-accent-green" 
                        : "bg-red-500/20 text-red-400",
                      isAnimating && "animate-bounce scale-125 bg-yellow-500/30 text-yellow-300"
                    )}
                  >
                    {movesRemaining}
                  </span>
                  <span className="text-muted-foreground">moves x3</span>
                </div>
              )}
              
              {!isCurrentTurn && (
                <div className="animate-pulse text-accent-green text-xs">
                  AI thinking...
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Hand - consistent height */}
        <div className="min-h-[200px]">
          <div className="flex items-center justify-between mb-2">
            <span className={cn("text-sm font-medium", titleColor)}>{handLabel}</span>
            <span className="text-xs text-muted-foreground">{player.hand.length} cards</span>
          </div>
          <PlayerHandDraggable
            cards={player.hand}
            isCurrentPlayer={isHuman && isCurrentTurn}
            showCards={isHuman}
            disabled={isHuman ? (!canPlayCards && !canDiscard && !isDiscardPhase) : true}
            gridLayout={true}
          />
        </div>

        {/* Discard + Audited Cards Row - consistent height */}
        <div className="grid grid-cols-2 gap-3 min-h-[100px]">
          {/* Discard Pile */}
          <div className={cn(
            "flex flex-col items-center justify-center p-3 rounded-lg border",
            isHuman && (canDiscard || isDiscardPhase) 
              ? "border-dashed border-gray-500 bg-black/30" 
              : "border-gray-700/50 bg-black/20"
          )}>
            {isHuman ? (
              <DiscardZone
                discardPile={discardPile}
                isActive={canDiscard || isDiscardPhase}
                playerId={playerId}
                isDiscardPhase={isDiscardPhase}
              />
            ) : (
              <>
                <span className="text-xs text-gray-500 uppercase tracking-wider mb-2">Discard Pile</span>
                <Trash2 className="w-6 h-6 text-gray-600 mb-1" />
                <span className="text-xs text-muted-foreground">0 cards</span>
              </>
            )}
          </div>

          {/* Audited Cards */}
          <div className={cn(
            "flex flex-col items-center justify-center p-3 rounded-lg border border-gray-700/50 bg-black/20"
          )}>
            <span className="text-xs text-gray-500 uppercase tracking-wider mb-2">Audited Cards</span>
            {isHuman && player.auditedComputers.length > 0 ? (
              <AuditedComputersSection
                auditedComputers={player.auditedComputers}
                isCurrentPlayer={isCurrentTurn}
                canPlay={canPlayCards}
              />
            ) : (
              <span className="text-xs text-muted-foreground">
                {player.auditedComputers.length} cards
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Score Footer */}
      <div className={cn(
        "px-4 py-3 border-t flex items-center justify-center gap-4",
        isHuman ? "border-accent-green/30 bg-accent-green/5" : "border-gray-700 bg-gray-800/30"
      )}>
        <span className={cn("font-medium", titleColor)}>{playerLabel}</span>
        <div className="flex items-center gap-1">
          <Bitcoin className={cn("w-5 h-5", isHuman ? "text-accent-green" : "text-gray-400")} />
          <span className={cn("text-2xl font-bold", isHuman ? "text-accent-green" : "text-gray-300")}>
            {player.score}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          <span className={isHuman ? "text-accent-green" : "text-gray-400"}>{connectedComputers}</span>
          {' '}connected
        </div>
      </div>
    </div>
  );
}
