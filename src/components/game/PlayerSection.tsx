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
import { AIDifficulty } from '@/utils/ai';
import { useMobileGameOptional } from '@/contexts/MobileGameContext';

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
  equipmentMovesRemaining?: number; // Bonus equipment moves from Field Tech
  onEndPhase?: () => void;
  isDragging?: boolean;
  isWinning?: boolean;
  opponentScore?: number;
  humanCanPlayCards?: boolean; // Whether the human player can play cards (for attack targeting)
  aiDifficulty?: AIDifficulty; // Current AI difficulty for showing hints
  onMobilePlacement?: (dropZoneId: string, dropZoneType: string) => void; // Mobile tap-to-place handler
  onMobileDiscard?: () => void; // Mobile tap-to-discard handler
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
  equipmentMovesRemaining = 0,
  onEndPhase,
  isDragging = false,
  isWinning = false,
  opponentScore = 0,
  humanCanPlayCards = false,
  aiDifficulty,
  onMobilePlacement,
  onMobileDiscard,
}: PlayerSectionProps) {
  const mobileContext = useMobileGameOptional();
  const isMobile = mobileContext?.isMobile ?? false;
  
  const sectionTitle = isHuman ? 'YOUR NETWORK' : "COMPUTER'S NETWORK";
  const handLabel = isHuman ? 'Your Hand' : "Computer's Hand";
  const playerLabel = isHuman ? 'You' : 'Computer';
  const borderColor = isHuman ? 'border-accent-green/40' : 'border-gray-600';
  const titleColor = isHuman ? 'text-accent-green' : 'text-gray-400';

  const [isAnimating, setIsAnimating] = useState(false);
  const prevMovesRef = useRef(movesRemaining + equipmentMovesRemaining);
  const totalMoves = movesRemaining + equipmentMovesRemaining;

  // Animate when moves decrement
  useEffect(() => {
    const currentTotal = movesRemaining + equipmentMovesRemaining;
    if (currentTotal < prevMovesRef.current) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 400);
      return () => clearTimeout(timer);
    }
    prevMovesRef.current = currentTotal;
  }, [movesRemaining, equipmentMovesRemaining]);

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

      {/* Content Container - scrollable if network grows */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Network Board - with score in top right corner */}
        <div className={cn(
          "relative",
          isMobile ? "min-h-[200px] overflow-x-auto" : "min-h-[300px] overflow-visible"
        )}>
          {/* Score Badge - Top Right Corner */}
          <div className={cn(
            "absolute top-2 right-2 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg border",
            isWinning 
              ? "bg-yellow-500/20 border-yellow-500/50" 
              : isHuman 
                ? "bg-accent-green/20 border-accent-green/50" 
                : "bg-gray-800/80 border-gray-600"
          )}>
            <Bitcoin className={cn("w-5 h-5", isWinning ? "text-yellow-400" : isHuman ? "text-accent-green" : "text-gray-400")} />
            <span className={cn(
              isMobile ? "text-lg" : "text-xl",
              "font-bold",
              isWinning ? "text-yellow-400" : isHuman ? "text-accent-green" : "text-gray-300"
            )}>
              {player.score}
            </span>
            <span className={cn(
              "text-xs",
              isWinning ? "text-yellow-400/80" : isHuman ? "text-accent-green/80" : "text-gray-500"
            )}>
              ({connectedComputers} mining)
            </span>
          </div>
          
          <NetworkBoardDroppable
            network={player.network}
            isCurrentPlayer={isHuman && isCurrentTurn}
            label={isHuman ? 'Your Network' : "Computer's Network"}
            playerId={playerId}
            canReceiveAttacks={!isHuman && humanCanPlayCards}
            canReceiveResolutions={isHuman && canPlayCards && hasResolutionCards && hasDisabledEquipment}
            canRearrange={isHuman && canPlayCards}
            showEasyModeHints={aiDifficulty === 'easy' && isHuman}
            onMobilePlacement={onMobilePlacement}
          />
        </div>

        {/* Classifications Row - height for full cards */}
        <div className={cn(
          "flex gap-3 items-stretch",
          isMobile ? "h-[120px]" : "h-[200px]"
        )}>
          <div className="flex-1">
            <ClassificationSection
              classificationCards={player.classificationCards}
              isCurrentPlayer={isHuman}
              playerId={playerId}
              canDrag={isHuman && canPlayCards}
              onMobilePlacement={onMobilePlacement}
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
                      totalMoves > 0 
                        ? "bg-accent-green/20 text-accent-green" 
                        : "bg-red-500/20 text-red-400",
                      isAnimating && "animate-bounce scale-125 bg-yellow-500/30 text-yellow-300"
                    )}
                  >
                    {totalMoves}
                  </span>
                  <span className="text-muted-foreground">
                    moves{equipmentMovesRemaining > 0 ? ` (${equipmentMovesRemaining}🔧)` : ''}
                  </span>
                </div>
              )}
              
              {!isCurrentTurn && (
                <div className="animate-pulse text-accent-green text-xs">
                  AI thinking...
                </div>
              )}
            </div>
          ) : (
            <div className="min-w-[140px]" /> 
          )}
        </div>

        {/* Hand - scrollable on mobile */}
        <div className={cn(
          "bg-black/20 rounded-lg p-2",
          isMobile ? "h-[130px]" : "h-[140px]"
        )}>
          <div className="flex items-center justify-between mb-1">
            <span className={cn("text-sm font-medium", titleColor)}>{handLabel}</span>
            <span className="text-xs text-muted-foreground">{player.hand.length} cards</span>
          </div>
          <PlayerHandDraggable
            cards={player.hand}
            isCurrentPlayer={isHuman && isCurrentTurn}
            showCards={isHuman}
            disabled={isHuman ? (!canPlayCards && !canDiscard && !isDiscardPhase) : true}
            gridLayout={true}
            compact={false}
          />
        </div>

        {/* Buffer between hand and discard/audited sections */}
        <div className="h-4" />

        {/* Discard + Audited Cards Row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Discard Pile */}
          <div className={cn(
            "flex flex-col items-center justify-center p-3 rounded-lg border h-40",
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
                onMobileDiscard={onMobileDiscard}
              />
            ) : (
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-500">Discard: {discardPile.length}</span>
              </div>
            )}
          </div>

          {/* Audited Cards */}
          <div className="flex flex-col items-center justify-center p-2 rounded-lg border border-gray-700/50 bg-black/20 h-40 overflow-hidden">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-500">Audited:</span>
              <span className="text-xs text-muted-foreground">
                {player.auditedComputers.length} cards
              </span>
            </div>
            {player.auditedComputers.length > 0 && (
              <div className="flex gap-1 flex-wrap justify-center max-h-[80px] overflow-hidden">
                {player.auditedComputers.slice(0, 4).map((card, index) => (
                  <div 
                    key={`audit-preview-${card.id}-${index}`}
                    className="w-10 h-14 rounded border border-yellow-500/50 overflow-hidden bg-yellow-500/10"
                  >
                    <img 
                      src={card.image} 
                      alt={card.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
                {player.auditedComputers.length > 4 && (
                  <div className="w-10 h-14 rounded border border-yellow-500/30 bg-yellow-500/10 flex items-center justify-center">
                    <span className="text-xs text-yellow-400">+{player.auditedComputers.length - 4}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer - simplified, score moved to network board */}
      <div className={cn(
        "px-4 py-2 border-t flex items-center justify-center",
        isHuman ? "border-accent-green/30 bg-accent-green/5" : "border-gray-700 bg-gray-800/30"
      )}>
        <span className={cn("text-sm font-medium", titleColor)}>{playerLabel}</span>
      </div>
    </div>
  );
}
