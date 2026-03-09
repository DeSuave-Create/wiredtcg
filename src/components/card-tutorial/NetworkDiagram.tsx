import { memo, useState, useEffect, useRef } from 'react';
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
  const [isVisible, setIsVisible] = useState(true);
  const prevKeyRef = useRef(cardIds.join(','));

  // Smooth crossfade when the card composition changes
  useEffect(() => {
    const newKey = cardIds.join(',');
    if (newKey !== prevKeyRef.current) {
      setIsVisible(false);
      const timer = setTimeout(() => {
        prevKeyRef.current = newKey;
        setIsVisible(true);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [cardIds]);

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
          'flex flex-col items-center relative',
          isFading && !hasAttack && 'opacity-20 scale-90',
          isHighlighted && !hasAttack && 'scale-105',
        )}
        style={{
          transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div
          className={cn(
            'rounded-lg overflow-hidden relative',
            w,
            isHighlighted && !hasAttack && 'ring-2 ring-primary/50 shadow-lg shadow-primary/20',
            isFading && hasAttack && 'opacity-20 scale-90',
          )}
          style={{
            transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.6s ease-out',
          }}
        >
          <img
            src={imgSrc}
            alt={name || cardId}
            className="w-full h-auto object-contain"
            loading="eager"
            decoding="async"
          />
        </div>

        {/* Attack card overlay — smooth scale+fade entrance */}
        {hasAttack && (() => {
          const attackCard = tutorialCards[attackOverlay!.attackCardId];
          if (!attackCard) return null;
          return (
            <div
              className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 z-10"
              style={{
                animation: 'attack-overlay-in 0.7s cubic-bezier(0.4, 0, 0.2, 1) both',
              }}
            >
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
    <>
      <div
        className="flex flex-col items-center justify-center min-h-[420px] sm:min-h-[480px] py-6 gap-1"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'scale(1)' : 'scale(0.97)',
          transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
        }}
      >
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
                // Only fade the attacked computer (index 0), not all computers
                const isFading = isAttackTarget ? fadeOutSet.has('computer') : (fadeOutSet.has('computer') && !attackOverlay?.targetEquipment);
                const card = tutorialCards['computer'];
              return (
                <div key={`comp-${i}`} className="flex flex-col items-center">
                  {isAttackTarget
                    ? renderCard('computer', `comp-${i}`, 'sm')
                    : (
                      <div
                        className={cn('flex flex-col items-center', isFading && 'opacity-20 scale-90')}
                        style={{
                          transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      >
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
          <div
            className={cn(
              'mt-3 px-4 py-1.5 rounded-full text-[10px] sm:text-[11px] font-orbitron font-bold tracking-widest',
              effectLabel.includes('MINING') || effectLabel.includes('SCORE') || effectLabel.includes('RACE')
                ? 'bg-primary/20 text-primary'
                : effectLabel.includes('BITCOIN')
                ? 'bg-accent-bitcoin/20 text-accent-bitcoin'
                : effectLabel.includes('HACKED') || effectLabel.includes('POWER') || effectLabel.includes('NEW HIRE') || effectLabel.includes('DISABLED')
                  ? 'bg-destructive/20 text-destructive'
                  : 'bg-muted/20 text-muted-foreground',
            )}
            style={{
              animation: 'smooth-label-in 0.5s cubic-bezier(0.4, 0, 0.2, 1) both',
            }}
          >
            {effectLabel}
          </div>
        )}
      </div>

      <style>{`
        @keyframes attack-overlay-in {
          0% { opacity: 0; transform: scale(0.6) translateY(-8px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes smooth-label-in {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
});

NetworkDiagram.displayName = 'NetworkDiagram';

export default NetworkDiagram;
