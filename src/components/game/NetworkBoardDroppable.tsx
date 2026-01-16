import { PlayerNetwork, SwitchNode, CableNode, PlacedCard, Card, FloatingCable } from '@/types/game';
import { DroppableZone } from './DroppableZone';
import { DraggablePlacedCard } from './DraggablePlacedCard';
import { cn } from '@/lib/utils';
import { Unplug } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface NetworkBoardDroppableProps {
  network: PlayerNetwork;
  isCurrentPlayer: boolean;
  label: string;
  playerId: string;
  canReceiveAttacks?: boolean;
  canReceiveResolutions?: boolean;
  canRearrange?: boolean; // Whether cards can be dragged to rearrange
  compact?: boolean; // Compact mode for smaller display
}

export function NetworkBoardDroppable({
  network,
  isCurrentPlayer,
  label,
  playerId,
  canReceiveAttacks = false,
  canReceiveResolutions = false,
  canRearrange = false,
  compact = false,
}: NetworkBoardDroppableProps) {
  const hasFloatingEquipment = network.floatingCables.length > 0 || network.floatingComputers.length > 0;
  
  return (
    <div className={cn(
      "bg-black/30 rounded-lg border border-accent-green/30 relative overflow-hidden",
      compact ? "p-2" : "p-4"
    )}>
      {/* Background logo */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url('/wire-logo-official.png')`,
          backgroundSize: '60%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      
      <h3 className={cn(
        "font-semibold text-accent-green relative z-10",
        compact ? "text-xs mb-2" : "text-sm mb-3"
      )}>{label}</h3>
      
      {/* Board drop zone - accepts any equipment */}
      <DroppableZone
        id={`${playerId}-board`}
        type="internet"
        accepts={isCurrentPlayer ? ['switch', 'cable-2', 'cable-3', 'computer'] : []}
        className={cn("relative z-10", compact ? "min-h-[120px]" : "min-h-[200px]")}
      >
        {/* Internet connection point */}
        <div className={cn("flex items-center justify-center", compact ? "mb-3" : "mb-6")}>
          <div className={cn(
            "rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30",
            compact ? "w-12 h-12 text-[8px]" : "w-20 h-20 text-xs"
          )}>
            INTERNET
          </div>
        </div>
        
        {/* Connection lines from Internet to Switches */}
        {network.switches.length > 0 && (
          <div className="flex justify-center mb-2">
            <div className={cn("w-0.5 bg-accent-green/50", compact ? "h-2" : "h-4")} />
          </div>
        )}
        
        {/* Connected Switches - horizontal layout */}
        <div className={cn("flex flex-wrap justify-center", compact ? "gap-3" : "gap-6")}>
          {network.switches.map((sw) => (
            <SwitchComponent
              key={sw.id}
              switchNode={sw}
              isCurrentPlayer={isCurrentPlayer}
              playerId={playerId}
              canReceiveAttacks={canReceiveAttacks}
              canReceiveResolutions={canReceiveResolutions}
              canRearrange={canRearrange}
              compact={compact}
            />
          ))}
        </div>
        
        {/* Floating Equipment Section */}
        {(hasFloatingEquipment || (network.switches.length === 0 && isCurrentPlayer)) && (
          <div className={cn(
            "border-t border-dashed border-yellow-500/50",
            compact ? "mt-2 pt-2" : "mt-4 pt-4"
          )}>
            <div className={cn(
              "flex items-center gap-2 text-yellow-500 mb-2",
              compact ? "text-[10px]" : "text-xs"
            )}>
              <Unplug className={compact ? "w-2 h-2" : "w-3 h-3"} />
              <span>Unconnected</span>
            </div>
            
            <div className={cn("flex flex-wrap", compact ? "gap-2" : "gap-3")}>
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
                  compact={compact}
                />
              ))}
              
              {/* Floating Computers */}
              {network.floatingComputers.map((comp) => (
                <div key={comp.id} className="relative">
                  {canRearrange ? (
                    <DraggablePlacedCard
                      placedCard={comp}
                      disabled={false}
                      className={cn("opacity-70", compact ? "w-7 h-9" : "w-10 h-12")}
                      small
                      sourceType="floating-computer"
                      sourceId={comp.id}
                    />
                  ) : (
                    <PlacedCardDisplay
                      card={comp.card}
                      placementId={comp.id}
                      isDisabled={true}
                      className={cn("opacity-70", compact ? "w-7 h-9" : "w-10 h-12")}
                      small
                    />
                  )}
                  <div className="absolute -bottom-1 left-0 right-0 text-center">
                    <span className="text-[6px] bg-yellow-500 text-black px-0.5 rounded">floating</span>
                  </div>
                </div>
              ))}
              
              {!hasFloatingEquipment && network.switches.length === 0 && !compact && (
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
  compact?: boolean;
}

function SwitchComponent({
  switchNode,
  isCurrentPlayer,
  playerId,
  canReceiveAttacks,
  canReceiveResolutions,
  canRearrange,
  compact = false,
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
    <div className={cn(
      "relative flex flex-col items-center",
      compact ? "min-w-[60px]" : "min-w-[100px]"
    )}>
      {/* Connection line to Internet */}
      <div className={cn("w-0.5 bg-accent-green/50 mb-1", compact ? "h-2" : "h-4")} />
      
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
            className={compact ? "w-10 h-12" : "w-16 h-20"}
            small={compact}
          />
          
          {/* Issue indicators */}
          {switchNode.attachedIssues.length > 0 && (
            <IssueIndicator issues={switchNode.attachedIssues} small={compact} />
          )}
        </div>
      </DroppableZone>
      
      {/* Cables - vertical stack below switch */}
      {switchNode.cables.length > 0 && (
        <div className={cn(
          "flex flex-wrap justify-center",
          compact ? "gap-1 mt-1" : "gap-2 mt-2"
        )}>
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
              compact={compact}
            />
          ))}
        </div>
      )}
      
      {/* Empty cable slot hint */}
      {switchNode.cables.length === 0 && isCurrentPlayer && !compact && (
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
  compact?: boolean;
}

function FloatingCableComponent({
  cable,
  isCurrentPlayer,
  playerId,
  canReceiveAttacks,
  canReceiveResolutions,
  canRearrange,
  compact = false,
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
    <div className={cn(
      "relative bg-yellow-500/10 rounded-lg border border-dashed border-yellow-500/50",
      compact ? "p-1" : "p-2"
    )}>
      <div className="relative">
        {canRearrange ? (
          <DraggablePlacedCard
            placedCard={cable}
            disabled={false}
            className={cn("opacity-80", compact ? "w-9 h-12" : "w-14 h-18")}
            sourceType="floating-cable"
            sourceId={cable.id}
          />
        ) : (
          <PlacedCardDisplay
            card={cable.card}
            placementId={cable.id}
            isDisabled={true}
            className={cn("opacity-80", compact ? "w-9 h-12" : "w-14 h-18")}
            small={compact}
          />
        )}
        {!canRearrange && (
          <div className="absolute -bottom-1 left-0 right-0 text-center">
            <span className="text-[6px] bg-yellow-500 text-black px-0.5 rounded">floating</span>
          </div>
        )}
      </div>
      
      {/* Capacity indicator */}
      <div className={cn(
        "text-center mt-0.5",
        compact ? "text-[8px]" : "text-xs",
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
                  className={cn("opacity-70", compact ? "w-6 h-8" : "w-8 h-10")}
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
                  className={cn("opacity-70", compact ? "w-6 h-8" : "w-8 h-10")}
                  small
                />
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Drop hint for empty floating cable */}
      {hasSpace && isCurrentPlayer && cable.computers.length === 0 && !compact && (
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
  compact?: boolean;
}

function CableComponent({
  cable,
  switchId,
  isCurrentPlayer,
  playerId,
  canReceiveAttacks,
  canReceiveResolutions,
  canRearrange,
  compact = false,
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
      <div className={cn(
        "absolute left-1/2 w-0.5 bg-green-500/50",
        compact ? "-top-1 h-1" : "-top-2 h-2"
      )} />
      
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
              className={compact ? "w-9 h-12" : "w-14 h-18"}
              sourceType="cable"
              sourceId={cable.id}
              parentId={switchId}
            />
          ) : (
            <PlacedCardDisplay
              card={cable.card}
              placementId={cable.id}
              isDisabled={cable.isDisabled}
              className={compact ? "w-9 h-12" : "w-14 h-18"}
              small={compact}
            />
          )}
          
          {/* Issue indicators */}
          {cable.attachedIssues.length > 0 && !canRearrange && (
            <IssueIndicator issues={cable.attachedIssues} small={compact} />
          )}
        </div>
      </DroppableZone>
      
      {/* Capacity indicator */}
      <div className={cn(
        "text-center mt-0.5",
        compact ? "text-[8px]" : "text-xs",
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
              compact={compact}
            />
          ))}
        </div>
      )}
      
      {/* Empty computer slot hint */}
      {hasSpace && isCurrentPlayer && cable.computers.length === 0 && !compact && (
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
  compact?: boolean;
}

function ComputerComponent({
  computer,
  cableId,
  isCurrentPlayer,
  playerId,
  canReceiveAttacks,
  canReceiveResolutions,
  canRearrange,
  compact = false,
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
  const sizeClass = compact ? "w-6 h-8" : "w-10 h-12";
  
  // If player can rearrange, render draggable
  if (canRearrange) {
    const content = (
      <div className="relative">
        <DraggablePlacedCard
          placedCard={computer}
          disabled={false}
          className={sizeClass}
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
          className={sizeClass}
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
          className={sizeClass}
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
  const [isReEnabled, setIsReEnabled] = useState(false);
  const prevDisabledRef = useRef(isDisabled);
  
  useEffect(() => {
    // Check if this card hasn't been animated yet (new placement)
    if (!animatedCards.has(placementId)) {
      animatedCards.add(placementId);
      setIsNew(true);
      
      // Remove animation class after animation completes
      const timer = setTimeout(() => setIsNew(false), 500);
      return () => clearTimeout(timer);
    }
  }, [placementId]);
  
  // Detect when equipment becomes re-enabled
  useEffect(() => {
    if (prevDisabledRef.current === true && isDisabled === false) {
      setIsReEnabled(true);
      const timer = setTimeout(() => setIsReEnabled(false), 800);
      return () => clearTimeout(timer);
    }
    prevDisabledRef.current = isDisabled;
  }, [isDisabled]);
  
  return (
    <div
      className={cn(
        "rounded border-2 overflow-hidden transition-all duration-300 bg-black",
        isDisabled ? "border-red-500 opacity-70" : "border-gray-600",
        isNew && "animate-scale-in",
        isReEnabled && "animate-pulse",
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
      
      {/* Re-enabled glow overlay */}
      {isReEnabled && (
        <div className="absolute inset-0 bg-green-400/30 animate-pulse pointer-events-none" />
      )}
    </div>
  );
}

interface IssueIndicatorProps {
  issues: Card[];
  small?: boolean;
}

function IssueIndicator({ issues, small = false }: IssueIndicatorProps) {
  return (
    <div className={cn(
      "absolute inset-0 flex flex-col items-center justify-center gap-0.5 pointer-events-none",
    )}>
      {issues.map((issue, idx) => (
        <div
          key={idx}
          className={cn(
            "transform rotate-90 border-2 border-red-500 rounded shadow-lg",
            small ? "w-6 h-8" : "w-10 h-14"
          )}
          title={issue.name}
        >
          <img 
            src={issue.image} 
            alt={issue.name}
            className="w-full h-full object-contain bg-black/80"
          />
        </div>
      ))}
    </div>
  );
}
