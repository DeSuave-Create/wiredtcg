import { useState, useEffect, useRef } from 'react';

interface GameMechanicsSectionProps {
  cardBackgroundImage?: string;
}

interface Card {
  name: string;
  bg: string;
  image: string | null;
  borderColor: string;
  type: 'equipment' | 'attack' | 'classification';
}

const GameMechanicsSection = ({ cardBackgroundImage }: GameMechanicsSectionProps) => {
  const [dealtCards, setDealtCards] = useState<Card[]>([]);
  const [showDeck, setShowDeck] = useState(true);
  const isDealingRef = useRef(false);
  const timeoutsRef = useRef<number[]>([]);

  const allCards: Card[] = [
    { name: 'Computer', bg: 'bg-green-50', image: '/lovable-uploads/equipment-computer.png', borderColor: 'border-green-500', type: 'equipment' },
    { name: 'Cabling', bg: 'bg-green-50', image: '/lovable-uploads/equipment-cabling.png', borderColor: 'border-green-500', type: 'equipment' },
    { name: 'Equipment 3', bg: 'bg-gray-100', image: null, borderColor: 'border-green-500', type: 'equipment' },
    { name: 'Equipment 4', bg: 'bg-gray-100', image: null, borderColor: 'border-green-500', type: 'equipment' },
    { name: 'Equipment 5', bg: 'bg-gray-100', image: null, borderColor: 'border-green-500', type: 'equipment' },
    { name: 'Hacked', bg: 'bg-red-50', image: '/lovable-uploads/attack-hacked.png', borderColor: 'border-red-500', type: 'attack' },
    { name: 'Attack 2', bg: 'bg-gray-100', image: null, borderColor: 'border-red-500', type: 'attack' },
    { name: 'Attack 3', bg: 'bg-gray-100', image: null, borderColor: 'border-red-500', type: 'attack' },
    { name: 'Attack 4', bg: 'bg-gray-100', image: null, borderColor: 'border-red-500', type: 'attack' },
    { name: 'Attack 5', bg: 'bg-gray-100', image: null, borderColor: 'border-red-500', type: 'attack' },
    { name: 'Facilities', bg: 'bg-blue-50', image: '/lovable-uploads/classification-facilities.png', borderColor: 'border-blue-500', type: 'classification' },
    { name: 'Field Tech', bg: 'bg-blue-50', image: '/lovable-uploads/classification-fieldtech.png', borderColor: 'border-blue-500', type: 'classification' },
    { name: 'Classification 3', bg: 'bg-gray-100', image: null, borderColor: 'border-blue-500', type: 'classification' },
    { name: 'Classification 4', bg: 'bg-gray-100', image: null, borderColor: 'border-blue-500', type: 'classification' },
    { name: 'Classification 5', bg: 'bg-gray-100', image: null, borderColor: 'border-blue-500', type: 'classification' },
  ];

  const dealCards = () => {
    // Prevent multiple simultaneous dealing cycles
    if (isDealingRef.current) return;
    isDealingRef.current = true;

    // Clear any existing timeouts
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    // Shuffle and pick 6 random cards
    const shuffled = [...allCards].sort(() => Math.random() - 0.5);
    const selectedCards = shuffled.slice(0, 6);

    // Reset state and hide deck
    setDealtCards([]);
    
    const hideTimeout = window.setTimeout(() => {
      setShowDeck(false);
    }, 100);
    timeoutsRef.current.push(hideTimeout);

    // Deal cards one by one with delay
    selectedCards.forEach((card, index) => {
      const timeout = window.setTimeout(() => {
        setDealtCards(prev => [...prev, card]);
      }, 200 + index * 600);
      timeoutsRef.current.push(timeout);
    });

    // Reset after 3 second display (200ms start + 5*600ms dealing + 600ms animation + 3000ms display)
    const resetTimeout = window.setTimeout(() => {
      setDealtCards([]);
      
      const showDeckTimeout = window.setTimeout(() => {
        setShowDeck(true);
        isDealingRef.current = false;
        
        // Restart the cycle after showing deck for 1 second
        const restartTimeout = window.setTimeout(() => {
          dealCards();
        }, 1000);
        timeoutsRef.current.push(restartTimeout);
      }, 100);
      timeoutsRef.current.push(showDeckTimeout);
    }, 6800);
    timeoutsRef.current.push(resetTimeout);
  };

  // Start dealing animation after 1 second
  useEffect(() => {
    const startDelay = window.setTimeout(() => {
      dealCards();
    }, 1000);

    return () => {
      // Cleanup all timeouts on unmount
      clearTimeout(startDelay);
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="flex justify-center items-center min-h-[500px] relative py-8">
      {/* Ghost logo background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <img 
          src="/wire-logo-official.png" 
          alt="WIRED Ghost Logo" 
          className="w-[480px] h-[480px] lg:w-[576px] lg:h-[576px] object-contain opacity-10"
        />
      </div>

      {/* Deck with logo */}
      {showDeck && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="relative w-48 h-64 lg:w-56 lg:h-80">
            <div className="absolute inset-0 bg-gray-100 border-4 border-primary rounded-xl shadow-2xl flex items-center justify-center animate-pulse-neon">
              <img 
                src="/wire-logo-official.png" 
                alt="WIRED Logo" 
                className="w-32 h-32 object-contain opacity-80"
              />
            </div>
          </div>
        </div>
      )}

      {/* Dealt cards fanning out with overlap */}
      <div className="flex justify-center items-center relative" style={{ width: '100%', maxWidth: '900px', height: '400px' }}>
        {dealtCards.map((card, index) => {
          const totalCards = 6;
          const centerIndex = (totalCards - 1) / 2;
          const offset = index - centerIndex;
          const rotation = offset * 10; // 10 degrees per card for fan effect
          const translateY = Math.abs(offset) * 15; // Slight rise for outer cards
          const translateX = offset * 55; // Increased horizontal spread for more spacing
          // Cards dealt later have higher z-index during animation
          const baseZIndex = 30 + index; // Each card gets higher z-index as it's dealt
          const hoverZIndex = 100; // Very high z-index on hover

          return (
            <div
              key={`${card.name}-${index}`}
              className="absolute left-1/2 top-1/2 group"
              style={{
                animation: 'dealCard 0.6s ease-out forwards',
                opacity: 0,
                zIndex: baseZIndex,
              }}
            >
              <div
                className={`w-48 h-64 lg:w-56 lg:h-80 ${card.image ? '' : card.bg} ${card.borderColor} border-4 shadow-2xl drop-shadow-lg overflow-hidden ${card.image ? '' : 'flex items-center justify-center'} transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-6 cursor-pointer`}
                style={{
                  transform: `translate(-50%, -50%) translateX(${translateX}px) translateY(${translateY}px) rotate(${rotation}deg)`,
                  transformOrigin: 'center bottom',
                  zIndex: 'inherit',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.parentElement!.style.zIndex = hoverZIndex.toString();
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.parentElement!.style.zIndex = baseZIndex.toString();
                }}
              >
                {card.image ? (
                  <img src={card.image} alt={card.name} className="w-full h-full object-cover" style={{ imageRendering: 'crisp-edges' }} />
                ) : (
                  <span className="text-sm text-muted-foreground text-center">{card.name}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GameMechanicsSection;
