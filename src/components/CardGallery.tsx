
import React from 'react';
import GameCard from './GameCard';
import { Cable, Monitor, Lightbulb, Truck, ShieldAlert } from 'lucide-react';
import { 
  CablingIllustration, 
  TripleCablingIllustration, 
  ComputerIllustration, 
  HackedIllustration, 
  FacilitiesIllustration, 
  FieldTechIllustration 
} from './CardIllustrations';

const CardGallery: React.FC = () => {
  const sampleCards = [
    {
      type: 'equipment' as const,
      title: 'CABLING',
      description: 'Hooking it Up.',
      icon: <Cable />,
      illustration: <CablingIllustration />
    },
    {
      type: 'equipment' as const,
      title: 'CABLING',
      description: 'Hooking it Up.',
      icon: <Cable />,
      illustration: <TripleCablingIllustration />
    },
    {
      type: 'equipment' as const,
      title: 'COMPUTER',
      description: 'Your endless source of information, cat videos and doom scrolling.',
      icon: <Monitor />,
      illustration: <ComputerIllustration />
    },
    {
      type: 'attack' as const,
      title: 'HACKED',
      description: 'Target equipment card DISABLED.',
      icon: <ShieldAlert />,
      illustration: <HackedIllustration />
    },
    {
      type: 'specialization' as const,
      title: 'FACILITIES',
      description: "Resolves all 'Power Outage' cards for the player.",
      icon: <Lightbulb />,
      illustration: <FacilitiesIllustration />
    },
    {
      type: 'specialization' as const,
      title: 'FIELD TECH',
      description: 'Player gets one extra Equipment move per turn.',
      icon: <Truck />,
      illustration: <FieldTechIllustration />
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-primary">Game Cards</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Experience the strategic depth of WIRED through our carefully designed card system. 
          Each card type offers unique gameplay mechanics and tactical advantages.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-8 justify-items-center">
        {sampleCards.map((card, index) => (
          <GameCard
            key={index}
            type={card.type}
            title={card.title}
            description={card.description}
            icon={card.icon}
            illustration={card.illustration}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-12">
        <div className="text-center space-y-3 p-6 border border-green-600/30 rounded-lg bg-green-600/5">
          <div className="w-12 h-12 mx-auto bg-green-600/20 rounded-full flex items-center justify-center">
            <Cable className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-green-600 dark:text-green-600">Equipment Cards</h3>
          <p className="text-sm text-muted-foreground">
            Build your network infrastructure with computers, cables, and networking equipment. 
            These cards form the foundation of your bitcoin mining operation.
          </p>
        </div>
        
        <div className="text-center space-y-3 p-6 border border-blue-500/30 rounded-lg bg-blue-500/5">
          <div className="w-12 h-12 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center">
            <Lightbulb className="h-6 w-6 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400">Specialization Cards</h3>
          <p className="text-sm text-muted-foreground">
            Gain special abilities and advantages that can turn the tide of the game. 
            These powerful cards provide unique strategic opportunities.
          </p>
        </div>
        
        <div className="text-center space-y-3 p-6 border border-red-500/30 rounded-lg bg-red-500/5">
          <div className="w-12 h-12 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
            <ShieldAlert className="h-6 w-6 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-red-600 dark:text-red-400">Attack Cards</h3>
          <p className="text-sm text-muted-foreground">
            Disrupt your opponents' networks and sabotage their mining operations. 
            Use these cards strategically to gain a competitive advantage.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CardGallery;
