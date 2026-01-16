import { PlayerNetwork, SwitchNode, CableNode, PlacedCard, Card, FloatingCable } from '@/types/game';
import { DroppableZone } from './DroppableZone';
import { DraggablePlacedCard } from './DraggablePlacedCard';
import { cn } from '@/lib/utils';
import { AlertTriangle, Unplug } from 'lucide-react';
import { useState, useEffect } from 'react';

interface NetworkBoardDroppableProps {
  network: PlayerNetwork;
  isCurrentPlayer: boolean;
  label: string;
  playerId: string;
  canReceiveAttacks?: boolean;
  canReceiveResolutions?: boolean;
  canRearrange?: boolean; // Whether cards can be dragged to rearrange
}

export function NetworkBoardDroppable({
  network,
  isCurrentPlayer,
  label,
  playerId,
  canReceiveAttacks = false,
  canReceiveResolutions = false,
  canRearrange = false,
}: NetworkBoardDroppableProps) {
  const hasFloatingEquipment = network.floatingCables.length > 0 || network.floatingComputers.length > 0;
  
  return (
    <div className="bg-black/30 rounded-lg p-4 border border-accent-green/30">
      <h3 className="text-sm font-semibold text-accent-green mb-3">{label}</h3>
      
      {/* Board drop zone - accepts any equipment */}
      <DroppableZone
        id={`${playerId}-board`}
        type="internet"
        accepts={isCurrentPlayer ? ['switch', 'cable-2', 'cable-3', 'computer'] : []}
        className="min-h-[200px] relative"
      >
        {/* Internet connection point */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-blue-500/30">
            INTERNET
          </div>
        </div>
        
        {/* Connection lines from Internet to Switches */}
        {network.switches.length > 0 && (
          <div className="flex justify-center mb-2">
            <div className="w-0.5 h-4 bg-accent-green/50" />
          </div>
        )}
        
        {/* Connected Switches - horizontal layout */}
        <div className="flex flex-wrap justify-center gap-6">
          {network.switches.map((sw) => (
            <SwitchComponent
              key={sw.id}
              switchNode={sw}
              isCurrentPlayer={isCurrentPlayer}
              playerId={playerId}
              canReceiveAttacks={canReceiveAttacks}
              canReceiveResolutions={canReceiveResolutions}
              canRearrange={canRearrange}
            />
          ))}
        </div>
        
        {/* Floating Equipment Section */}
        {(hasFloatingEquipment || (network.switches.length === 0 && isCurrentPlayer)) && (
          <div className="mt-4 pt-4 border-t border-dashed border-yellow-500/50">
            <div className="flex items-center gap-2 text-yellow-500 text-xs mb-2">
              <Unplug className="w-3 h-3" />
              <span>Unconnected Equipment</span>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {/* Floating Cables with their computers */}
              {network.floatingCables.map((cable) => (
                <FloatingCableComponent
                  key={cable.id}
                  cable={cable}
                  isCurrentPlayer={isCurrentPlayer}
                  playerId={playerId}
                  canReceiveAttacks={canReceiveAttacks}
                  canReceiveResolutions={canReceiveResolutions}
                  canRearrange={canRearrange}
                />
              ))}
              
              {/* Floating Computers */}
              {network.floatingComputers.map((comp) => (
                <div key={comp.id} className="relative">
                  {canRearrange ? (
                    <DraggablePlacedCard
                      placedCard={comp}
                      disabled={false}
                      className="w-10 h-12 opacity-70"
                      small
                      sourceType="floating-computer"
                      sourceId={comp.id}
                    />
                  ) : (
                    <PlacedCardDisplay
                      card={comp.card}
                      placementId={comp.id}
                      isDisabled={true}
                      className="w-10 h-12 opacity-70"
                      small
                    />
                  )}
                  <div className="absolute -bottom-1 left-0 right-0 text-center">
                    <span className="text-[8px] bg-yellow-500 text-black px-1 rounded">floating</span>
                  </div>
                </div>
              ))}
              
              {!hasFloatingEquipment && network.switches.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-4 w-full">
                  Drag any equipment card here to place it
                </div>
              )}
            </div>
          </div>
        )}
      </DroppableZone>
    </div>
  );
}

interface SwitchComponentProps {
  switchNode: SwitchNode;
  isCurrentPlayer: boolean;
  playerId: string;
  canReceiveAttacks: boolean;
  canReceiveResolutions: boolean;
  canRearrange: boolean;
}

function SwitchComponent({
  switchNode,
  isCurrentPlayer,
  playerId,
  canReceiveAttacks,
  canReceiveResolutions,
  canRearrange,
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
    <div className="relative flex flex-col items-center min-w-[100px]">
      {/* Connection line to Internet */}
      <div className="w-0.5 h-4 bg-accent-green/50 mb-1" />
      
      {/* Switch card - droppable for cables, attacks, resolutions */}
      <DroppableZone
        id={`${playerId}-switch-${switchNode.id}`}
        type={canReceiveAttacks ? 'opponent-equipment' : isCurrentPlayer ? 'switch' : 'own-equipment'}
        accepts={getEquipmentAccepts()}
        className="w-fit"
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
      
      {/* Cables - vertical stack below switch */}
      {switchNode.cables.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          {switchNode.cables.map((cable) => (
            <CableComponent
              key={cable.id}
              cable={cable}
              switchId={switchNode.id}
              isCurrentPlayer={isCurrentPlayer}
              playerId={playerId}
              canReceiveAttacks={canReceiveAttacks}
              canReceiveResolutions={canReceiveResolutions}
              canRearrange={canRearrange}
            />
          ))}
        </div>
      )}
      
      {/* Empty cable slot hint */}
      {switchNode.cables.length === 0 && isCurrentPlayer && (
        <div className="text-center text-xs text-muted-foreground mt-2">
          ↑ Drop cable
        </div>
      )}
    </div>
  );
}

