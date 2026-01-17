import { PlacedCard } from '@/types/game';
import { DroppableZone } from './DroppableZone';
import { DraggableClassificationCard } from './DraggableClassificationCard';
import { cn } from '@/lib/utils';

interface ClassificationSectionProps {
  classificationCards: PlacedCard[];
  isCurrentPlayer: boolean;
  playerId: string;
  compact?: boolean;
  canDrag?: boolean; // Allow dragging classifications to discard
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
  canDrag = false,
}: ClassificationSectionProps) {
  // Player zone accepts placeable classifications (not Head Hunter/Seal the Deal)
  // Opponent zone accepts steal cards (Head Hunter, Seal the Deal)
  const acceptedCards = isCurrentPlayer 
    ? ['security-specialist', 'facilities', 'supervisor', 'field-tech'] // Cards you place on your own zone
    : ['head-hunter', 'seal-the-deal']; // Cards you use to steal from opponent

  // Check if duplicates exist (steal protection)
  const classTypes = classificationCards.map(c => c.card.subtype);
  const hasDuplicateProtection = classTypes.some((type, i) => classTypes.indexOf(type) !== i);

  return (
    <DroppableZone
      id={`${playerId}-classification`}
      type="classification"
      accepts={acceptedCards}
      className="w-full h-full"
    >
      <div className={cn(
        "bg-gradient-to-r from-blue-900/40 to-blue-800/30 rounded-lg border border-blue-500/40 p-3 h-full flex flex-col relative overflow-visible",
        hasDuplicateProtection && "ring-2 ring-yellow-400 border-yellow-500/60"
      )}>
        {/* Animated shield overlay for duplicate protection */}
        {hasDuplicateProtection && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-yellow-400/5 to-yellow-500/10 animate-pulse" />
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent animate-pulse" />
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent animate-pulse" />
          </div>
        )}
        
        <div className="flex items-center justify-between mb-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-blue-300 text-[10px]">
              🎖️ CLASSIFICATIONS
            </span>
            <span className="text-[10px] text-muted-foreground">({classificationCards.length}/2)</span>
          </div>
          {hasDuplicateProtection && (
            <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-0.5 rounded-full border border-yellow-500/50 animate-pulse">
              <span className="text-yellow-400 text-lg">🛡️</span>
              <span className="text-[10px] text-yellow-300 font-semibold">STEAL PROTECTED</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3 flex-1 relative z-10">
          {classificationCards.length === 0 ? (
            <div className="text-muted-foreground italic text-[10px]">
              {isCurrentPlayer 
                ? 'Drag classification cards here (max 2)' 
                : 'No classifications in play'
              }
            </div>
          ) : (
            classificationCards.map((classCard) => (
              canDrag && isCurrentPlayer ? (
                <DraggableClassificationCard
                  key={classCard.id}
                  classCard={classCard}
                  compact={true}
                  abilityLabel={compactAbilityLabels[classCard.card.subtype]}
                />
              ) : (
              <div key={classCard.id} className="relative group flex-shrink-0">
                  <div className={cn(
                    "rounded border-2 overflow-hidden transition-transform hover:scale-105 w-28 h-40",
                    hasDuplicateProtection ? "border-yellow-500/70 shadow-lg shadow-yellow-500/20" : "border-gray-600"
                  )}>
                    <img 
                      src={classCard.card.image} 
                      alt={classCard.card.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] bg-blue-900/90 text-blue-200 px-1 rounded whitespace-nowrap">
                    {compactAbilityLabels[classCard.card.subtype]}
                  </div>
                </div>
              )
            ))
          )}
        </div>
      </div>
    </DroppableZone>
  );
}