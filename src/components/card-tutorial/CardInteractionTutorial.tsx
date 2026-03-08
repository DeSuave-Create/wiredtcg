import { useState, useEffect, useCallback, useRef, memo, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getEnabledInteractions,
  tutorialCards,
  getCategoryTextClass,
  getCategoryBgClass,
  getCategoryBorderClass,
  type CardCategory,
} from '@/data/cardInteractions';
import CardStack from './CardStack';
import NetworkDiagram from './NetworkDiagram';

const AUTOPLAY_INTERVAL = 7000;

/** Highlight game terms in text with appropriate colors */
function highlightTerms(text: string) {
  const pattern = /(Bitcoin|Power Outage|New Hire|Hacked|Secured|Powered|Trained|Helpdesk|Security Specialist|Facilities|Supervisor|Field Tech|Head Hunter|Seal the Deal|Audit)/gi;
  const parts = text.split(pattern);
  if (parts.length === 1) return text;
  
  const attackTerms = /^(hacked|power outage|new hire|audit)$/i;
  const resolutionTerms = /^(secured|powered|trained|helpdesk)$/i;
  const classificationTerms = /^(security specialist|facilities|supervisor|field tech|head hunter|seal the deal)$/i;
  
  return parts.map((part, i) => {
    if (/^bitcoin$/i.test(part)) return <span key={i} className="text-accent-bitcoin font-semibold">{part}</span>;
    if (attackTerms.test(part)) return <span key={i} className="text-destructive font-semibold">{part}</span>;
    if (resolutionTerms.test(part)) return <span key={i} className="text-yellow-400 font-semibold">{part}</span>;
    if (classificationTerms.test(part)) return <span key={i} className="text-blue-400 font-semibold">{part}</span>;
    return part;
  });
}

const highlightBitcoin = highlightTerms;

const categoryFilters: { label: string; value: CardCategory | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Equipment', value: 'equipment' },
  { label: 'Attack', value: 'attack' },
  { label: 'Resolution', value: 'resolution' },
  { label: 'Classification', value: 'classification' },
];

