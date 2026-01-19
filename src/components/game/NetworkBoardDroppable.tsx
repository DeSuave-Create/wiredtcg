import { PlayerNetwork, SwitchNode, CableNode, PlacedCard, Card, FloatingCable } from '@/types/game';
import { DroppableZone } from './DroppableZone';
import { DraggablePlacedCard } from './DraggablePlacedCard';
import { cn } from '@/lib/utils';
import { Unplug, AlertTriangle, Wrench } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useMobileGameOptional } from '@/contexts/MobileGameContext';

interface NetworkBoardDroppableProps {
  network: PlayerNetwork;
  isCurrentPlayer: boolean;
  label: string;
  playerId: string;
  canReceiveAttacks?: boolean;
  canReceiveResolutions?: boolean;
  canRearrange?: boolean; // Whether cards can be dragged to rearrange
  compact?: boolean; // Compact mode for smaller display
  showEasyModeHints?: boolean; // Show visual hints for easy mode
  onMobilePlacement?: (dropZoneId: string, dropZoneType: string) => void; // Mobile tap-to-place handler
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
  showEasyModeHints = false,
  onMobilePlacement,
}: NetworkBoardDroppableProps) {
  const mobileContext = useMobileGameOptional();
  const isMobile = mobileContext?.isMobile ?? false;
  const selectedCard = mobileContext?.selectedCard ?? null;
  const hasFloatingEquipment = network.floatingCables.length > 0 || network.floatingComputers.length > 0;
  
  // Card height is h-15 (60px), so 4 rows = 240px + padding, 2 rows for unconnected = 120px
  const CARD_SIZE = isMobile ? "w-10 h-12" : "w-12 h-15"; // Mobile: 40x48px, Desktop: 48x60px
  
  return (
    <div className={cn(
      "bg-black/30 rounded-lg border border-accent-green/30 relative h-full flex flex-col",
      isMobile ? "overflow-y-auto p-1" : "overflow-hidden p-2"
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
      
      {/* Connected Network Area - takes 2/3 of space when empty, flex-1 when switches exist */}
      <DroppableZone
        id={`${playerId}-board`}
        type="internet"
        accepts={isCurrentPlayer ? ['switch', 'cable-2', 'cable-3', 'computer'] : ['audit']}
        className={cn(
          "relative z-10",
          network.switches.length === 0 ? "flex-[2]" : "flex-1"
        )}
        onMobileTap={isMobile && selectedCard ? () => onMobilePlacement?.(`${playerId}-board`, 'internet') : undefined}
      >
        {/* Row 1: Game mode logo */}
        <div className={cn(
          "flex items-center justify-center",
          isMobile ? "h-[40px]" : "h-[60px]"
        )}>
          <img 
            src="/lovable-uploads/internet-logo.png" 
            alt="Internet"
            className={cn("object-contain", isMobile ? "w-8 h-8" : "w-12 h-12")}
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
              onMobilePlacement={onMobilePlacement}
            />
          ))}
          
          {network.switches.length === 0 && isCurrentPlayer && (
            <div className="text-center text-muted-foreground text-xs py-4 w-full">
              Drag equipment cards here to place them
            </div>
          )}
        </div>
      </DroppableZone>
      
      {/* Unconnected Section - takes 1/3 of space when no switches, otherwise min-h */}
      {(hasFloatingEquipment || (network.switches.length === 0 && isCurrentPlayer)) && (
        <div className={cn(
          "relative z-10 border-t border-yellow-500/30",
          isMobile ? "mt-1 pt-1" : "mt-3 pt-3",
          network.switches.length === 0 
            ? "flex-1" 
            : isMobile ? "min-h-[60px]" : "min-h-[120px]"
        )}>
          <div className="flex items-center gap-1 text-muted-foreground mb-1 text-[10px]">
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
                showEasyModeHints={showEasyModeHints}
                onMobilePlacement={onMobilePlacement}
              />
            ))}
            
            {/* Floating Computers */}
            {network.floatingComputers.map((comp) => {
              // Floating computers can receive attacks and resolutions
              const compAccepts: string[] = [];
              if (canReceiveAttacks) {
                compAccepts.push('hacked', 'power-outage', 'new-hire');
              }
              if (canReceiveResolutions && comp.attachedIssues.length > 0) {
                compAccepts.push('secured', 'powered', 'trained', 'helpdesk');
              }
              
              const hasIssues = comp.attachedIssues.length > 0;
              const issueTypes = comp.attachedIssues.map(i => i.subtype).join(', ');
              
              // Get resolution hint based on attack type
              const getResolutionHint = () => {
                const issues = comp.attachedIssues;
                if (issues.length === 0) return '';
                const hints: string[] = [];
                issues.forEach(issue => {
                  if (issue.subtype === 'hacked') hints.push('Use "Secured" card');
                  if (issue.subtype === 'power-outage') hints.push('Use "Powered" card');
                  if (issue.subtype === 'new-hire') hints.push('Use "Trained" card');
                });
                hints.push('Or use "Help Desk" to fix all');
                return hints.join(' • ');
              };
              
              const compContent = (
                <div className={cn(
                  "relative",
                  hasIssues && showEasyModeHints && "animate-pulse"
                )}>
                  {/* Attack indicator for easy mode */}
                  {hasIssues && showEasyModeHints && (
                    <div className="absolute -top-2 -right-2 z-10">
                      <AlertTriangle className="w-4 h-4 text-red-500 animate-bounce" />
                    </div>
                  )}
                  
                  {canRearrange ? (
                    <DraggablePlacedCard
                      placedCard={comp}
                      disabled={false}
                      className={cn("opacity-70", CARD_SIZE)}
                      small
                      sourceType="floating-computer"
                      sourceId={comp.id}
                      showIssueIndicator={false}
                    />
                  ) : (
                    <div className="relative">
                      <PlacedCardDisplay
                        card={comp.card}
                        placementId={comp.id}
                        isDisabled={comp.isDisabled}
                        className={cn("opacity-70", CARD_SIZE)}
                        small
                      />
                    </div>
                  )}
                  
                  {/* Show issues OUTSIDE the floating computer card for better visibility */}
                  {hasIssues && (
                    <FloatingIssueIndicator issues={comp.attachedIssues} />
                  )}
                  
                  <div className="absolute -bottom-1 left-0 right-0 text-center">
                    <span className="text-[6px] bg-yellow-500 text-black px-0.5 rounded">floating</span>
                  </div>
                </div>
              );
              
              // Wrap with tooltip for easy mode
              const wrappedContent = showEasyModeHints && hasIssues ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    {compContent}
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs bg-red-900/90 border-red-500">
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-1 text-red-300 font-semibold">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Under Attack!</span>
                      </div>
                      <div className="text-white">Issues: {issueTypes}</div>
                      <div className="flex items-center gap-1 text-green-300">
                        <Wrench className="w-3 h-3" />
                        <span>{getResolutionHint()}</span>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ) : compContent;
              
              if (compAccepts.length > 0) {
              return (
                  <DroppableZone
                    key={comp.id}
                    id={`${playerId}-floating-computer-${comp.id}`}
                    type="computer"
                    accepts={compAccepts}
                    className="w-fit p-2 -m-2"
                    onMobileTap={isMobile && selectedCard ? () => onMobilePlacement?.(`${playerId}-floating-computer-${comp.id}`, 'computer') : undefined}
                  >
                    {wrappedContent}
                  </DroppableZone>
                );
              }
              
              return <div key={comp.id}>{wrappedContent}</div>;
            })}
            
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
  onMobilePlacement?: (dropZoneId: string, dropZoneType: string) => void;
}

