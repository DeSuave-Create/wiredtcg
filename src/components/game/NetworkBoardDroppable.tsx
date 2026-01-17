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
  
  // Card height is h-15 (60px), so 4 rows = 240px + padding, 2 rows for unconnected = 120px
  const CARD_SIZE = "w-12 h-15"; // 48px × 60px
  
  return (
    <div className={cn(
      "bg-black/30 rounded-lg border border-accent-green/30 relative overflow-hidden h-full flex flex-col",
      "p-2"
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
      
      <h3 className="font-semibold text-accent-green relative z-10 text-xs mb-1">{label}</h3>
      
      {/* Connected Network Area */}
      <DroppableZone
        id={`${playerId}-board`}
        type="internet"
        accepts={isCurrentPlayer ? ['switch', 'cable-2', 'cable-3', 'computer'] : ['audit']}
        className="relative z-10"
      >
        {/* Row 1: Game mode logo */}
        <div className="flex items-center justify-center h-[60px]">
          <img 
            src="/lovable-uploads/internet-logo.png" 
            alt="Internet"
            className="object-contain w-12 h-12"
          />
        </div>
        
        {/* Connection lines from Internet to Switches */}
        {network.switches.length > 0 && (
          <div className="flex justify-center">
            <div className="w-0.5 bg-accent-green/50 h-2" />
          </div>
        )}
        
        {/* Connected Switches with cables and computers */}
        <div className="flex flex-wrap justify-center gap-2">
          {network.switches.map((sw) => (
            <SwitchComponent
              key={sw.id}
              switchNode={sw}
              isCurrentPlayer={isCurrentPlayer}
              playerId={playerId}
              canReceiveAttacks={canReceiveAttacks}
              canReceiveResolutions={canReceiveResolutions}
              canRearrange={canRearrange}
              cardSize={CARD_SIZE}
            />
          ))}
          
          {network.switches.length === 0 && isCurrentPlayer && (
            <div className="text-center text-muted-foreground text-xs py-4 w-full">
              Drag equipment cards here to place them
            </div>
          )}
        </div>
      </DroppableZone>
      
      {/* Unconnected Section - 2 cards tall (120px) */}
      {(hasFloatingEquipment || (network.switches.length === 0 && isCurrentPlayer)) && (
        <div className="border-t border-dashed border-yellow-500/50 mt-3 pt-3 min-h-[120px] relative z-10">
          <div className="flex items-center gap-1 text-yellow-500 mb-1 text-[10px]">
            <Unplug className="w-3 h-3" />
            <span>Unconnected</span>
          </div>
          
          <div className="flex flex-wrap gap-2 items-start">
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
                cardSize={CARD_SIZE}
              />
            ))}
            
            {/* Floating Computers */}
            {network.floatingComputers.map((comp) => (
              <div key={comp.id} className="relative">
                {canRearrange ? (
                  <DraggablePlacedCard
                    placedCard={comp}
                    disabled={false}
                    className={cn("opacity-70", CARD_SIZE)}
                    small
                    sourceType="floating-computer"
                    sourceId={comp.id}
                  />
                ) : (
                  <PlacedCardDisplay
                    card={comp.card}
                    placementId={comp.id}
                    isDisabled={true}
                    className={cn("opacity-70", CARD_SIZE)}
                    small
                  />
                )}
                <div className="absolute -bottom-1 left-0 right-0 text-center">
                  <span className="text-[6px] bg-yellow-500 text-black px-0.5 rounded">floating</span>
                </div>
              </div>
            ))}
            
            {!hasFloatingEquipment && network.switches.length === 0 && (
              <div className="text-center text-muted-foreground text-xs py-2 w-full">
                Drag any equipment card here
              </div>
            )}
          </div>
        </div>
      )}
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
  cardSize: string;
}

