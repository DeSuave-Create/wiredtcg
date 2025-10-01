import { useState, useEffect } from 'react';

interface GameMechanicsSectionProps {
  cardBackgroundImage?: string;
}

const GameMechanicsSection = ({ cardBackgroundImage }: GameMechanicsSectionProps) => {
  const [equipmentIndex, setEquipmentIndex] = useState(0);
  const [attackIndex, setAttackIndex] = useState(0);
  const [classificationIndex, setClassificationIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const equipmentCards = [
    { name: 'Computer', bg: 'bg-green-50', image: '/lovable-uploads/equipment-computer.png' },
    { name: 'Cabling', bg: 'bg-green-50', image: '/lovable-uploads/equipment-cabling.png' },
    { name: 'Equipment', bg: 'bg-gray-100', image: null }
  ];

  const attackCards = [
    { name: 'Hacked', bg: 'bg-red-50', image: '/lovable-uploads/attack-hacked.png' },
    { name: 'Attack 2', bg: 'bg-gray-100', image: null },
    { name: 'Attack 3', bg: 'bg-gray-100', image: null }
  ];

  const classificationCards = [
    { name: 'Facilities', bg: 'bg-blue-50', image: '/lovable-uploads/classification-facilities.png' },
    { name: 'Field Tech', bg: 'bg-blue-50', image: '/lovable-uploads/classification-fieldtech.png' },
    { name: 'Classification', bg: 'bg-gray-100', image: null }
  ];

  // Auto-rotate cards every 4 seconds (pause when hovering)
  useEffect(() => {
    if (isHovering) return;
    
    const interval = setInterval(() => {
      setEquipmentIndex((prev) => (prev + 1) % equipmentCards.length);
      setAttackIndex((prev) => (prev + 1) % attackCards.length);
      setClassificationIndex((prev) => (prev + 1) % classificationCards.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isHovering]);

  const cycleEquipment = () => {
    setEquipmentIndex((prev) => (prev + 1) % equipmentCards.length);
  };

  const cycleAttack = () => {
    setAttackIndex((prev) => (prev + 1) % attackCards.length);
  };

  const cycleClassification = () => {
    setClassificationIndex((prev) => (prev + 1) % classificationCards.length);
  };

  const renderCard = (cards: typeof equipmentCards, currentIndex: number, onClick: () => void, borderColor: string) => {
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
    <div className="flex flex-wrap justify-center gap-12 lg:gap-16 pb-8">
      {renderCard(equipmentCards, equipmentIndex, cycleEquipment, 'border-green-600')}
      {renderCard(attackCards, attackIndex, cycleAttack, 'border-red-600')}
      {renderCard(classificationCards, classificationIndex, cycleClassification, 'border-blue-600')}
    </div>
  );
};

export default GameMechanicsSection;
