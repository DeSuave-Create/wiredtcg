import { useState, useEffect } from 'react';

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
  const [isDealing, setIsDealing] = useState(false);
  const [dealtCards, setDealtCards] = useState<Card[]>([]);
  const [showDeck, setShowDeck] = useState(true);

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

  // Start dealing animation after 1 second
  useEffect(() => {
    const startDelay = setTimeout(() => {
      setIsDealing(true);
      dealCards();
    }, 1000);

    return () => clearTimeout(startDelay);
  }, []);

  const dealCards = () => {
    // Shuffle and pick 6 random cards
    const shuffled = [...allCards].sort(() => Math.random() - 0.5);
    const selectedCards = shuffled.slice(0, 6);

    // Deal cards one by one with delay
    selectedCards.forEach((card, index) => {
      setTimeout(() => {
        setDealtCards(prev => [...prev, card]);
        if (index === 5) {
          // Hide deck after last card is dealt
          setTimeout(() => setShowDeck(false), 300);
        }
      }, index * 400);
    });

    // Reset and restart after all cards are shown for a while
    setTimeout(() => {
      setDealtCards([]);
      setShowDeck(true);
      setIsDealing(false);
      // Restart the cycle
      setTimeout(() => {
        setIsDealing(true);
        dealCards();
      }, 1000);
    }, 8000);
  };

  return (
    <div className="flex justify-center items-center min-h-[400px] relative">
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

      {/* Dealt cards fanning out */}
      <div className="flex justify-center items-end gap-2">
        {dealtCards.map((card, index) => {
          const totalCards = 6;
          const centerIndex = (totalCards - 1) / 2;
          const offset = index - centerIndex;
          const rotation = offset * 8; // 8 degrees per card offset
          const translateY = Math.abs(offset) * 20; // Cards at edges rise up
          const translateX = offset * 30; // Spread cards horizontally

          return (
            <div
              key={`${card.name}-${index}`}
              className="relative"
              style={{
                animation: 'dealCard 0.6s ease-out forwards',
                animationDelay: `${index * 0.4}s`,
                opacity: 0,
              }}
            >
              <div
                className={`w-32 h-44 lg:w-40 lg:h-56 ${card.bg} ${card.borderColor} border-4 rounded-xl shadow-2xl drop-shadow-lg overflow-hidden ${card.image ? 'p-2' : 'flex items-center justify-center'} transition-all duration-300 hover:scale-110 hover:-translate-y-4 hover:z-50 cursor-pointer`}
                style={{
                  transform: `rotate(${rotation}deg) translateY(${translateY}px) translateX(${translateX}px)`,
                  transformOrigin: 'bottom center',
                }}
              >
                {card.image ? (
                  <img src={card.image} alt={card.name} className="w-full h-full object-contain" style={{ imageRendering: 'crisp-edges' }} />
                ) : (
                  <span className="text-xs text-muted-foreground text-center">{card.name}</span>
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
