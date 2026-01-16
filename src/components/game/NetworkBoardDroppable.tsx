import { PlayerNetwork, SwitchNode, CableNode, PlacedCard, Card } from '@/types/game';
import { DroppableZone } from './DroppableZone';
import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface NetworkBoardDroppableProps {
  network: PlayerNetwork;
  isCurrentPlayer: boolean;
  label: string;
  playerId: string;
  canReceiveAttacks?: boolean; // True when opponent is playing during moves phase
  canReceiveResolutions?: boolean; // True when current player has resolution cards
}

export function NetworkBoardDroppable({
  network,
  isCurrentPlayer,
  label,
  playerId,
  canReceiveAttacks = false,
  canReceiveResolutions = false,
}: NetworkBoardDroppableProps) {
  return (
    <div className="bg-black/30 rounded-lg p-4 border border-accent-green/30">
      <h3 className="text-sm font-semibold text-accent-green mb-3">{label}</h3>
      
      {/* Internet connection point - droppable for switches */}
      <DroppableZone
        id={`${playerId}-internet`}
        type="internet"
        accepts={isCurrentPlayer ? ['switch'] : []}
        className="flex items-center justify-center mb-4"
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-blue-500/30">
          INTERNET
        </div>
      </DroppableZone>
      
      {/* Switches */}
      <div className="space-y-4">
        {network.switches.map((sw) => (
          <SwitchComponent
            key={sw.id}
            switchNode={sw}
            isCurrentPlayer={isCurrentPlayer}
            playerId={playerId}
            canReceiveAttacks={canReceiveAttacks}
            canReceiveResolutions={canReceiveResolutions}
          />
        ))}
        
        {network.switches.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-8 border-2 border-dashed border-gray-600 rounded-lg">
            {isCurrentPlayer ? 'Drag a Switch card here to start building!' : 'No network yet'}
          </div>
        )}
      </div>
    </div>
  );
}

interface SwitchComponentProps {
  switchNode: SwitchNode;
  isCurrentPlayer: boolean;
  playerId: string;
  canReceiveAttacks: boolean;
  canReceiveResolutions: boolean;
}

function SwitchComponent({
  switchNode,
  isCurrentPlayer,
  playerId,
  canReceiveAttacks,
  canReceiveResolutions,
}: SwitchComponentProps) {
  // Determine what this equipment can accept
  const getEquipmentAccepts = (): string[] => {
    const accepts: string[] = [];
    
    // Equipment cards for current player
    if (isCurrentPlayer) {
      accepts.push('cable-2', 'cable-3');
    }
    
    // Attack cards for opponent's equipment
    if (canReceiveAttacks) {
      accepts.push('hacked', 'power-outage', 'new-hire');
    }
    
    // Resolution cards for own equipment with issues
    if (canReceiveResolutions && switchNode.attachedIssues.length > 0) {
      accepts.push('secured', 'powered', 'trained', 'helpdesk');
    }
    
    return accepts;
  };

  return (
    <div className="relative">
      {/* Connection line to Internet */}
      <div className="absolute left-1/2 -top-4 w-0.5 h-4 bg-accent-green/50" />
      
      {/* Switch card - droppable for cables, attacks, resolutions */}
      <DroppableZone
        id={`${playerId}-switch-${switchNode.id}`}
        type={canReceiveAttacks ? 'opponent-equipment' : isCurrentPlayer ? 'switch' : 'own-equipment'}
        accepts={getEquipmentAccepts()}
        className="w-fit mx-auto"
      >
        <div className="relative">
          <PlacedCardDisplay
            card={switchNode.card}
            placementId={switchNode.id}
            isDisabled={switchNode.isDisabled}
            className="w-16 h-20"
          />
          
          {/* Issue indicators */}
          {switchNode.attachedIssues.length > 0 && (
            <IssueIndicator issues={switchNode.attachedIssues} />
          )}
        </div>
      </DroppableZone>
      
      {/* Cables */}
      {switchNode.cables.length > 0 && (
        <div className="flex flex-wrap justify-center gap-4 mt-2 pl-8">
          {switchNode.cables.map((cable) => (
            <CableComponent
              key={cable.id}
              cable={cable}
              switchId={switchNode.id}
              isCurrentPlayer={isCurrentPlayer}
              playerId={playerId}
              canReceiveAttacks={canReceiveAttacks}
              canReceiveResolutions={canReceiveResolutions}
            />
          ))}
        </div>
      )}
      
      {/* Empty cable slot hint */}
      {switchNode.cables.length === 0 && isCurrentPlayer && (
        <div className="text-center text-xs text-muted-foreground mt-2">
          ↑ Drag cables here
        </div>
      )}
    </div>
  );
}