// Floating Cable Component (not connected to a switch) - DROPPABLE for computers
interface FloatingCableComponentProps {
  cable: FloatingCable;
  isCurrentPlayer: boolean;
  playerId: string;
  canReceiveAttacks: boolean;
  canReceiveResolutions: boolean;
  canRearrange: boolean;
}

function FloatingCableComponent({
  cable,
  isCurrentPlayer,
  playerId,
  canReceiveAttacks,
  canReceiveResolutions,
  canRearrange,
}: FloatingCableComponentProps) {
  const hasSpace = cable.computers.length < cable.maxComputers;
  
  // Floating cables can receive computers if there's space
  const getAccepts = (): string[] => {
    const accepts: string[] = [];
    if (isCurrentPlayer && hasSpace) {
      accepts.push('computer');
    }
    return accepts;
  };
  
  const accepts = getAccepts();
  
  // Wrap in DroppableZone if it can accept cards
  const content = (
    <div className="relative bg-yellow-500/10 rounded-lg p-2 border border-dashed border-yellow-500/50">
      <div className="relative">
        {canRearrange ? (
          <DraggablePlacedCard
            placedCard={cable}
            disabled={false}
            className="w-14 h-18 opacity-80"
            sourceType="floating-cable"
            sourceId={cable.id}
          />
        ) : (
          <PlacedCardDisplay
            card={cable.card}
            placementId={cable.id}
            isDisabled={true}
            className="w-14 h-18 opacity-80"
          />
        )}
        {!canRearrange && (
          <div className="absolute -bottom-1 left-0 right-0 text-center">
            <span className="text-[8px] bg-yellow-500 text-black px-1 rounded">floating</span>
          </div>
        )}
      </div>
      
      {/* Capacity indicator */}
      <div className={cn(
        "text-xs text-center mt-0.5",
        hasSpace ? "text-yellow-500" : "text-red-400"
      )}>
        {cable.computers.length}/{cable.maxComputers}
      </div>
      
      {/* Computers attached to this floating cable */}
      {cable.computers.length > 0 && (
        <div className="flex gap-1 mt-1 justify-center">
          {cable.computers.map((comp) => (
            <div key={comp.id} className="relative">
              {canRearrange ? (
                <DraggablePlacedCard
                  placedCard={comp}
                  disabled={false}
                  className="w-8 h-10 opacity-70"
                  small
                  sourceType="computer"
                  sourceId={comp.id}
                  parentId={cable.id}
                />
              ) : (
                <PlacedCardDisplay
                  card={comp.card}
                  placementId={comp.id}
                  isDisabled={true}
                  className="w-8 h-10 opacity-70"
                  small
                />
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Drop hint for empty floating cable */}
      {hasSpace && isCurrentPlayer && cable.computers.length === 0 && (
        <div className="text-center text-[8px] text-yellow-400 mt-1">
          ↑ Drop PC here
        </div>
      )}
    </div>
  );
  
  // If can accept computers, wrap in DroppableZone
  if (accepts.length > 0) {
    return (
      <DroppableZone
        id={`${playerId}-floating-cable-${cable.id}`}
        type="cable"
        accepts={accepts}
        className="w-fit"
      >
        {content}
      </DroppableZone>
    );
  }
  
  return content;
}

interface CableComponentProps {
  cable: CableNode;
  switchId: string;
  isCurrentPlayer: boolean;
  playerId: string;
  canReceiveAttacks: boolean;
  canReceiveResolutions: boolean;
  canRearrange: boolean;
}

function CableComponent({
  cable,
  switchId,
  isCurrentPlayer,
  playerId,
  canReceiveAttacks,
  canReceiveResolutions,
  canRearrange,
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
          {canRearrange ? (
            <DraggablePlacedCard
              placedCard={cable}
              disabled={false}
              className="w-14 h-18"
              sourceType="cable"
              sourceId={cable.id}
              parentId={switchId}
            />
          ) : (
            <PlacedCardDisplay
              card={cable.card}
              placementId={cable.id}
              isDisabled={cable.isDisabled}
              className="w-14 h-18"
            />
          )}
          
          {/* Issue indicators */}
          {cable.attachedIssues.length > 0 && !canRearrange && (
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
              canRearrange={canRearrange}
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
  canRearrange: boolean;
}

function ComputerComponent({
  computer,
  cableId,
  isCurrentPlayer,
  playerId,
  canReceiveAttacks,
  canReceiveResolutions,
  canRearrange,
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
  
  // If player can rearrange, render draggable
  if (canRearrange) {
    const content = (
      <div className="relative">
        <DraggablePlacedCard
          placedCard={computer}
          disabled={false}
          className="w-10 h-12"
          small
          sourceType="computer"
          sourceId={computer.id}
          parentId={cableId}
        />
      </div>
    );
    
    // Wrap in droppable if can receive attacks/resolutions
    if (accepts.length > 0) {
      return (
        <DroppableZone
          id={`${playerId}-computer-${computer.id}`}
          type={canReceiveAttacks ? 'opponent-equipment' : 'own-equipment'}
          accepts={accepts}
          className="w-fit"
        >
          {content}
        </DroppableZone>
      );
    }
    
    return content;
  }
  
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

// Animated card display for placed cards (non-draggable version)
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
