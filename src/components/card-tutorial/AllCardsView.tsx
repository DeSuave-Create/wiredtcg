import { memo, useState, useMemo } from 'react';
import { tutorialCards, getCategoryTextClass, getCategoryBgClass, getCategoryBorderClass, type CardCategory } from '@/data/cardInteractions';
import { cn } from '@/lib/utils';
import { Filter } from 'lucide-react';

const categoryOrder: CardCategory[] = ['equipment', 'attack', 'resolution', 'classification'];

const categoryFilters: { label: string; value: CardCategory | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Equipment', value: 'equipment' },
  { label: 'Attack', value: 'attack' },
  { label: 'Resolution', value: 'resolution' },
  { label: 'Classification', value: 'classification' },
];

const AllCardsView = memo(() => {
  const [activeFilter, setActiveFilter] = useState<CardCategory | 'all'>('all');

  const cards = useMemo(() => {
    const all = Object.values(tutorialCards).filter(c => c.id !== 'internet');
    if (activeFilter !== 'all') {
      return all.filter(c => c.type === activeFilter);
    }
    // Sort by category order
    return all.sort((a, b) => categoryOrder.indexOf(a.type) - categoryOrder.indexOf(b.type));
  }, [activeFilter]);

  return (
    <div className="w-full">
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

      {/* Cards list */}
      <div className="space-y-3">
        {cards.map((card) => (
          <div
            key={card.id}
            className={cn(
              'flex items-start gap-4 sm:gap-6 p-4 sm:p-5 rounded-xl border bg-muted/5 transition-all duration-300 hover:bg-muted/10',
              getCategoryBorderClass(card.type),
            )}
          >
            {/* Card image */}
            <div className="flex-shrink-0 w-[80px] sm:w-[110px] rounded-lg overflow-hidden">
              <img
                src={card.image}
                alt={card.name}
                className="w-full h-auto object-contain"
                loading="lazy"
                decoding="async"
              />
            </div>

            {/* Card info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <h4 className={cn('text-sm sm:text-base font-bold font-orbitron', getCategoryTextClass(card.type))}>
                  {card.name}
                </h4>
                <span className={cn(
                  'px-2 py-0.5 rounded text-[9px] font-orbitron font-bold uppercase tracking-widest',
                  getCategoryBgClass(card.type),
                  getCategoryTextClass(card.type),
                )}>
                  {card.type}
                </span>
              </div>

              <p className="text-base text-foreground/90 leading-relaxed mb-3">
                {card.description}
              </p>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {card.rulesExplanation}
              </p>

              {card.interactionNotes && (
                <p className="mt-2 text-sm text-muted-foreground/80 italic">
                  💡 {card.interactionNotes}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

AllCardsView.displayName = 'AllCardsView';

export default AllCardsView;
