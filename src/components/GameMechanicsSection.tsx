interface GameMechanicsSectionProps {
  cardBackgroundImage?: string;
}

const GameMechanicsSection = ({ cardBackgroundImage }: GameMechanicsSectionProps) => {
  const cards = [
    {
      name: 'Cabling',
      image: '/lovable-uploads/equipment-cabling.png',
      borderColor: 'border-green-600',
      bg: 'bg-green-50'
    },
    {
      name: 'Hacked',
      image: '/lovable-uploads/attack-hacked.png',
      borderColor: 'border-red-600',
      bg: 'bg-red-50'
    },
    {
      name: 'Computer',
      image: '/lovable-uploads/equipment-computer.png',
      borderColor: 'border-green-600',
      bg: 'bg-green-50'
    }
  ];

  return (
    <div className="flex flex-wrap justify-center gap-8 lg:gap-12">
      {cards.map((card) => (
        <div
          key={card.name}
          className={`relative w-48 h-64 lg:w-56 lg:h-80 ${card.bg} ${card.borderColor} border-4 rounded-xl shadow-2xl drop-shadow-lg overflow-hidden transition-transform duration-300 hover:scale-110 hover:z-50 p-2`}
        >
          <img
            src={card.image}
            alt={card.name}
            className="w-full h-full object-contain"
            style={{ imageRendering: 'crisp-edges' }}
          />
        </div>
      ))}
    </div>
  );
};

export default GameMechanicsSection;
