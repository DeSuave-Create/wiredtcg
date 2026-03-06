import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getEnabledInteractions,
  tutorialCards,
  getCategoryTextClass,
  getCategoryBgClass,
  getCategoryBorderClass,
  type CardInteraction,
  type CardCategory,
} from '@/data/cardInteractions';
import CardStack from './CardStack';

const AUTOPLAY_INTERVAL = 7000;

const categoryFilters: { label: string; value: CardCategory | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Equipment', value: 'equipment' },
  { label: 'Attack', value: 'attack' },
  { label: 'Resolution', value: 'resolution' },
  { label: 'Classification', value: 'classification' },
];

const CardInteractionTutorial = () => {
  const [activeFilter, setActiveFilter] = useState<CardCategory | 'all'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [stepAnimKey, setStepAnimKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const allInteractions = getEnabledInteractions();
  const interactions = activeFilter === 'all'
    ? allInteractions
    : allInteractions.filter(i => tutorialCards[i.featuredCardId]?.type === activeFilter);

  const interaction = interactions[currentIndex];
  const featuredCard = interaction ? tutorialCards[interaction.featuredCardId] : null;
  const step = interaction?.steps[currentStep];

  // Reset index when filter changes
  useEffect(() => {
    setCurrentIndex(0);
    setCurrentStep(0);
  }, [activeFilter]);

  const advanceStep = useCallback(() => {
    if (!interaction) return;
    if (currentStep < interaction.steps.length - 1) {
      setCurrentStep(s => s + 1);
      setStepAnimKey(k => k + 1);
    } else {
      // Move to next interaction
      setCurrentIndex(i => (i + 1) % interactions.length);
      setCurrentStep(0);
      setStepAnimKey(k => k + 1);
    }
  }, [interaction, currentStep, interactions.length]);

  // Autoplay timer
  useEffect(() => {
    if (isPlaying && !isHovered && interaction) {
      timerRef.current = setTimeout(advanceStep, AUTOPLAY_INTERVAL);
    }
    return () => clearTimeout(timerRef.current);
  }, [isPlaying, isHovered, advanceStep, interaction, currentStep]);

  const goToInteraction = (idx: number) => {
    setCurrentIndex(idx);
    setCurrentStep(0);
    setStepAnimKey(k => k + 1);
  };

  const goPrev = () => {
    if (currentStep > 0) {
      setCurrentStep(s => s - 1);
    } else {
      const prevIdx = (currentIndex - 1 + interactions.length) % interactions.length;
      setCurrentIndex(prevIdx);
      setCurrentStep(interactions[prevIdx]?.steps.length - 1 || 0);
    }
    setStepAnimKey(k => k + 1);
  };

  const goNext = () => {
    advanceStep();
  };

  if (!interaction || !featuredCard || !step) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No interactions available for this filter.
      </div>
    );
  }

  const complexityBadge = {
    simple: 'bg-primary/20 text-primary',
    medium: 'bg-yellow-500/20 text-yellow-400',
    complex: 'bg-destructive/20 text-destructive',
  };

  // Related cards for the current interaction's featured card
  const relatedCardIds = featuredCard.relatedCards || [];
  const relatedCards = relatedCardIds
    .map(id => tutorialCards[id])
    .filter(Boolean)
    .slice(0, 6);

  return (
    <div
      className="w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Filter bar */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        <Filter className="h-4 w-4 text-muted-foreground mr-1" />
        {categoryFilters.map(f => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium font-orbitron tracking-wide transition-all duration-300 border',
              activeFilter === f.value
                ? 'bg-primary/20 border-primary text-primary shadow-[0_0_12px_rgba(var(--primary),0.2)]'
                : 'border-muted bg-muted/30 text-muted-foreground hover:border-primary/50 hover:text-foreground',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Main tutorial card */}
      <div className="relative rounded-2xl border border-muted/50 bg-background/60 backdrop-blur-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-muted/30 bg-muted/10">
          <div className="flex items-center gap-3">
            <span className={cn(
              'px-2 py-0.5 rounded text-[10px] font-orbitron font-bold uppercase tracking-widest',
              getCategoryBgClass(featuredCard.type),
              getCategoryTextClass(featuredCard.type),
            )}>
              {featuredCard.type}
            </span>
            <h3 className="text-sm sm:text-base font-bold font-orbitron text-foreground">
              {interaction.title}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              'px-2 py-0.5 rounded text-[10px] font-medium',
              complexityBadge[interaction.complexity],
            )}>
              {interaction.complexity}
            </span>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Content area — adaptive layout */}
        <div className={cn(
          'p-4 sm:p-6',
          interaction.complexity === 'simple'
            ? 'flex flex-col md:flex-row items-center gap-6'
            : 'flex flex-col lg:flex-row gap-6',
        )}>
          {/* Card Stack Visualization */}
          <div className={cn(
            'flex-shrink-0 flex items-center justify-center',
            interaction.complexity === 'simple' ? 'md:w-1/3' : 'lg:w-2/5',
          )}>
            <CardStack
              key={`${interaction.id}-${currentStep}-${stepAnimKey}`}
              stackOrder={step.stackOrder}
              highlight={step.highlight}
              effectLabel={step.effectLabel}
              fadeOut={step.fadeOut}
              animateIn
            />
          </div>

          {/* Explanation panel */}
          <div className={cn(
            'flex-1 flex flex-col justify-center min-w-0',
            interaction.complexity === 'simple' ? 'md:w-2/3' : 'lg:w-3/5',
          )}>
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-3">
              {interaction.steps.map((_, sIdx) => (
                <button
                  key={sIdx}
                  onClick={() => { setCurrentStep(sIdx); setStepAnimKey(k => k + 1); }}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300',
                    sIdx === currentStep
                      ? 'w-8 bg-primary shadow-[0_0_8px_rgba(var(--primary),0.4)]'
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

            {/* Step label */}
            <h4 className="text-base sm:text-lg font-bold font-orbitron text-primary mb-2 animate-fade-in">
              {step.label}
            </h4>

            {/* Step description */}
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4 animate-fade-in">
              {step.description}
            </p>

            {/* Card rules explanation (show on first step) */}
            {currentStep === 0 && (
              <div className={cn(
                'rounded-xl border p-3 sm:p-4 mb-4 animate-fade-in',
                getCategoryBorderClass(featuredCard.type),
                'bg-muted/10',
              )}>
                <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
                  {featuredCard.rulesExplanation}
                </p>
                {featuredCard.interactionNotes && (
                  <p className="mt-2 text-xs text-muted-foreground italic">
                    💡 {featuredCard.interactionNotes}
                  </p>
                )}
              </div>
            )}

            {/* Related cards (show on last step) */}
            {currentStep === interaction.steps.length - 1 && relatedCards.length > 0 && (
              <div className="animate-fade-in">
                <p className="text-[10px] font-orbitron text-muted-foreground uppercase tracking-widest mb-2">
                  Related Cards
                </p>
                <div className="flex flex-wrap gap-2">
                  {relatedCards.map(rc => (
                    <div
                      key={rc.id}
                      className={cn(
                        'flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs',
                        getCategoryBorderClass(rc.type),
                        'bg-muted/20',
                      )}
                    >
                      <img src={rc.image} alt={rc.name} className="w-6 h-8 object-contain rounded" />
                      <span className={cn('font-medium', getCategoryTextClass(rc.type))}>
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
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>

          {/* Interaction dots */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-[60%] py-1">
            {interactions.map((inter, idx) => {
              const fc = tutorialCards[inter.featuredCardId];
              return (
                <button
                  key={inter.id}
                  onClick={() => goToInteraction(idx)}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all duration-300 flex-shrink-0',
                    idx === currentIndex
                      ? 'w-3 h-3 bg-primary shadow-[0_0_8px_rgba(var(--primary),0.4)]'
                      : 'bg-muted/50 hover:bg-muted',
                  )}
                  title={inter.title}
                />
              );
            })}
          </div>

          <button
            onClick={goNext}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Autoplay progress bar */}
        {isPlaying && !isHovered && (
          <div className="h-0.5 bg-muted/20">
            <div
              className="h-full bg-primary/60 transition-none"
              style={{
                animation: `progress-fill ${AUTOPLAY_INTERVAL}ms linear`,
                width: '100%',
              }}
            />
          </div>
        )}
      </div>

      {/* CSS for progress animation */}
      <style>{`
        @keyframes progress-fill {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default CardInteractionTutorial;