function SwitchComponent({
  switchNode,
  isCurrentPlayer,
  playerId,
  canReceiveAttacks,
  canReceiveResolutions,
  canRearrange,
  cardSize,
  onMobilePlacement,
}: SwitchComponentProps) {
  const mobileContext = useMobileGameOptional();
  const isMobile = mobileContext?.isMobile ?? false;
  const selectedCard = mobileContext?.selectedCard ?? null;
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
        className="w-fit p-2 -m-2"
        onMobileTap={isMobile && selectedCard ? () => onMobilePlacement?.(`${playerId}-switch-${switchNode.id}`, 'switch') : undefined}
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
              onMobilePlacement={onMobilePlacement}
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
  showEasyModeHints?: boolean;
  onMobilePlacement?: (dropZoneId: string, dropZoneType: string) => void;
}

function FloatingCableComponent({
  cable,
  isCurrentPlayer,
  playerId,
  canReceiveAttacks,
  canReceiveResolutions,
  canRearrange,
  cardSize,
  showEasyModeHints = false,
  onMobilePlacement,
}: FloatingCableComponentProps) {
  const mobileContext = useMobileGameOptional();
  const isMobile = mobileContext?.isMobile ?? false;
  const selectedCard = mobileContext?.selectedCard ?? null;
  const hasSpace = cable.computers.length < cable.maxComputers;
  
  // Floating cables can receive computers if there's space, and attacks/resolutions
  const getAccepts = (): string[] => {
    const accepts: string[] = [];
    if (isCurrentPlayer && hasSpace) {
      accepts.push('computer');
    }
    if (canReceiveAttacks) {
      accepts.push('hacked', 'power-outage', 'new-hire');
    }
    if (canReceiveResolutions && cable.attachedIssues.length > 0) {
      accepts.push('secured', 'powered', 'trained', 'helpdesk');
    }
    return accepts;
  };
  
  const accepts = getAccepts();
  
  const hasIssues = cable.attachedIssues.length > 0;
  const issueTypes = cable.attachedIssues.map(i => i.subtype).join(', ');
  
  // Get resolution hint based on attack type
  const getResolutionHint = () => {
    const issues = cable.attachedIssues;
    if (issues.length === 0) return '';
    const hints: string[] = [];
    issues.forEach(issue => {
      if (issue.subtype === 'hacked') hints.push('Use "Secured" card');
      if (issue.subtype === 'power-outage') hints.push('Use "Powered" card');
      if (issue.subtype === 'new-hire') hints.push('Use "Trained" card');
    });
    hints.push('Or use "Help Desk" to fix all');
    return hints.join(' • ');
  };
  
  // Wrap in DroppableZone if it can accept cards
  const content = (
    <div className={cn(
      "relative bg-yellow-500/10 rounded-lg border border-dashed border-yellow-500/50 p-1",
      hasIssues && showEasyModeHints && "border-red-500 bg-red-500/10"
    )}>
      {/* Attack indicator for easy mode */}
      {hasIssues && showEasyModeHints && (
        <div className="absolute -top-2 -right-2 z-10">
          <AlertTriangle className="w-4 h-4 text-red-500 animate-bounce" />
        </div>
      )}
      
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
            isDisabled={cable.isDisabled}
            className={cn("opacity-80", cardSize)}
            small
          />
        )}
        {!canRearrange && (
          <div className="absolute -bottom-1 left-0 right-0 text-center">
            <span className="text-[6px] bg-yellow-500 text-black px-0.5 rounded">floating</span>
          </div>
        )}
        
        {/* Show issues OUTSIDE the floating cable for better visibility */}
        {hasIssues && (
          <FloatingIssueIndicator issues={cable.attachedIssues} />
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
  
  // Wrap with tooltip for easy mode
  const wrappedContent = showEasyModeHints && hasIssues ? (
    <Tooltip>
      <TooltipTrigger asChild>
        {content}
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs bg-red-900/90 border-red-500">
        <div className="text-xs space-y-1">
          <div className="flex items-center gap-1 text-red-300 font-semibold">
            <AlertTriangle className="w-3 h-3" />
            <span>Cable Under Attack!</span>
          </div>
          <div className="text-white">Issues: {issueTypes}</div>
          <div className="flex items-center gap-1 text-green-300">
            <Wrench className="w-3 h-3" />
            <span>{getResolutionHint()}</span>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  ) : content;
  
  // If can accept computers, wrap in DroppableZone
  if (accepts.length > 0) {
    return (
      <DroppableZone
        id={`${playerId}-floating-cable-${cable.id}`}
        type="cable"
        accepts={accepts}
        className="w-fit p-2 -m-2"
        onMobileTap={isMobile && selectedCard ? () => onMobilePlacement?.(`${playerId}-floating-cable-${cable.id}`, 'cable') : undefined}
      >
        {wrappedContent}
      </DroppableZone>
    );
  }
  
  return wrappedContent;
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
  onMobilePlacement?: (dropZoneId: string, dropZoneType: string) => void;
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
  onMobilePlacement,
}: CableComponentProps) {
  const mobileContext = useMobileGameOptional();
  const isMobile = mobileContext?.isMobile ?? false;
  const selectedCard = mobileContext?.selectedCard ?? null;
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
        className="w-fit p-2 -m-2"
        onMobileTap={isMobile && selectedCard ? () => onMobilePlacement?.(`${playerId}-cable-${cable.id}`, 'cable') : undefined}
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
              onMobilePlacement={onMobilePlacement}
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
  onMobilePlacement?: (dropZoneId: string, dropZoneType: string) => void;
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
  onMobilePlacement,
}: ComputerComponentProps) {
  const mobileContext = useMobileGameOptional();
  const isMobile = mobileContext?.isMobile ?? false;
  const selectedCard = mobileContext?.selectedCard ?? null;
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
          className="w-fit p-2 -m-2"
          onMobileTap={isMobile && selectedCard ? () => onMobilePlacement?.(`${playerId}-computer-${computer.id}`, 'computer') : undefined}
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
      onMobileTap={isMobile && selectedCard ? () => onMobilePlacement?.(`${playerId}-computer-${computer.id}`, 'computer') : undefined}
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
  const [showImpact, setShowImpact] = useState(false);
  const [showHealing, setShowHealing] = useState(false);
  const prevIssueCount = useRef(issues.length);
  
  // Detect when attacks are added or removed
  useEffect(() => {
    if (issues.length > prevIssueCount.current) {
      // Attack added
      setShowImpact(true);
      const timer = setTimeout(() => setShowImpact(false), 600);
      return () => clearTimeout(timer);
    } else if (issues.length < prevIssueCount.current && prevIssueCount.current > 0) {
      // Attack removed - show healing
      setShowHealing(true);
      const timer = setTimeout(() => setShowHealing(false), 800);
      prevIssueCount.current = issues.length;
      return () => clearTimeout(timer);
    }
    prevIssueCount.current = issues.length;
  }, [issues.length]);
  
  return (
    <div className={cn(
      "absolute inset-0 flex flex-col items-center justify-center gap-0.5 pointer-events-none",
      showImpact && "animate-[equipment-shake_0.5s_ease-out]"
    )}>
      {/* Impact flash for attacks */}
      {showImpact && (
        <>
          <div className="absolute inset-0 animate-[attack-flash_0.4s_ease-out] rounded" />
          <AttackImpactSparks />
        </>
      )}
      
      {/* Healing effect for resolutions */}
      {showHealing && <HealingEffect />}
      
      {issues.map((issue, idx) => (
        <div
          key={`${issue.id}-${idx}`}
          className={cn(
            "transform rotate-90 border-2 border-red-500 rounded shadow-lg shadow-red-500/50",
            small ? "w-12 h-16" : "w-20 h-28",
            idx === issues.length - 1 && showImpact && "animate-[attack-land_0.5s_ease-out]"
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

// Healing effect with green cross and glow
function HealingEffect() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
      {/* Expanding green glow rings */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-green-400 animate-[heal-ring_0.6s_ease-out_forwards]" style={{ boxShadow: '0 0 15px #4ade80, 0 0 30px #22c55e' }} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-green-400 animate-[heal-ring_0.6s_ease-out_0.1s_forwards]" style={{ boxShadow: '0 0 15px #4ade80' }} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-green-400 animate-[heal-ring_0.6s_ease-out_0.2s_forwards]" style={{ boxShadow: '0 0 10px #4ade80' }} />
      
      {/* Green cross icon */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-[heal-cross_0.6s_ease-out_forwards]">
        <svg viewBox="0 0 24 24" className="w-10 h-10" style={{ filter: 'drop-shadow(0 0 8px #4ade80) drop-shadow(0 0 16px #22c55e)' }}>
          <path
            d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6V3z"
            fill="url(#heal-gradient)"
            stroke="#bbf7d0"
            strokeWidth="0.5"
          />
          <defs>
            <linearGradient id="heal-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#86efac" />
              <stop offset="50%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {/* Sparkle particles */}
      <HealingSparkles />
      
      {/* Green flash overlay */}
      <div className="absolute inset-0 animate-[heal-flash_0.5s_ease-out] rounded" />
    </div>
  );
}

// Sparkle particles for healing
function HealingSparkles() {
  const sparkles = Array.from({ length: 6 }).map((_, i) => {
    const angle = (360 / 6) * i + Math.random() * 30;
    const distance = 25 + Math.random() * 15;
    const x = Math.cos((angle * Math.PI) / 180) * distance;
    const y = Math.sin((angle * Math.PI) / 180) * distance;
    const delay = Math.random() * 0.2;
    return { x, y, delay };
  });
  
  return (
    <>
      {sparkles.map((sparkle, i) => (
        <div
          key={i}
          className="absolute left-1/2 top-1/2 w-2 h-2"
          style={{
            '--sparkle-x': `${sparkle.x}px`,
            '--sparkle-y': `${sparkle.y}px`,
            animation: `heal-sparkle 0.6s ease-out ${sparkle.delay}s forwards`,
          } as React.CSSProperties}
        >
          <svg viewBox="0 0 16 16" className="w-full h-full">
            <polygon points="8,0 10,6 16,8 10,10 8,16 6,10 0,8 6,6" fill="#4ade80" style={{ filter: 'drop-shadow(0 0 4px #4ade80)' }} />
          </svg>
        </div>
      ))}
    </>
  );
}

// Spark particles for attack impact
function AttackImpactSparks() {
  const sparks = Array.from({ length: 8 }).map((_, i) => {
    const angle = (360 / 8) * i;
    const distance = 30 + Math.random() * 20;
    const x = Math.cos((angle * Math.PI) / 180) * distance;
    const y = Math.sin((angle * Math.PI) / 180) * distance;
    return { x, y, delay: Math.random() * 0.1 };
  });
  
  return (
    <>
      {sparks.map((spark, i) => (
        <div
          key={i}
          className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full bg-orange-400"
          style={{
            '--spark-x': `${spark.x}px`,
            '--spark-y': `${spark.y}px`,
            animation: `attack-spark 0.4s ease-out ${spark.delay}s forwards`,
            boxShadow: '0 0 6px #f97316, 0 0 12px #ef4444',
          } as React.CSSProperties}
        />
      ))}
      {/* Central fire burst */}
      <div 
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(250,204,21,0.8) 0%, rgba(249,115,22,0.6) 40%, transparent 70%)',
          animation: 'fire-burst 0.4s ease-out forwards',
        }}
      />
    </>
  );
}

// Floating issue indicator - displayed ON TOP of the card for visibility
function FloatingIssueIndicator({ issues }: { issues: Card[] }) {
  const [showImpact, setShowImpact] = useState(false);
  const [showHealing, setShowHealing] = useState(false);
  const prevIssueCount = useRef(issues.length);
  
  // Detect when attacks are added or removed
  useEffect(() => {
    if (issues.length > prevIssueCount.current) {
      // Attack added
      setShowImpact(true);
      const timer = setTimeout(() => setShowImpact(false), 600);
      return () => clearTimeout(timer);
    } else if (issues.length < prevIssueCount.current && prevIssueCount.current > 0) {
      // Attack removed - show healing
      setShowHealing(true);
      const timer = setTimeout(() => setShowHealing(false), 800);
      prevIssueCount.current = issues.length;
      return () => clearTimeout(timer);
    }
    prevIssueCount.current = issues.length;
  }, [issues.length]);
  
  return (
    <div className={cn(
      "absolute inset-0 flex items-center justify-center z-20 pointer-events-none",
      showImpact && "animate-[equipment-shake_0.5s_ease-out]"
    )}>
      {/* Impact flash for attacks */}
      {showImpact && (
        <>
          <div className="absolute inset-0 animate-[attack-flash_0.4s_ease-out] rounded" />
          <AttackImpactSparks />
        </>
      )}
      
      {/* Healing effect for resolutions */}
      {showHealing && <HealingEffect />}
      
      {issues.map((issue, idx) => (
        <div
          key={`${issue.id}-${idx}`}
          className={cn(
            "transform rotate-90 border-2 border-red-500 rounded shadow-lg shadow-red-500/50 w-10 h-14 bg-black/90",
            idx === issues.length - 1 && showImpact && "animate-[attack-land_0.5s_ease-out]"
          )}
          title={issue.name}
        >
          <img 
            src={issue.image} 
            alt={issue.name}
            className="w-full h-full object-contain"
          />
        </div>
      ))}
    </div>
  );
}