interface CableComponentProps {
  cable: CableNode;
  switchId: string;
  isCurrentPlayer: boolean;
  playerId: string;
  canReceiveAttacks: boolean;
  canReceiveResolutions: boolean;
}

function CableComponent({
  cable,
  switchId,
  isCurrentPlayer,
  playerId,
  canReceiveAttacks,
  canReceiveResolutions,
}: CableComponentProps) {
  const hasSpace = cable.computers.length < cable.maxComputers;
  
  // Determine what this equipment can accept
  const getEquipmentAccepts = (): string[] => {
    const accepts: string[] = [];
    
    // Computer cards for current player with space
    if (isCurrentPlayer && hasSpace) {
      accepts.push('computer');
    }
    
    // Attack cards for opponent's equipment
    if (canReceiveAttacks) {
      accepts.push('hacked', 'power-outage', 'new-hire');
    }
    
    // Resolution cards for own equipment with issues
    if (canReceiveResolutions && cable.attachedIssues.length > 0) {
      accepts.push('secured', 'powered', 'trained', 'helpdesk');
    }
    
    return accepts;
  };
  
  return (
    <div className="relative">
      {/* Connection line to Switch */}
      <div className="absolute left-1/2 -top-2 w-0.5 h-2 bg-green-500/50" />
      
      {/* Cable card - droppable for computers, attacks, resolutions */}
      <DroppableZone
        id={`${playerId}-cable-${cable.id}`}
        type={canReceiveAttacks ? 'opponent-equipment' : isCurrentPlayer ? 'cable' : 'own-equipment'}
        accepts={getEquipmentAccepts()}
        className="w-fit"
      >
        <div className="relative">
          <PlacedCardDisplay
            card={cable.card}
            placementId={cable.id}
            isDisabled={cable.isDisabled}
            className="w-14 h-18"
          />
          
          {/* Issue indicators */}
          {cable.attachedIssues.length > 0 && (
            <IssueIndicator issues={cable.attachedIssues} />
          )}
        </div>
      </DroppableZone>
      
      {/* Capacity indicator */}
      <div className={cn(
        "text-xs text-center mt-0.5",
        hasSpace ? "text-muted-foreground" : "text-red-400"
      )}>
        {cable.computers.length}/{cable.maxComputers}
      </div>
      
      {/* Computers */}
      {cable.computers.length > 0 && (
        <div className="flex gap-1 mt-1 justify-center">
          {cable.computers.map((comp) => (
            <ComputerComponent
              key={comp.id}
              computer={comp}
              cableId={cable.id}
              isCurrentPlayer={isCurrentPlayer}
              playerId={playerId}
              canReceiveAttacks={canReceiveAttacks}
              canReceiveResolutions={canReceiveResolutions}
            />
          ))}
        </div>
      )}
      
      {/* Empty computer slot hint */}
      {hasSpace && isCurrentPlayer && cable.computers.length === 0 && (
        <div className="text-center text-xs text-muted-foreground mt-1">
          ↑ Drag PC
        </div>
      )}
    </div>
  );
}

interface ComputerComponentProps {
  computer: PlacedCard;
  cableId: string;
  isCurrentPlayer: boolean;
  playerId: string;
  canReceiveAttacks: boolean;
  canReceiveResolutions: boolean;
}

