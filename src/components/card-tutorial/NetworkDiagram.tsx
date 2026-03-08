import { memo } from 'react';
import { tutorialCards } from '@/data/cardInteractions';
import { cn } from '@/lib/utils';

interface NetworkDiagramProps {
  /** Cards to show in network hierarchy: [internet, switch, cable, computer] order expected */
  cardIds: string[];
  highlight?: string;
  effectLabel?: string;
  fadeOut?: string[];
}

const NetworkDiagram = memo(({ cardIds, highlight, effectLabel, fadeOut = [] }: NetworkDiagramProps) => {
  const fadeOutSet = new Set(fadeOut);

  // Categorize cards by type for layout
  const internet = cardIds.find(id => id === 'internet');
  const switches = cardIds.filter(id => tutorialCards[id]?.type === 'equipment' && id === 'switch');
  const cables = cardIds.filter(id => tutorialCards[id]?.type === 'equipment' && (id === 'cable-2' || id === 'cable-3'));
  const computers = cardIds.filter(id => id === 'computer');

  // For scoring demo, show multiple computers
  const computerCount = cardIds.filter(id => id === 'computer').length || 1;

  const renderCard = (cardId: string, key: string, size: 'sm' | 'md' = 'md', label?: string) => {
    const card = tutorialCards[cardId];
    if (!card && cardId !== 'internet') return null;

    const isHighlighted = highlight === cardId;
    const isFading = fadeOutSet.has(cardId);
    const imgSrc = cardId === 'internet' ? '/lovable-uploads/internet-logo.png' : card?.image;
    const name = cardId === 'internet' ? 'Internet' : card?.name;
    const w = size === 'sm' ? 'w-[60px] sm:w-[72px]' : 'w-[72px] sm:w-[88px]';

    return (
      <div
        key={key}
        className={cn(
          'flex flex-col items-center transition-all duration-500',
          isFading && 'opacity-20 scale-90',
          isHighlighted && 'scale-105',
        )}
      >
        <div className={cn(
          'rounded-lg overflow-hidden',
          w,
          isHighlighted && 'ring-2 ring-primary/50 shadow-lg shadow-primary/20',
        )}>
          <img
            src={imgSrc}
            alt={name || cardId}
            className="w-full h-auto object-contain"
            loading="eager"
            decoding="async"
          />
        </div>
        {label && (
          <span className="text-[9px] sm:text-[10px] font-orbitron text-muted-foreground mt-1">{label}</span>
        )}
      </div>
    );
  };

  const lineClass = 'w-px h-4 sm:h-6 bg-primary/40';
  const branchLineClass = 'border-t border-primary/40';

  return (
    <div className="flex flex-col items-center justify-center min-h-[420px] sm:min-h-[480px] py-6 gap-1">
      {/* Internet */}
      {internet && (
        <>
          {renderCard('internet', 'internet', 'md')}
          <div className={lineClass} />
        </>
      )}

      {/* Switch */}
      {switches.length > 0 && (
        <>
          {renderCard('switch', 'switch', 'md')}
          <div className={lineClass} />
        </>
      )}

      {/* Label: cables */}
      {cables.length > 0 && (
        <span className="text-[9px] font-orbitron text-muted-foreground/60 tracking-widest uppercase mb-1">cables</span>
      )}

      {/* Cables row with branching lines */}
      {cables.length > 0 && (
        <>
          <div className="flex items-start gap-3 sm:gap-5 relative">
            {/* Horizontal branch line */}
            {cables.length > 1 && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px bg-primary/30" style={{ width: `${(cables.length - 1) * 80}%` }} />
            )}
            {cables.map((cableId, i) => (
              <div key={`cable-${i}`} className="flex flex-col items-center">
                {renderCard(cableId, `cable-${i}`, 'sm')}
                {/* Ports label */}
                <span className="text-[9px] font-orbitron text-primary/60 mt-0.5">
                  {cableId === 'cable-2' ? '2/2' : cableId === 'cable-3' ? `${Math.min(computerCount, 3)}/3` : ''}
                </span>
              </div>
            ))}
          </div>
          <div className={lineClass} />
        </>
      )}

      {/* Computers row */}
      {computerCount > 0 && computers.length > 0 && (
        <div className="flex items-start gap-2 sm:gap-3">
          {Array.from({ length: Math.min(computerCount, 4) }).map((_, i) => (
            <div key={`comp-${i}`} className="flex flex-col items-center">
              {renderCard('computer', `comp-${i}`, 'sm')}
            </div>
          ))}
        </div>
      )}

      {/* Effect label */}
      {effectLabel && (
        <div className={cn(
          'mt-3 px-4 py-1.5 rounded-full text-[10px] sm:text-[11px] font-orbitron font-bold tracking-widest',
          effectLabel.includes('MINING') || effectLabel.includes('SCORE') || effectLabel.includes('RACE')
            ? 'bg-primary/20 text-primary'
            : effectLabel.includes('BITCOIN')
            ? 'bg-accent-bitcoin/20 text-accent-bitcoin'
            : effectLabel.includes('HACKED') || effectLabel.includes('POWER') || effectLabel.includes('NEW HIRE') || effectLabel.includes('DISABLED')
              ? 'bg-destructive/20 text-destructive'
              : 'bg-muted/20 text-muted-foreground',
        )}>
          {effectLabel}
        </div>
      )}
    </div>
  );
});

NetworkDiagram.displayName = 'NetworkDiagram';

export default NetworkDiagram;
