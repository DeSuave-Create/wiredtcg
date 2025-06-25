
import { Network, Bitcoin, Shield } from 'lucide-react';

const GameMechanicsSection = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      <div className="border border-primary/50 shadow-[0_0_10px_rgba(0,255,255,0.3)] bg-card/50 p-4 sm:p-6 rounded-lg text-center space-y-3 sm:space-y-4">
        <Network className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-primary mx-auto" />
        <h3 className="text-lg sm:text-xl font-semibold text-primary">Build Your Network</h3>
        <p className="text-sm sm:text-base text-muted-foreground">
          Connect your PC to the switch by using your equipment cards. The faster you make your connections, the more bitcoins you mine per turn.
        </p>
      </div>
      <div className="border border-secondary/50 shadow-[0_0_10px_rgba(255,165,0,0.3)] bg-card/50 p-4 sm:p-6 rounded-lg text-center space-y-3 sm:space-y-4">
        <Bitcoin className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-secondary mx-auto" />
        <h3 className="text-lg sm:text-xl font-semibold text-secondary">Mine Bitcoins</h3>
        <p className="text-sm sm:text-base text-muted-foreground">
          Once connected, start mining digital currency. Upgrade your network to mine more bitcoins per turn and protect it from outsiders using your specialization cards.
        </p>
      </div>
      <div className="border border-destructive/50 shadow-[0_0_10px_rgba(239,68,68,0.3)] bg-card/50 p-4 sm:p-6 rounded-lg text-center space-y-3 sm:space-y-4 lg:col-span-1 col-span-1">
        <Shield className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-destructive mx-auto" />
        <h3 className="text-lg sm:text-xl font-semibold text-destructive">Attack & Defend</h3>
        <p className="text-sm sm:text-base text-muted-foreground">
          Use your debuff cards to disrupt opponents' networks or negotiate deals. Protect your setup with buff cards and specialization cards.
        </p>
      </div>
    </div>
  );
};

export default GameMechanicsSection;
