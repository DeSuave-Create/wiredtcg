import { PlacedCard } from '@/types/game';
import { DroppableZone } from './DroppableZone';
import { cn } from '@/lib/utils';

interface ClassificationSectionProps {
  classificationCards: PlacedCard[];
  isCurrentPlayer: boolean;
  playerId: string;
}

const abilityDescriptions: Record<string, string> = {
  'security-specialist': '🛡️ Blocks Hacked',
  'facilities': '⚡ Blocks Power Outage',
  'supervisor': '👔 Blocks New Hire',
  'field-tech': '🔧 +1 Move/Turn',
  'head-hunter': '🎯 +1 Card/Turn',
  'seal-the-deal': '💰 2x Scoring',
};

export function ClassificationSection({
  classificationCards,
  isCurrentPlayer,
  playerId,
}: ClassificationSectionProps) {
  return (
    <DroppableZone
      id={`${playerId}-classification`}
      type="classification"
      accepts={isCurrentPlayer ? ['security-specialist', 'facilities', 'supervisor', 'field-tech', 'head-hunter', 'seal-the-deal'] : []}
      className="w-full"
    >
      <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-3 border border-purple-500/30">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-purple-300">🎖️ CLASSIFICATIONS</span>
          <span className="text-xs text-muted-foreground">({classificationCards.length}/2)</span>
        </div>
        
        <div className="flex gap-3 min-h-[70px] items-center">
          {classificationCards.length === 0 ? (
            <div className="text-xs text-muted-foreground italic">
              {isCurrentPlayer ? 'Drag classification cards here (max 2)' : 'No classifications in play'}
            </div>
          ) : (
            classificationCards.map((classCard) => (
              <div key={classCard.id} className="relative group">
                <div className="w-14 h-20 rounded border-2 border-purple-500 overflow-hidden shadow-lg shadow-purple-500/20 transition-transform hover:scale-105">
                  <img 
                    src={classCard.card.image} 
                    alt={classCard.card.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                {/* Ability tooltip */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] bg-purple-900/90 text-purple-200 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  {abilityDescriptions[classCard.card.subtype] || classCard.card.name}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DroppableZone>
  );
}
