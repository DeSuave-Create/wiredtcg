import { useState, useEffect } from 'react';

interface GameMechanicsSectionProps {
  cardBackgroundImage?: string;
}

const GameMechanicsSection = ({ cardBackgroundImage }: GameMechanicsSectionProps) => {
  const [equipmentIndex, setEquipmentIndex] = useState(0);
  const [attackIndex, setAttackIndex] = useState(0);
  const [classificationIndex, setClassificationIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [cycleCount, setCycleCount] = useState({ equipment: 0, attack: 0, classification: 0 });

  const equipmentCards = [
    { name: 'Computer', bg: 'bg-green-50', image: '/lovable-uploads/equipment-computer.png' },
    { name: 'Cabling', bg: 'bg-green-50', image: '/lovable-uploads/equipment-cabling.png' },
    { name: 'Equipment 3', bg: 'bg-gray-100', image: null },
    { name: 'Equipment 4', bg: 'bg-gray-100', image: null },
    { name: 'Equipment 5', bg: 'bg-gray-100', image: null }
  ];

  const attackCards = [
    { name: 'Hacked', bg: 'bg-red-50', image: '/lovable-uploads/attack-hacked.png' },
    { name: 'Attack 2', bg: 'bg-gray-100', image: null },
    { name: 'Attack 3', bg: 'bg-gray-100', image: null },
    { name: 'Attack 4', bg: 'bg-gray-100', image: null },
    { name: 'Attack 5', bg: 'bg-gray-100', image: null }
  ];

  const classificationCards = [
    { name: 'Facilities', bg: 'bg-blue-50', image: '/lovable-uploads/classification-facilities.png' },
    { name: 'Field Tech', bg: 'bg-blue-50', image: '/lovable-uploads/classification-fieldtech.png' },
    { name: 'Classification 3', bg: 'bg-gray-100', image: null },
    { name: 'Classification 4', bg: 'bg-gray-100', image: null },
    { name: 'Classification 5', bg: 'bg-gray-100', image: null }
  ];

  // Auto-rotate cards every 4 seconds (pause when hovering or shuffling)
  useEffect(() => {
    if (isHovering || isShuffling) return;
    
    const interval = setInterval(() => {
      setEquipmentIndex((prev) => {
        const next = (prev + 1) % equipmentCards.length;
        if (next === 0) {
          setCycleCount(count => ({ ...count, equipment: count.equipment + 1 }));
        }
        return next;
      });
      setAttackIndex((prev) => {
        const next = (prev + 1) % attackCards.length;
        if (next === 0) {
          setCycleCount(count => ({ ...count, attack: count.attack + 1 }));
        }
        return next;
      });
      setClassificationIndex((prev) => {
        const next = (prev + 1) % classificationCards.length;
        if (next === 0) {
          setCycleCount(count => ({ ...count, classification: count.classification + 1 }));
        }
        return next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isHovering, isShuffling]);

  // Trigger shuffle when all decks complete a cycle
  useEffect(() => {
    if (cycleCount.equipment > 0 && cycleCount.attack > 0 && cycleCount.classification > 0) {
      if (cycleCount.equipment === cycleCount.attack && cycleCount.attack === cycleCount.classification) {
        setIsShuffling(true);
        
        // Reset after shuffle animation completes
        setTimeout(() => {
          setIsShuffling(false);
          setCycleCount({ equipment: 0, attack: 0, classification: 0 });
        }, 5000); // 5 second shuffle + deal animation duration
      }
    }
  }, [cycleCount]);

  const cycleEquipment = () => {
    setEquipmentIndex((prev) => (prev + 1) % equipmentCards.length);
  };

  const cycleAttack = () => {
    setAttackIndex((prev) => (prev + 1) % attackCards.length);
  };

  const cycleClassification = () => {
    setClassificationIndex((prev) => (prev + 1) % classificationCards.length);
  };

  const renderCard = (cards: typeof equipmentCards, currentIndex: number, onClick: () => void, borderColor: string, position: 'left' | 'center' | 'right') => {
    const [isHovered, setIsHovered] = useState(false);
    
    return (
      <div className="relative">
        <div 
          className={`relative w-48 h-64 lg:w-56 lg:h-80 group cursor-pointer transition-transform duration-300 ${!isHovered && 'hover:scale-110'} hover:z-50`}
          onClick={onClick}
          onMouseEnter={() => {
            setIsHovered(true);
            setIsHovering(true);
          }}
          onMouseLeave={() => {
            setIsHovered(false);
            setIsHovering(false);
          }}
        >
          {cards.map((card, idx) => {
            const offset = (idx - currentIndex + cards.length) % cards.length;
            const rotation = isHovered 
              ? offset === 0 ? 'rotate-12' : offset === 1 ? 'rotate-6' : 'rotate-0'
              : offset === 0 ? 'group-hover:rotate-6' : offset === 1 ? '' : 'group-hover:-rotate-6';
            const translation = isHovered
              ? offset === 0 ? '-translate-x-4 -translate-y-2' : offset === 1 ? 'translate-x-0 translate-y-0' : 'translate-x-4 translate-y-2'
              : offset === 0 ? 'group-hover:translate-x-1' : offset === 1 ? 'translate-x-0.5 translate-y-0.5' : 'translate-x-1 translate-y-1 group-hover:-translate-x-1';
            const zIndex = offset === 0 ? 'z-20' : offset === 1 ? 'z-10' : '';
            
            return (
              <div
                key={`${idx}-${currentIndex}`}
                className={`absolute inset-0 ${card.bg} ${borderColor} border-4 rounded-xl shadow-2xl drop-shadow-lg overflow-hidden transform ${translation} ${rotation} ${zIndex} ${card.image ? 'p-2' : 'flex items-center justify-center'} transition-all duration-300`}
                style={{
                  animation: !isHovered && (offset === 0 ? 'slideToFront 1s ease-in-out' : offset === cards.length - 1 ? 'slideToBack 1s ease-in-out' : 'none'),
                }}
              >
                {card.image ? (
                  <img src={card.image} alt={card.name} className="w-full h-full object-contain" style={{ imageRendering: 'crisp-edges' }} />
                ) : (
                  <span className="text-sm text-muted-foreground">{card.name}</span>
                )}
              </div>
            );
          })}
        </div>
        {/* Card indicator dots */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
          {cards.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-colors ${
                idx === currentIndex ? borderColor.replace('border-', 'bg-') : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-wrap justify-center gap-12 lg:gap-16 pb-8 relative">
      {/* Shuffle overlay */}
      {isShuffling && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="relative w-48 h-64 lg:w-56 lg:h-80">
            {/* Combined deck pile */}
            <div className="absolute inset-0 bg-gray-100 border-4 border-primary rounded-xl shadow-2xl flex items-center justify-center animate-pulse-neon">
              <img 
                src="/wire-logo-official.png" 
                alt="WIRED Logo" 
                className="w-32 h-32 object-contain opacity-80"
              />
            </div>
            {/* Animated cards combining */}
            <div className="absolute inset-0">
              {[...Array(15)].map((_, idx) => (
                <div
                  key={idx}
                  className="absolute inset-0 bg-gray-200 border-2 border-gray-400 rounded-xl"
                  style={{
                    animation: `shuffleToPile 1.5s ease-in-out forwards`,
                    animationDelay: `${idx * 0.1}s`,
                    opacity: 0,
                  }}
                />
              ))}
            </div>
            {/* Cards dealing out */}
            <div className="absolute inset-0">
              {[...Array(15)].map((_, idx) => (
                <div
                  key={`deal-${idx}`}
                  className="absolute inset-0 bg-gray-200 border-2 border-gray-400 rounded-xl"
                  style={{
                    animation: `dealFromPile 1.5s ease-in-out forwards`,
                    animationDelay: `${2 + idx * 0.1}s`,
                    opacity: 0,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className={isShuffling ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}>
        {renderCard(equipmentCards, equipmentIndex, cycleEquipment, 'border-green-500', 'left')}
      </div>
      <div className={isShuffling ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}>
        {renderCard(attackCards, attackIndex, cycleAttack, 'border-red-500', 'center')}
      </div>
      <div className={isShuffling ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}>
        {renderCard(classificationCards, classificationIndex, cycleClassification, 'border-blue-500', 'right')}
      </div>
    </div>
  );
};

export default GameMechanicsSection;
