
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
        description="Required to connect COMPUTER to SWITCH."
        icon={<Cable />}
        illustration={<CablingIllustration />}
        cardBackgroundImage={cardBackgroundImage}
      />
      
      <GameCard
        type="attack"
        title="HACKED"
        description="Target equipment card DISABLED."
        icon={<Shield />}
        illustration={<HackedIllustration />}
        cardBackgroundImage={cardBackgroundImage}
      />
      
      <GameCard
        type="equipment"
        title="COMPUTER"
        description="Connect to the SWITCH to start mining bitcoins."
        icon={<Computer />}
        illustration={<ComputerIllustration />}
        cardBackgroundImage={cardBackgroundImage}
      />
    </div>
  );
};

export default GameMechanicsSection;