function ComputerComponent({
  computer,
  cableId,
  isCurrentPlayer,
  playerId,
  canReceiveAttacks,
  canReceiveResolutions,
}: ComputerComponentProps) {
  // Determine what this equipment can accept
  const getEquipmentAccepts = (): string[] => {
    const accepts: string[] = [];
    
    // Attack cards for opponent's equipment
    if (canReceiveAttacks) {
      accepts.push('hacked', 'power-outage', 'new-hire');
    }
    
    // Resolution cards for own equipment with issues
    if (canReceiveResolutions && computer.attachedIssues.length > 0) {
      accepts.push('secured', 'powered', 'trained', 'helpdesk');
    }
    
    return accepts;
  };
  
  const accepts = getEquipmentAccepts();
  
  // If no interactions possible, render simple div
  if (accepts.length === 0) {
    return (
      <div className="relative">
        <PlacedCardDisplay
          card={computer.card}
          placementId={computer.id}
          isDisabled={computer.isDisabled}
          className="w-10 h-12"
          small
        />
        {computer.attachedIssues.length > 0 && (
          <IssueIndicator issues={computer.attachedIssues} small />
        )}
      </div>
    );
  }
  
  return (
    <DroppableZone
      id={`${playerId}-computer-${computer.id}`}
      type={canReceiveAttacks ? 'opponent-equipment' : 'own-equipment'}
      accepts={accepts}
      className="w-fit"
    >
      <div className="relative">
        <PlacedCardDisplay
          card={computer.card}
          placementId={computer.id}
          isDisabled={computer.isDisabled}
          className="w-10 h-12"
          small
        />
        {computer.attachedIssues.length > 0 && (
          <IssueIndicator issues={computer.attachedIssues} small />
        )}
      </div>
    </DroppableZone>
  );
}

// Animated card display for placed cards
interface PlacedCardDisplayProps {
  card: Card;
  placementId: string;
  isDisabled: boolean;
  className?: string;
  small?: boolean;
}

// Track which cards have been animated
const animatedCards = new Set<string>();

function PlacedCardDisplay({ card, placementId, isDisabled, className, small = false }: PlacedCardDisplayProps) {
  const [isNew, setIsNew] = useState(false);
  
  useEffect(() => {
    // Check if this card hasn't been animated yet
    if (!animatedCards.has(placementId)) {
      animatedCards.add(placementId);
      setIsNew(true);
      
      // Remove animation class after animation completes
      const timer = setTimeout(() => setIsNew(false), 500);
      return () => clearTimeout(timer);
    }
  }, [placementId]);
  
  return (
    <div
      className={cn(
        "rounded border-2 overflow-hidden transition-all duration-300",
        isDisabled ? "border-red-500 opacity-70" : small ? "border-green-400" : "border-green-500",
        isNew && "animate-scale-in ring-2 ring-yellow-400 ring-opacity-75 shadow-lg shadow-yellow-400/30",
        className
      )}
    >
      <img 
        src={card.image} 
        alt={card.name}
        className={cn(
          "w-full h-full object-contain",
          isNew && "animate-pulse"
        )}
      />
    </div>
  );
}

interface IssueIndicatorProps {
  issues: Card[];
  small?: boolean;
}

function IssueIndicator({ issues, small = false }: IssueIndicatorProps) {
  const issueColors: Record<string, string> = {
    'hacked': 'bg-purple-500',
    'power-outage': 'bg-yellow-500',
    'new-hire': 'bg-orange-500',
  };
  
  return (
    <div className={cn(
      "absolute flex gap-0.5",
      small ? "-top-1 -right-1" : "-top-2 -right-2"
    )}>
      {issues.map((issue, idx) => (
        <div
          key={idx}
          className={cn(
            "rounded-full flex items-center justify-center",
            issueColors[issue.subtype] || 'bg-red-500',
            small ? "w-3 h-3" : "w-4 h-4"
          )}
          title={issue.name}
        >
          <AlertTriangle className={cn(
            "text-white",
            small ? "w-2 h-2" : "w-2.5 h-2.5"
          )} />
        </div>
      ))}
    </div>
  );
}
