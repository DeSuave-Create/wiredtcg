
import GameCard from './GameCard';
import { Computer, Cable, Shield } from 'lucide-react';
import { ComputerIllustration, CablingIllustration, HackedIllustration } from './CardIllustrations';

const GameMechanicsSection = () => {
  return (
    <div className="flex flex-wrap justify-center gap-6 lg:gap-8">
      <GameCard
        type="equipment"
        title="CABLING"
        description="Required to connect COMPUTER to SWITCH."
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
      
      <GameCard
        type="equipment"
        title="COMPUTER"
        description="Connect to the SWITCH to start mining bitcoins."
        icon={<Computer />}
        illustration={<ComputerIllustration />}
      />
    </div>
  );
};

export default GameMechanicsSection;
