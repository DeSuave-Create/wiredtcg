import { Player, Card, GamePhase } from '@/types/game';
import { NetworkBoardDroppable } from './NetworkBoardDroppable';
import { ClassificationSection } from './ClassificationSection';
import { PlayerHandDraggable } from './PlayerHandDraggable';
import { DiscardZone } from './DiscardZone';
import { AuditedComputersSection } from './AuditedComputersSection';
import { Bitcoin, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
}: PlayerSectionProps) {
  const sectionTitle = isHuman ? 'YOUR NETWORK' : "COMPUTER'S NETWORK";
  const handLabel = isHuman ? 'Your Hand' : "Computer's Hand";
  const playerLabel = isHuman ? 'You' : 'Computer';
  const borderColor = isHuman ? 'border-accent-green/40' : 'border-gray-600';
  const titleColor = isHuman ? 'text-accent-green' : 'text-gray-400';

  return (
    <div className={cn(
      "bg-gray-900/60 rounded-lg border flex flex-col",
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

        {/* Classifications */}
        <ClassificationSection
          classificationCards={player.classificationCards}
          isCurrentPlayer={isHuman}
          playerId={playerId}
          canDrag={isHuman && canPlayCards}
        />

        {/* Hand */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className={cn("text-sm font-medium", titleColor)}>{handLabel}</span>
            <span className="text-xs text-muted-foreground">{player.hand.length} cards</span>
          </div>
          <PlayerHandDraggable
            cards={player.hand}
            isCurrentPlayer={isHuman && isCurrentTurn}
            showCards={isHuman}
            disabled={isHuman ? (!canPlayCards && !canDiscard && !isDiscardPhase) : true}
            gridLayout={isHuman}
          />
        </div>

        {/* Discard + Audited Cards Row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Discard Pile */}
          <div className={cn(
            "flex flex-col items-center p-3 rounded-lg border",
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
            "flex flex-col items-center p-3 rounded-lg border border-gray-700/50 bg-black/20"
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
