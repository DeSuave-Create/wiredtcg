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

  // Build the complete deck with proper quantities (143 cards total)
  const buildDeck = (): Card[] => {
    const deck: Card[] = [];
    
    // Equipment cards (80 total)
    // Computers: 40 cards
    for (let i = 0; i < 40; i++) {
      deck.push({ name: 'Computer', bg: 'bg-green-50', image: '/lovable-uploads/equipment-computer-new.png', borderColor: 'border-green-500', type: 'equipment' });
    }
    // 2-Cables: 20 cards
    for (let i = 0; i < 20; i++) {
      deck.push({ name: 'Cabling (2x)', bg: 'bg-green-50', image: '/lovable-uploads/equipment-2cable.png', borderColor: 'border-green-500', type: 'equipment' });
    }
    // 3-Cables: 10 cards
    for (let i = 0; i < 10; i++) {
      deck.push({ name: 'Cabling (3x)', bg: 'bg-green-50', image: '/lovable-uploads/equipment-3cable.png', borderColor: 'border-green-500', type: 'equipment' });
    }
    // Switches: 10 cards
    for (let i = 0; i < 10; i++) {
      deck.push({ name: 'Switch', bg: 'bg-green-50', image: '/lovable-uploads/equipment-switch.png', borderColor: 'border-green-500', type: 'equipment' });
    }
    
    // Audit cards (4 total)
    for (let i = 0; i < 4; i++) {
      deck.push({ name: 'Audit', bg: 'bg-red-50', image: '/lovable-uploads/attack-audit-v2.png', borderColor: 'border-red-500', type: 'attack' });
    }
    
    // Classification cards (13 total)
    for (let i = 0; i < 2; i++) {
      deck.push({ name: 'Facilities', bg: 'bg-blue-50', image: '/lovable-uploads/classification-facilities-new.png', borderColor: 'border-blue-500', type: 'classification' });
    }
    for (let i = 0; i < 2; i++) {
      deck.push({ name: 'Field Tech', bg: 'bg-blue-50', image: '/lovable-uploads/classification-fieldtech-new.png', borderColor: 'border-blue-500', type: 'classification' });
    }
    for (let i = 0; i < 2; i++) {
      deck.push({ name: 'Supervisor', bg: 'bg-blue-50', image: '/lovable-uploads/classification-supervisor.png', borderColor: 'border-blue-500', type: 'classification' });
    }
    for (let i = 0; i < 2; i++) {
      deck.push({ name: 'Security Specialist', bg: 'bg-blue-50', image: '/lovable-uploads/classification-security.png', borderColor: 'border-blue-500', type: 'classification' });
    }
    for (let i = 0; i < 4; i++) {
      deck.push({ name: 'Head Hunter', bg: 'bg-blue-50', image: '/lovable-uploads/classification-headhunter.png', borderColor: 'border-blue-500', type: 'classification' });
    }
    deck.push({ name: 'Seal the Deal', bg: 'bg-blue-50', image: '/lovable-uploads/classification-sealthedeal.png', borderColor: 'border-blue-500', type: 'classification' });
    
    // Remaining 46 cards split between attack and resolution
    // Attack cards: 23 (Hacked, New Hire, Power Outage split evenly)
    for (let i = 0; i < 8; i++) {
      deck.push({ name: 'Hacked', bg: 'bg-red-50', image: '/lovable-uploads/attack-hacked-v2.png', borderColor: 'border-red-500', type: 'attack' });
    }
    for (let i = 0; i < 8; i++) {
      deck.push({ name: 'New Hire', bg: 'bg-red-50', image: '/lovable-uploads/attack-newhire-v2.png', borderColor: 'border-red-500', type: 'attack' });
    }
    for (let i = 0; i < 7; i++) {
      deck.push({ name: 'Power Outage', bg: 'bg-red-50', image: '/lovable-uploads/attack-poweroutage-v2.png', borderColor: 'border-red-500', type: 'attack' });
    }
    
    // Resolution/buff cards: 23 (split among 4 types)
    for (let i = 0; i < 6; i++) {
      deck.push({ name: 'Trained', bg: 'bg-red-50', image: '/lovable-uploads/resolution-trained-v2.png', borderColor: 'border-green-500', type: 'classification' });
    }
    for (let i = 0; i < 6; i++) {
      deck.push({ name: 'Helpdesk', bg: 'bg-red-50', image: '/lovable-uploads/resolution-helpdesk-v2.png', borderColor: 'border-green-500', type: 'classification' });
    }
    for (let i = 0; i < 6; i++) {
      deck.push({ name: 'Powered', bg: 'bg-red-50', image: '/lovable-uploads/resolution-powered-v2.png', borderColor: 'border-green-500', type: 'classification' });
    }
    for (let i = 0; i < 5; i++) {
      deck.push({ name: 'Secured', bg: 'bg-red-50', image: '/lovable-uploads/resolution-secured-v2.png', borderColor: 'border-green-500', type: 'classification' });
    }
    
    return deck;
  };

  const allCards = buildDeck();

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

  // Preload images
  useEffect(() => {
    const imagesToPreload = [
      '/lovable-uploads/equipment-computer-new.png',
      '/lovable-uploads/equipment-3cable.png',
      '/lovable-uploads/equipment-2cable.png',
      '/lovable-uploads/equipment-switch.png',
      '/lovable-uploads/attack-hacked-v2.png',
      '/lovable-uploads/attack-newhire-v2.png',
      '/lovable-uploads/attack-poweroutage-v2.png',
      '/lovable-uploads/attack-audit-v2.png',
      '/lovable-uploads/classification-facilities-new.png',
      '/lovable-uploads/classification-fieldtech-new.png',
      '/lovable-uploads/classification-supervisor.png',
      '/lovable-uploads/classification-security.png',
      '/lovable-uploads/classification-headhunter.png',
      '/lovable-uploads/classification-sealthedeal.png',
      '/lovable-uploads/resolution-trained-v2.png',
      '/lovable-uploads/resolution-helpdesk-v2.png',
      '/lovable-uploads/resolution-powered-v2.png',
      '/lovable-uploads/resolution-secured-v2.png',
      '/lovable-uploads/card-back.png',
      '/wire-logo-official.png'
    ];

    imagesToPreload.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

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
    <div className="flex justify-center items-center min-h-[300px] sm:min-h-[400px] lg:min-h-[500px] relative py-4 sm:py-6 lg:py-8">
      {/* Ghost logo background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <img 
          src="/wire-logo-official.png" 
          alt="WIRED Ghost Logo" 
          className="w-48 h-48 sm:w-80 sm:h-80 lg:w-[480px] lg:h-[480px] object-contain opacity-10"
          loading="lazy"
        />
      </div>

      {/* Deck with card back */}
      {showDeck && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="w-28 h-40 sm:w-36 sm:h-52 lg:w-44 lg:h-64 xl:w-52 xl:h-80 shadow-2xl drop-shadow-lg overflow-hidden">
            <img 
              src="/lovable-uploads/card-back.png" 
              alt="WIRED Card Back" 
              className="w-full h-full object-contain animate-pulse-neon" 
              style={{ imageRendering: 'crisp-edges' }}
              loading="lazy"
            />
          </div>
        </div>
      )}

      {/* Dealt cards fanning out with overlap */}
      <div className="flex justify-center items-center relative" style={{ width: '100%', maxWidth: '900px', height: '350px' }}>
        {dealtCards.map((card, index) => {
          const totalCards = 6;
          const centerIndex = (totalCards - 1) / 2;
          const offset = index - centerIndex;
          const rotation = offset * 8; // Reduced rotation for mobile
          const translateY = Math.abs(offset) * 12; // Slight rise for outer cards
          // Responsive horizontal spread
          const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
          const isTablet = typeof window !== 'undefined' && window.innerWidth >= 640 && window.innerWidth < 1024;
          const translateX = isMobile ? offset * 35 : isTablet ? offset * 50 : offset * 75;
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
                className={`w-28 h-40 sm:w-36 sm:h-52 lg:w-44 lg:h-64 xl:w-52 xl:h-80 ${card.image ? '' : `${card.bg} ${card.borderColor} border-4 rounded-xl`} shadow-2xl drop-shadow-lg overflow-hidden ${card.image ? '' : 'flex items-center justify-center'} transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-6 cursor-pointer`}
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
                  <img 
                    src={card.image} 
                    alt={card.name} 
                    className="w-full h-full object-contain" 
                    style={{ imageRendering: 'crisp-edges' }}
                    loading="lazy"
                  />
                ) : (
                  <span className="text-xs sm:text-sm text-muted-foreground text-center">{card.name}</span>
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
