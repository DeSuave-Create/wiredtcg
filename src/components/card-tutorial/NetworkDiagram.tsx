import { memo } from 'react';
import { tutorialCards } from '@/data/cardInteractions';
import { cn } from '@/lib/utils';

interface NetworkDiagramProps {
  cardIds: string[];
  highlight?: string;
  effectLabel?: string;
  fadeOut?: string[];
  attackOverlay?: { attackCardId: string; targetEquipment: string };
}

const NetworkDiagram = memo(({ cardIds, highlight, effectLabel, fadeOut = [], attackOverlay }: NetworkDiagramProps) => {
  const fadeOutSet = new Set(fadeOut);

  const internet = cardIds.find(id => id === 'internet');
  const switches = cardIds.filter(id => tutorialCards[id]?.type === 'equipment' && id === 'switch');
  const cables = cardIds.filter(id => tutorialCards[id]?.type === 'equipment' && (id === 'cable-2' || id === 'cable-3'));
  const computers = cardIds.filter(id => id === 'computer');
  const computerCount = cardIds.filter(id => id === 'computer').length || 1;

  const renderCard = (cardId: string, key: string, size: 'sm' | 'md' = 'md') => {
    const card = tutorialCards[cardId];
    if (!card && cardId !== 'internet') return null;

    const isHighlighted = highlight === cardId;
    const isFading = fadeOutSet.has(cardId);
    const imgSrc = cardId === 'internet' ? '/lovable-uploads/internet-logo.png' : card?.image;
    const name = cardId === 'internet' ? 'Internet' : card?.name;
    const w = size === 'sm' ? 'w-[60px] sm:w-[72px]' : 'w-[72px] sm:w-[88px]';
    const hasAttack = attackOverlay && attackOverlay.targetEquipment === cardId;

    return (
      <div
        key={key}
        className={cn(
          'flex flex-col items-center transition-all duration-500 relative',
          isFading && !hasAttack && 'opacity-20 scale-90',
          isHighlighted && !hasAttack && 'scale-105',
        )}
      >
        <div className={cn(
          'rounded-lg overflow-hidden relative transition-all duration-500',
          w,
          isHighlighted && !hasAttack && 'ring-2 ring-primary/50 shadow-lg shadow-primary/20',
          isFading && hasAttack && 'opacity-20 scale-90',
        )}>
          <img
            src={imgSrc}
            alt={name || cardId}
            className="w-full h-auto object-contain"
            loading="eager"
            decoding="async"
          />
        </div>

        {/* Attack card overlay */}
        {hasAttack && (() => {
          const attackCard = tutorialCards[attackOverlay!.attackCardId];
          if (!attackCard) return null;
          return (
            <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 z-10 animate-in fade-in slide-in-from-top-2 duration-500">
              <div className="w-[40px] sm:w-[48px] rounded-md overflow-hidden shadow-lg shadow-destructive/30 ring-2 ring-destructive/60 rotate-6">
                <img
                  src={attackCard.image}
                  alt={attackCard.name}
                  className="w-full h-auto object-contain"
                  loading="eager"
                  decoding="async"
                />
              </div>
            </div>
          );
        })()}
      </div>
    );
  };

  const lineClass = 'w-px h-4 sm:h-6 bg-primary/40';

  return (
    <div className="flex flex-col items-center justify-center min-h-[420px] sm:min-h-[480px] py-6 gap-1">
      {internet && (
        <>
          {renderCard('internet', 'internet', 'md')}
          <div className={lineClass} />
        </>
      )}

      {switches.length > 0 && (
        <>
          {renderCard('switch', 'switch', 'md')}
          <div className={lineClass} />
        </>
      )}

      {cables.length > 0 && (
        <span className="text-[9px] font-orbitron text-muted-foreground/60 tracking-widest uppercase mb-1">cables</span>
      )}

      {cables.length > 0 && (
        <>
          <div className="flex items-start gap-3 sm:gap-5 relative">
            {cables.length > 1 && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px bg-primary/30" style={{ width: `${(cables.length - 1) * 80}%` }} />
            )}
            {cables.map((cableId, i) => (
              <div key={`cable-${i}`} className="flex flex-col items-center">
                {renderCard(cableId, `cable-${i}`, 'sm')}
                <span className="text-[9px] font-orbitron text-primary/60 mt-0.5">
                  {cableId === 'cable-2' ? '2/2' : cableId === 'cable-3' ? `${Math.min(computerCount, 3)}/3` : ''}
                </span>
              </div>
            ))}
          </div>
          <div className={lineClass} />
        </>
      )}

      {computerCount > 0 && computers.length > 0 && (
        <div className="flex items-start gap-2 sm:gap-3">
          {Array.from({ length: Math.min(computerCount, 4) }).map((_, i) => {
            const isAttackTarget = i === 0 && attackOverlay?.targetEquipment === 'computer';
            const shouldFade = isAttackTarget && fadeOutSet.has('computer');
            const card = tutorialCards['computer'];
            return (
              <div key={`comp-${i}`} className="flex flex-col items-center">
                {isAttackTarget
                  ? renderCard('computer', `comp-${i}`, 'sm')
                  : (
                    <div className="flex flex-col items-center transition-all duration-500">
                      <div className="w-[60px] sm:w-[72px] rounded-lg overflow-hidden">
                        <img src={card?.image} alt="Computer" className="w-full h-auto object-contain" loading="eager" decoding="async" />
                      </div>
                    </div>
                  )
                }
              </div>
            );
          })}
        </div>
      )}

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
