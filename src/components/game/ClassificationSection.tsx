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
        "bg-gradient-to-r from-blue-900/40 to-blue-800/30 rounded-lg border border-blue-500/40 p-2 h-full flex flex-col",
        hasDuplicateProtection && "ring-2 ring-yellow-500/50"
      )}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-blue-300 text-[10px]">
              🎖️ CLASSIFICATIONS
            </span>
            <span className="text-[10px] text-muted-foreground">({classificationCards.length}/2)</span>
            {hasDuplicateProtection && (
              <span className="text-[8px] text-yellow-400">🛡️ Protected</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-1 min-h-0">
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
                <div key={classCard.id} className="relative group">
                  <div className="rounded border-2 border-gray-600 overflow-hidden transition-transform hover:scale-105 w-10 h-14">
                    <img 
                      src={classCard.card.image} 
                      alt={classCard.card.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] bg-blue-900/90 text-blue-200 px-1 rounded">
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