function SwitchComponent({
  switchNode,
  isCurrentPlayer,
  playerId,
  canReceiveAttacks,
  canReceiveResolutions,
  canRearrange,
  cardSize,
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
    <div className="relative flex flex-col items-center min-w-[60px]">
      {/* Connection line to Internet */}
      <div className="w-0.5 bg-accent-green/50 mb-1 h-2" />
      
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
            className={cardSize}
            small
          />
          
          {/* Issue indicators */}
          {switchNode.attachedIssues.length > 0 && (
            <IssueIndicator issues={switchNode.attachedIssues} small />
          )}
        </div>
      </DroppableZone>
      
      {/* Cables - vertical stack below switch */}
      {switchNode.cables.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1 mt-1">
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
              cardSize={cardSize}
            />
          ))}
        </div>
      )}
      
      {/* Empty cable slot hint */}
      {switchNode.cables.length === 0 && isCurrentPlayer && (
        <div className="text-center text-[10px] text-muted-foreground mt-1">
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
  cardSize: string;
}

function FloatingCableComponent({
  cable,
  isCurrentPlayer,
  playerId,
  canReceiveAttacks,
  canReceiveResolutions,
  canRearrange,
  cardSize,
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
    <div className="relative bg-yellow-500/10 rounded-lg border border-dashed border-yellow-500/50 p-1">
      <div className="relative">
        {canRearrange ? (
          <DraggablePlacedCard
            placedCard={cable}
            disabled={false}
            className={cn("opacity-80", cardSize)}
            sourceType="floating-cable"
            sourceId={cable.id}
          />
        ) : (
          <PlacedCardDisplay
            card={cable.card}
            placementId={cable.id}
            isDisabled={true}
            className={cn("opacity-80", cardSize)}
            small
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
        "text-center mt-0.5 text-[8px]",
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
                  className={cn("opacity-70", cardSize)}
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
                  className={cn("opacity-70", cardSize)}
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
          ↑ Drop PC
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
  cardSize: string;
}

function CableComponent({
  cable,
  switchId,
  isCurrentPlayer,
  playerId,
  canReceiveAttacks,
  canReceiveResolutions,
  canRearrange,
  cardSize,
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
  
  // Calculate width based on number of computers
  const containerWidth = Math.max(1, cable.computers.length) * 56; // 48px card + 8px gap

  return (
    <div className="relative flex flex-col items-center" style={{ minWidth: `${Math.max(56, containerWidth)}px` }}>
      {/* Connection line to Switch */}
      <div className="w-0.5 bg-green-500/50 h-2" />
      
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
              className={cardSize}
              sourceType="cable"
              sourceId={cable.id}
              parentId={switchId}
              showIssueIndicator
              isCascadeDisabled={cable.isDisabled && cable.attachedIssues.length === 0}
            />
          ) : (
            <PlacedCardDisplay
              card={cable.card}
              placementId={cable.id}
              isDisabled={cable.isDisabled}
              isCascadeDisabled={cable.isDisabled && cable.attachedIssues.length === 0}
              className={cardSize}
              small
            />
          )}
          
          {/* Issue indicators - always show when there are issues */}
          {cable.attachedIssues.length > 0 && (
            <IssueIndicator issues={cable.attachedIssues} small />
          )}
          
          {/* Capacity indicator on cable */}
          <div className={cn(
            "absolute -bottom-3 left-1/2 -translate-x-1/2 text-[8px] bg-black/60 px-1 rounded",
            hasSpace ? "text-muted-foreground" : "text-red-400"
          )}>
            {cable.computers.length}/{cable.maxComputers}
          </div>
        </div>
      </DroppableZone>
      
      {/* Connection line to computers */}
      {cable.computers.length > 0 && (
        <div className="w-0.5 bg-green-500/50 h-2 mt-3" />
      )}
      
      {/* Computers - horizontal row below cable */}
      {cable.computers.length > 0 && (
        <div className="flex gap-2 justify-center">
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
              cardSize={cardSize}
            />
          ))}
        </div>
      )}
      
      {/* Empty computer slot hint */}
      {hasSpace && isCurrentPlayer && cable.computers.length === 0 && (
        <div className="text-center text-[8px] text-muted-foreground mt-4">
          ↓ Drop PC
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
  cardSize: string;
}

function ComputerComponent({
  computer,
  cableId,
  isCurrentPlayer,
  playerId,
  canReceiveAttacks,
  canReceiveResolutions,
  canRearrange,
  cardSize,
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
  const sizeClass = cardSize;
  
  // Determine if cascade disabled (parent is attacked, not self)
  const isCascadeDisabled = computer.isDisabled && computer.attachedIssues.length === 0;
  
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
          showIssueIndicator
          isCascadeDisabled={isCascadeDisabled}
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
          isCascadeDisabled={isCascadeDisabled}
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
          isCascadeDisabled={isCascadeDisabled}
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
  isCascadeDisabled?: boolean; // Disabled due to parent, not direct attack
  className?: string;
  small?: boolean;
}

// Track which cards have been animated
const animatedCards = new Set<string>();

function PlacedCardDisplay({ card, placementId, isDisabled, isCascadeDisabled = false, className, small = false }: PlacedCardDisplayProps) {
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
        "rounded border-2 overflow-hidden transition-all duration-300 bg-black relative",
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
      
      {/* Cascade disabled glow - pulsing red shadow for equipment disabled by parent attack */}
      {isCascadeDisabled && (
        <div className="absolute inset-0 rounded animate-pulse pointer-events-none shadow-[0_0_12px_4px_rgba(239,68,68,0.5)]" />
      )}
      
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
            small ? "w-12 h-16" : "w-20 h-28"
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
