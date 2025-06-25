
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
        description="Once connected, start mining digital currency. Upgrade your network to mine more bitcoins per turn and protect it from outsiders using your specialization cards."
        icon={<Cable />}
        illustration={<CablingIllustration />}
        cardBackgroundImage={cardBackgroundImage}
      />
      
      <GameCard
        type="attack"
        title="HACKED"
        description="Use your debuff cards to disrupt opponents' networks or negotiate deals. Protect your setup with buff cards and specialization cards."
        icon={<Shield />}
        illustration={<HackedIllustration />}
        cardBackgroundImage={cardBackgroundImage}
      />
      
      <GameCard
        type="equipment"
        title="COMPUTER"
        description="Connect your PC to the switch by using your equipment cards. The faster you make your connections, the more bitcoins you mine per turn."
        icon={<Computer />}
        illustration={<ComputerIllustration />}
        cardBackgroundImage={cardBackgroundImage}
      />
    </div>
  );
};

export default GameMechanicsSection;
