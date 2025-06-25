
import GameCard from './GameCard';
import { Computer, Cable, Shield } from 'lucide-react';
import { ComputerIllustration, CablingIllustration, HackedIllustration } from './CardIllustrations';

interface GameMechanicsSectionProps {
  cardBackgroundImage?: string;
}

const GameMechanicsSection = ({ cardBackgroundImage }: GameMechanicsSectionProps) => {
  return (
    <div className="flex flex-wrap justify-center gap-6 lg:gap-8">
      <GameCard
        type="equipment"
        title="CABLING"
        description="Use cables to connect your pc to the switch to start mining."
        icon={<Cable />}
        illustration={<CablingIllustration />}
        cardBackgroundImage={cardBackgroundImage}
      />
      
      <GameCard
        type="attack"
        title="HACKED"
        description="Use your debuff cards to disrupt opponents' networks or negotiate deals."
        icon={<Shield />}
        illustration={<HackedIllustration />}
        cardBackgroundImage={cardBackgroundImage}
      />
      
      <GameCard
        type="equipment"
        title="COMPUTER"
        description="The faster you make your connections, the more bitcoins you mine per turn."
        icon={<Computer />}
        illustration={<ComputerIllustration />}
        cardBackgroundImage={cardBackgroundImage}
      />
    </div>
  );
};

export default GameMechanicsSection;
