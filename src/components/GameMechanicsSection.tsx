
import GameCard from './GameCard';
import { Computer, Cable, Shield } from 'lucide-react';
import { ComputerIllustration, CablingIllustration, HackedIllustration } from './CardIllustrations';

const GameMechanicsSection = () => {
  return (
    <div className="flex flex-wrap justify-center gap-6 lg:gap-8">
      <GameCard
        type="equipment"
        title="COMPUTER"
        description="Your endless source of information, cat videos and doom scrolling."
        icon={<Computer />}
        illustration={<ComputerIllustration />}
      />
      
      <GameCard
        type="equipment"
        title="CABLING"
        description="Hooking it Up."
        icon={<Cable />}
        illustration={<CablingIllustration />}
      />
      
      <GameCard
        type="attack"
        title="HACKED"
        description="Target equipment card DISABLED."
        icon={<Shield />}
        illustration={<HackedIllustration />}
      />
    </div>
  );
};

export default GameMechanicsSection;
