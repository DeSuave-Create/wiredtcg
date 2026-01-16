import { PlacedCard } from '@/types/game';
import { DroppableZone } from './DroppableZone';
import { cn } from '@/lib/utils';

interface ClassificationSectionProps {
  classificationCards: PlacedCard[];
  isCurrentPlayer: boolean;
  playerId: string;
  compact?: boolean;
}

const abilityDescriptions: Record<string, string> = {
  'security-specialist': '🛡️ Auto-resolves Hacked',
  'facilities': '⚡ Auto-resolves Power Outage',
  'supervisor': '👔 Auto-resolves New Hire',
  'field-tech': '🔧 +1 Move/Turn',
  'head-hunter': '🎯 Steals Classification',
  'seal-the-deal': '💎 Unblockable Steal',
};

const compactAbilityLabels: Record<string, string> = {
  'security-specialist': '🛡️',
  'facilities': '⚡',
  'supervisor': '👔',
  'field-tech': '🔧+1',
  'head-hunter': '🎯',
  'seal-the-deal': '💎',
};

export function ClassificationSection({
  classificationCards,
  isCurrentPlayer,
  playerId,
  compact = false,
}: ClassificationSectionProps) {
  // Player zone accepts placeable classifications (not Head Hunter/Seal the Deal)
  // Opponent zone accepts steal cards (Head Hunter, Seal the Deal)
  const acceptedCards = isCurrentPlayer 
    ? ['security-specialist', 'facilities', 'supervisor', 'field-tech'] // Cards you place on your own zone
    : ['head-hunter', 'seal-the-deal']; // Cards you use to steal from opponent

  return (
    <DroppableZone
      id={`${playerId}-classification`}
      type="classification"
      accepts={acceptedCards}
      className="w-full"
    >
      <div className={cn(
        "bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg border border-purple-500/30",
        compact ? "p-2" : "p-3"
      )}>
        <div className={cn(
          "flex items-center justify-between",
          compact ? "mb-1" : "mb-2"
        )}>
          <div className="flex items-center gap-2">
            <span className={cn(
              "font-semibold text-purple-300",
              compact ? "text-[10px]" : "text-xs"
            )}>
              {compact ? "🎖️ CLASS" : "🎖️ CLASSIFICATIONS"}
            </span>
            <span className={cn(
              "text-muted-foreground",
              compact ? "text-[10px]" : "text-xs"
            )}>({classificationCards.length}/2)</span>
          </div>
          {/* Show active bonuses */}
          {classificationCards.length > 0 && !compact && (
            <div className="flex gap-2">
              {classificationCards.map((classCard) => (
                <span 
                  key={classCard.id}
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                    classCard.card.subtype === 'field-tech' && "bg-green-500/30 text-green-300",
                    classCard.card.subtype === 'head-hunter' && "bg-yellow-500/30 text-yellow-300",
                    classCard.card.subtype === 'seal-the-deal' && "bg-amber-500/30 text-amber-300",
                    classCard.card.subtype === 'security-specialist' && "bg-blue-500/30 text-blue-300",
                    classCard.card.subtype === 'facilities' && "bg-cyan-500/30 text-cyan-300",
                    classCard.card.subtype === 'supervisor' && "bg-indigo-500/30 text-indigo-300"
                  )}
                >
                  {abilityDescriptions[classCard.card.subtype]}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div className={cn(
          "flex items-center",
          compact ? "gap-2 min-h-[40px]" : "gap-3 min-h-[70px]"
        )}>
          {classificationCards.length === 0 ? (
            <div className={cn(
              "text-muted-foreground italic",
              compact ? "text-[10px]" : "text-xs"
            )}>
              {isCurrentPlayer 
                ? (compact ? 'Drop here' : 'Drag classification cards here (max 2)') 
                : (compact ? 'None' : 'No classifications in play')
              }
            </div>
          ) : (
            classificationCards.map((classCard) => (
              <div key={classCard.id} className="relative group">
                <div className={cn(
                  "rounded border-2 border-purple-500 overflow-hidden shadow-lg shadow-purple-500/20 transition-transform hover:scale-105",
                  compact ? "w-8 h-11" : "w-14 h-20"
                )}>
                  <img 
                    src={classCard.card.image} 
                    alt={classCard.card.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                {/* Compact ability indicator */}
                {compact && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] bg-purple-900/90 text-purple-200 px-1 rounded">
                    {compactAbilityLabels[classCard.card.subtype]}
                  </div>
                )}
                {/* Full ability tooltip */}
                {!compact && (
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] bg-purple-900/90 text-purple-200 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {classCard.card.name}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </DroppableZone>
  );
}