const CardInteractionTutorial = memo(() => {
  const [activeFilter, setActiveFilter] = useState<CardCategory | 'all'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [textVisible, setTextVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const progressRef = useRef<HTMLDivElement>(null);
  const prevStepKeyRef = useRef('0-0');

  const allInteractions = useMemo(() => getEnabledInteractions(), []);
  const interactions = useMemo(
    () => activeFilter === 'all'
      ? allInteractions
      : allInteractions.filter(i => tutorialCards[i.featuredCardId]?.type === activeFilter),
    [allInteractions, activeFilter],
  );

  const interaction = interactions[currentIndex];
  const featuredCard = interaction ? tutorialCards[interaction.featuredCardId] : null;
  const step = interaction?.steps[currentStep];

  useEffect(() => {
    setCurrentIndex(0);
    setCurrentStep(0);
  }, [activeFilter]);

  // Smooth text panel transition on step/index change
  useEffect(() => {
    const newKey = `${currentIndex}-${currentStep}`;
    if (newKey !== prevStepKeyRef.current) {
      setTextVisible(false);
      const timer = setTimeout(() => {
        prevStepKeyRef.current = newKey;
        setTextVisible(true);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, currentStep]);

  const advanceStep = useCallback(() => {
    if (!interaction) return;
    if (currentStep < interaction.steps.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      setCurrentIndex(i => (i + 1) % interactions.length);
      setCurrentStep(0);
    }
  }, [interaction, currentStep, interactions.length]);

  // Autoplay
  useEffect(() => {
    if (isPlaying && !isHovered && interaction) {
      timerRef.current = setTimeout(advanceStep, AUTOPLAY_INTERVAL);
    }
    return () => clearTimeout(timerRef.current);
  }, [isPlaying, isHovered, advanceStep, interaction, currentStep]);

  // Restart progress bar animation
  useEffect(() => {
    const el = progressRef.current;
    if (!el) return;
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = `progress-fill ${AUTOPLAY_INTERVAL}ms linear`;
  }, [currentStep, currentIndex, isPlaying, isHovered]);

  const goToInteraction = useCallback((idx: number) => {
    setCurrentIndex(idx);
    setCurrentStep(0);
  }, []);

  const goPrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(s => s - 1);
    } else {
      const prevIdx = (currentIndex - 1 + interactions.length) % interactions.length;
      setCurrentIndex(prevIdx);
      setCurrentStep(interactions[prevIdx]?.steps.length - 1 || 0);
    }
  }, [currentStep, currentIndex, interactions]);

  const onMouseEnter = useCallback(() => setIsHovered(true), []);
  const onMouseLeave = useCallback(() => setIsHovered(false), []);
  const togglePlay = useCallback(() => setIsPlaying(p => !p), []);

  const relatedCards = useMemo(() => {
    if (!featuredCard) return [];
    return (featuredCard.relatedCards || [])
      .map(id => tutorialCards[id])
      .filter(Boolean)
      .slice(0, 6);
  }, [featuredCard]);

  if (!interaction || !featuredCard || !step) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No interactions available for this filter.
      </div>
    );
  }

  return (
    <div className="w-full" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {/* Filter bar */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        <Filter className="h-4 w-4 text-muted-foreground mr-1" />
        {categoryFilters.map(f => {
          const activeClasses = f.value === 'all'
            ? 'bg-primary/20 border-primary text-primary'
            : f.value === 'equipment'
              ? 'bg-primary/20 border-primary text-primary'
              : f.value === 'attack'
                ? 'bg-destructive/20 border-destructive text-destructive'
                : f.value === 'resolution'
                  ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                  : 'bg-blue-500/20 border-blue-500 text-blue-400';
          return (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium font-orbitron tracking-wide border transition-colors duration-200',
                activeFilter === f.value
                  ? activeClasses
                  : 'border-muted bg-muted/30 text-muted-foreground hover:border-primary/50 hover:text-foreground',
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Main tutorial card */}
      <div className="relative rounded-2xl border border-muted/50 bg-background/80 overflow-hidden">
        {/* Header */}
        <div className="flex flex-col items-center gap-2 px-4 sm:px-6 py-4 sm:py-5 border-b border-muted/30 bg-muted/10">
          <div className="flex items-center gap-3">
            <span className={cn(
              'px-2.5 py-0.5 rounded text-[10px] font-orbitron font-bold uppercase tracking-widest transition-all duration-500',
              getCategoryBgClass(featuredCard.type),
              getCategoryTextClass(featuredCard.type),
            )}>
              {featuredCard.type}
            </span>
            <button
              onClick={togglePlay}
              className="p-1.5 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </button>
          </div>
          <h3 className="text-lg sm:text-2xl font-bold font-orbitron text-foreground text-center transition-opacity duration-500">
            {highlightBitcoin(interaction.title)}
          </h3>
        </div>

        {/* Content area */}
        <div className="p-4 sm:p-6 flex flex-col lg:flex-row gap-6 min-h-[480px] sm:min-h-[540px]">
          {/* Card Stack / Network Diagram */}
          <div className="flex-shrink-0 flex items-center justify-center lg:w-2/5">
            {step.layout === 'network' ? (
              <NetworkDiagram
                cardIds={step.stackOrder}
                highlight={step.highlight}
                effectLabel={step.effectLabel}
                fadeOut={step.fadeOut}
                attackOverlay={step.attackOverlay}
              />
            ) : (
              <CardStack
                stackOrder={step.stackOrder}
                highlight={step.highlight}
                effectLabel={step.effectLabel}
                fadeOut={step.fadeOut}
              />
            )}
          </div>

          {/* Explanation panel with smooth fade */}
          <div
            className="flex-1 flex flex-col justify-center min-w-0 lg:w-3/5"
            style={{
              opacity: textVisible ? 1 : 0,
              transform: textVisible ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-3">
              {interaction.steps.map((_, sIdx) => (
                <button
                  key={sIdx}
                  onClick={() => setCurrentStep(sIdx)}
                  className={cn(
                    'h-1.5 rounded-full transition-[width,background-color] duration-300',
                    sIdx === currentStep
                      ? 'w-8 bg-primary'
                      : sIdx < currentStep
                        ? 'w-4 bg-primary/40'
                        : 'w-4 bg-muted/50',
                  )}
                />
              ))}
              <span className="ml-2 text-[10px] text-muted-foreground font-orbitron">
                {currentStep + 1}/{interaction.steps.length}
              </span>
            </div>

            <h4 className="text-base sm:text-lg font-bold font-orbitron text-primary mb-2">
              {highlightBitcoin(step.label)}
            </h4>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
              {highlightBitcoin(step.description)}
            </p>

            {currentStep === 0 && (
              <div className={cn(
                'rounded-xl border p-3 sm:p-4 mb-4',
                getCategoryBorderClass(featuredCard.type),
                'bg-muted/10',
              )}>
                <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
                  {highlightBitcoin(featuredCard.rulesExplanation)}
                </p>
                {featuredCard.interactionNotes && (
                  <p className="mt-2 text-xs text-muted-foreground italic">
                    💡 {highlightBitcoin(featuredCard.interactionNotes)}
                  </p>
                )}
              </div>
            )}

            {/* Step-specific related cards */}
            {step.showRelatedCards && step.showRelatedCards.length > 0 && (() => {
              const stepRelated = step.showRelatedCards!.map(id => tutorialCards[id]).filter(Boolean);
              return stepRelated.length > 0 ? (
                <div className="mb-4">
                  <p className="text-[10px] font-orbitron text-muted-foreground uppercase tracking-widest mb-3">
                    Related Cards
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {stepRelated.map(rc => (
                      <div key={rc.id} className="flex flex-col items-center gap-1.5">
                        <div className="w-[80px] sm:w-[100px] rounded-lg overflow-hidden">
                          <img src={rc.image} alt={rc.name} className="w-full h-auto object-contain" loading="lazy" decoding="async" />
                        </div>
                        <span className={cn('text-[10px] sm:text-xs font-medium font-orbitron', getCategoryTextClass(rc.type))}>
                          {rc.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}

            {/* Last-step related cards from featured card */}
            {currentStep === interaction.steps.length - 1 && !step.showRelatedCards && relatedCards.length > 0 && (
              <div>
                <p className="text-[10px] font-orbitron text-muted-foreground uppercase tracking-widest mb-3">
                  Related Cards
                </p>
                <div className="flex flex-wrap gap-3">
                  {relatedCards.map(rc => (
                    <div
                      key={rc.id}
                      className="flex flex-col items-center gap-1.5"
                    >
                      <div className="w-[80px] sm:w-[100px] rounded-lg overflow-hidden">
                        <img src={rc.image} alt={rc.name} className="w-full h-auto object-contain" loading="lazy" decoding="async" />
                      </div>
                      <span className={cn('text-[10px] sm:text-xs font-medium font-orbitron', getCategoryTextClass(rc.type))}>
                        {rc.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t border-muted/30 bg-muted/5">
          <button
            onClick={goPrev}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium min-h-[44px]"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>

          <div className="flex items-center gap-1.5 overflow-x-auto max-w-[60%] py-1">
            {interactions.map((inter, idx) => (
              <button
                key={inter.id}
                onClick={() => goToInteraction(idx)}
                className={cn(
                  'rounded-full flex-shrink-0 transition-[width,height,background-color] duration-200',
                  idx === currentIndex
                    ? 'w-3 h-3 bg-primary'
                    : 'w-2 h-2 bg-muted/50 hover:bg-muted',
                )}
                title={inter.title}
              />
            ))}
          </div>

          <button
            onClick={advanceStep}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium min-h-[44px]"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Autoplay progress bar */}
        {isPlaying && !isHovered && (
          <div className="h-0.5 bg-muted/20">
            <div
              ref={progressRef}
              className="h-full bg-primary/60"
              style={{ width: '100%' }}
            />
          </div>
        )}
      </div>

      <style>{`
        @keyframes progress-fill {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
});

CardInteractionTutorial.displayName = 'CardInteractionTutorial';

export default CardInteractionTutorial;
