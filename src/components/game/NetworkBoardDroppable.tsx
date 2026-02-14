import { PlayerNetwork, SwitchNode, CableNode, PlacedCard, Card, FloatingCable } from '@/types/game';
import { DroppableZone } from './DroppableZone';
import { DraggablePlacedCard } from './DraggablePlacedCard';
import { NetworkConnectionLines } from './NetworkConnectionLines';
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
  canRearrange?: boolean;
  compact?: boolean;
  showEasyModeHints?: boolean;
  onMobilePlacement?: (dropZoneId: string, dropZoneType: string) => void;
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
  const boardRef = useRef<HTMLDivElement>(null);
  
  const hasFloatingEquipment = network.floatingCables.length > 0 || network.floatingComputers.length > 0;
  
  const CARD_SIZE = isMobile ? "w-10 h-12" : "w-12 h-15";
  
  return (
    <div 
      ref={boardRef}
      className={cn(
        "bg-black/30 rounded-lg border border-accent-green/30 relative flex flex-col",
        isMobile ? "p-1" : "p-2"
      )}
    >
      {/* SVG Connection Lines */}
      <NetworkConnectionLines network={network} containerRef={boardRef} />
      
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
      
      {/* Connected Network Area - Column-based layout */}
      <DroppableZone
        id={`${playerId}-board`}
        type="internet"
        accepts={isCurrentPlayer ? ['switch', 'cable-2', 'cable-3', 'computer'] : ['audit']}
        className="relative z-10"
        onMobileTap={() => onMobilePlacement?.(`${playerId}-board`, 'internet')}
      >
        {/* Row 1: Internet Logo */}
        <div className={cn(
          "flex items-center justify-center",
          isMobile ? "h-[50px]" : "h-[60px]"
        )}>
          <div data-internet className="flex items-center justify-center">
            <img 
              src="/lovable-uploads/internet-logo.png" 
              alt="Internet"
              className={cn("object-contain", isMobile ? "w-8 h-8" : "w-12 h-12")}
            />
          </div>
        </div>
        
        {/* Switch Columns - each switch with its cables and computers grouped vertically */}
        {network.switches.length > 0 ? (
          <div className={cn(
            "flex justify-center gap-14 py-2",
            isMobile && "overflow-x-auto flex-nowrap min-w-min px-2"
          )}>
            {network.switches.map((sw) => (
              <div key={sw.id} className="flex flex-col items-center gap-6">
                {/* Switch */}
                <SwitchCard
                  switchNode={sw}
                  isCurrentPlayer={isCurrentPlayer}
                  playerId={playerId}
                  canReceiveAttacks={canReceiveAttacks}
                  canReceiveResolutions={canReceiveResolutions}
                  canRearrange={canRearrange}
                  cardSize={CARD_SIZE}
                  onMobilePlacement={onMobilePlacement}
                />
                
                {/* Cables under this switch - laid out horizontally */}
                {sw.cables.length > 0 ? (
                  <div className="flex gap-6 justify-center">
                    {sw.cables.map((cable) => (
                      <div key={cable.id} className="flex flex-col items-center gap-4">
                        {/* Cable */}
                        <CableCard
                          cable={cable}
                          switchId={sw.id}
                          isCurrentPlayer={isCurrentPlayer}
                          playerId={playerId}
                          canReceiveAttacks={canReceiveAttacks}
                          canReceiveResolutions={canReceiveResolutions}
                          canRearrange={canRearrange}
                          cardSize={CARD_SIZE}
                          onMobilePlacement={onMobilePlacement}
                        />
                        
                        {/* Computers under this cable */}
                        {cable.computers.length > 0 && (
                          <div className="flex gap-2 justify-center">
                            {cable.computers.map((comp) => (
                              <ComputerCard
                                key={comp.id}
                                computer={comp}
                                cableId={cable.id}
                                isCurrentPlayer={isCurrentPlayer}
                                playerId={playerId}
                                canReceiveAttacks={canReceiveAttacks}
                                canReceiveResolutions={canReceiveResolutions}
                                canRearrange={canRearrange}
                                cardSize={CARD_SIZE}
                                onMobilePlacement={onMobilePlacement}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className={cn(
            "flex items-center justify-center",
            isMobile ? "h-[85px]" : "h-[100px]"
          )}>
            <span className="text-muted-foreground/40 text-[10px]">Switches / Cables / Computers</span>
          </div>
        )}
      </DroppableZone>
      
      {/* Row 5: Unconnected Equipment Section - Always visible with 3 rows of space */}
      <div className={cn(
        "relative z-10",
        isMobile ? "mt-1 pt-1 h-[165px]" : "mt-2 pt-2 h-[220px]"
      )}>
        <div className="flex items-center gap-1 text-muted-foreground mb-1 text-[10px]">
          <Unplug className="w-3 h-3" />
          <span>Unconnected</span>
        </div>
        
        <div className={cn(
          "flex gap-2 items-start flex-wrap content-start",
          isMobile ? "overflow-y-auto pb-2" : ""
        )}>
          {/* Floating Cables */}
          {network.floatingCables.map((cable) => (
            <FloatingCableCard
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
          {network.floatingComputers.map((comp) => (
            <FloatingComputerCard
              key={comp.id}
              computer={comp}
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
          
          {!hasFloatingEquipment && (
            <span className="text-muted-foreground/40 text-[10px]">
              No unconnected equipment
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ============== Individual Card Components ==============

interface SwitchCardProps {
  switchNode: SwitchNode;
  isCurrentPlayer: boolean;
  playerId: string;
  canReceiveAttacks: boolean;
  canReceiveResolutions: boolean;
  canRearrange: boolean;
  cardSize: string;
  onMobilePlacement?: (dropZoneId: string, dropZoneType: string) => void;
}

function SwitchCard({
  switchNode,
  isCurrentPlayer,
  playerId,
  canReceiveAttacks,
  canReceiveResolutions,
  canRearrange,
  cardSize,
  onMobilePlacement,
}: SwitchCardProps) {
  const getEquipmentAccepts = (): string[] => {
    const accepts: string[] = [];
    if (isCurrentPlayer) accepts.push('cable-2', 'cable-3');
    if (canReceiveAttacks) accepts.push('hacked', 'power-outage', 'new-hire');
    if (canReceiveResolutions && switchNode.attachedIssues.length > 0) {
      accepts.push('secured', 'powered', 'trained', 'helpdesk');
    }
    return accepts;
  };

  return (
    <DroppableZone
      id={`${playerId}-switch-${switchNode.id}`}
      type={canReceiveAttacks ? 'opponent-equipment' : isCurrentPlayer ? 'switch' : 'own-equipment'}
      accepts={getEquipmentAccepts()}
      className="w-fit"
      onMobileTap={() => onMobilePlacement?.(`${playerId}-switch-${switchNode.id}`, 'switch')}
    >
      <div className="relative" data-equipment-id={switchNode.id}>
        {canRearrange ? (
          <DraggablePlacedCard
            placedCard={switchNode}
            disabled={false}
            className={cardSize}
            sourceType="switch"
            sourceId={switchNode.id}
            showIssueIndicator
          />
        ) : (
          <PlacedCardDisplay
            card={switchNode.card}
            placementId={switchNode.id}
            isDisabled={switchNode.isDisabled}
            className={cardSize}
            small
          />
        )}
        
        {switchNode.attachedIssues.length > 0 && !canRearrange && (
          <IssueIndicator issues={switchNode.attachedIssues} small />
        )}
        
        {/* Capacity indicator */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[8px] bg-black/60 px-1 rounded text-muted-foreground">
          {switchNode.cables.length} cables
        </div>
      </div>
    </DroppableZone>
  );
}

interface CableCardProps {
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

function CableCard({
  cable,
  switchId,
  isCurrentPlayer,
  playerId,
  canReceiveAttacks,
  canReceiveResolutions,
  canRearrange,
  cardSize,
  onMobilePlacement,
}: CableCardProps) {
  const hasSpace = cable.computers.length < cable.maxComputers;
  const isCascadeDisabled = cable.isDisabled && cable.attachedIssues.length === 0;
  
  const getEquipmentAccepts = (): string[] => {
    const accepts: string[] = [];
    if (isCurrentPlayer && hasSpace) accepts.push('computer');
    if (canReceiveAttacks) accepts.push('hacked', 'power-outage', 'new-hire');
    if (canReceiveResolutions && cable.attachedIssues.length > 0) {
      accepts.push('secured', 'powered', 'trained', 'helpdesk');
    }
    return accepts;
  };

  return (
    <DroppableZone
      id={`${playerId}-cable-${cable.id}`}
      type={canReceiveAttacks ? 'opponent-equipment' : isCurrentPlayer ? 'cable' : 'own-equipment'}
      accepts={getEquipmentAccepts()}
      className="w-fit"
      onMobileTap={() => onMobilePlacement?.(`${playerId}-cable-${cable.id}`, 'cable')}
    >
      <div className="relative" data-equipment-id={cable.id}>
        {canRearrange ? (
          <DraggablePlacedCard
            placedCard={cable}
            disabled={false}
            className={cardSize}
            sourceType="cable"
            sourceId={cable.id}
            parentId={switchId}
            showIssueIndicator
            isCascadeDisabled={isCascadeDisabled}
          />
        ) : (
          <PlacedCardDisplay
            card={cable.card}
            placementId={cable.id}
            isDisabled={cable.isDisabled}
            isCascadeDisabled={isCascadeDisabled}
            className={cardSize}
            small
          />
        )}
        
        {cable.attachedIssues.length > 0 && !canRearrange && (
          <IssueIndicator issues={cable.attachedIssues} small />
        )}
        
        {/* Capacity indicator */}
        <div className={cn(
          "absolute -bottom-3 left-1/2 -translate-x-1/2 text-[8px] bg-black/60 px-1 rounded",
          hasSpace ? "text-muted-foreground" : "text-red-400"
        )}>
          {cable.computers.length}/{cable.maxComputers}
        </div>
      </div>
    </DroppableZone>
  );
}

interface ComputerCardProps {
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

function ComputerCard({
  computer,
  cableId,
  isCurrentPlayer,
  playerId,
  canReceiveAttacks,
  canReceiveResolutions,
  canRearrange,
  cardSize,
  onMobilePlacement,
}: ComputerCardProps) {
  const isCascadeDisabled = computer.isDisabled && computer.attachedIssues.length === 0;
  
  const getEquipmentAccepts = (): string[] => {
    const accepts: string[] = [];
    if (canReceiveAttacks) accepts.push('hacked', 'power-outage', 'new-hire');
    if (canReceiveResolutions && computer.attachedIssues.length > 0) {
      accepts.push('secured', 'powered', 'trained', 'helpdesk');
    }
    return accepts;
  };
  
  const accepts = getEquipmentAccepts();
  
  const content = (
    <div className="relative" data-equipment-id={computer.id}>
      {canRearrange ? (
        <DraggablePlacedCard
          placedCard={computer}
          disabled={false}
          className={cardSize}
          small
          sourceType="computer"
          sourceId={computer.id}
          parentId={cableId}
          showIssueIndicator
          isCascadeDisabled={isCascadeDisabled}
        />
      ) : (
        <PlacedCardDisplay
          card={computer.card}
          placementId={computer.id}
          isDisabled={computer.isDisabled}
          isCascadeDisabled={isCascadeDisabled}
          className={cardSize}
          small
        />
      )}
      
      {computer.attachedIssues.length > 0 && !canRearrange && (
        <IssueIndicator issues={computer.attachedIssues} small />
      )}
    </div>
  );
  
  if (accepts.length > 0) {
    return (
      <DroppableZone
        id={`${playerId}-computer-${computer.id}`}
        type={canReceiveAttacks ? 'opponent-equipment' : 'own-equipment'}
        accepts={accepts}
        className="w-fit"
        onMobileTap={() => onMobilePlacement?.(`${playerId}-computer-${computer.id}`, 'computer')}
      >
        {content}
      </DroppableZone>
    );
  }
  
  return content;
}

// ============== Floating Equipment Components ==============

interface FloatingCableCardProps {
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

function FloatingCableCard({
  cable,
  isCurrentPlayer,
  playerId,
  canReceiveAttacks,
  canReceiveResolutions,
  canRearrange,
  cardSize,
  showEasyModeHints = false,
  onMobilePlacement,
}: FloatingCableCardProps) {
  const hasSpace = cable.computers.length < cable.maxComputers;
  const hasIssues = cable.attachedIssues.length > 0;
  
  const getAccepts = (): string[] => {
    const accepts: string[] = [];
    if (isCurrentPlayer && hasSpace) accepts.push('computer');
    if (canReceiveAttacks) accepts.push('hacked', 'power-outage', 'new-hire');
    if (canReceiveResolutions && cable.attachedIssues.length > 0) {
      accepts.push('secured', 'powered', 'trained', 'helpdesk');
    }
    return accepts;
  };
  
  const accepts = getAccepts();
  
  const content = (
    <div className={cn(
      "relative bg-yellow-500/10 rounded-lg border border-dashed border-yellow-500/50 p-1",
      hasIssues && showEasyModeHints && "border-red-500 bg-red-500/10"
    )}>
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
        
        <div className="absolute -bottom-1 left-0 right-0 text-center">
          <span className="text-[6px] bg-yellow-500 text-black px-0.5 rounded">floating</span>
        </div>
        
        {hasIssues && <FloatingIssueIndicator issues={cable.attachedIssues} />}
      </div>
      
      <div className={cn(
        "text-center mt-0.5 text-[8px]",
        hasSpace ? "text-yellow-500" : "text-red-400"
      )}>
        {cable.computers.length}/{cable.maxComputers}
      </div>
      
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
    </div>
  );
  
  if (accepts.length > 0) {
    return (
      <DroppableZone
        id={`${playerId}-floating-cable-${cable.id}`}
        type="cable"
        accepts={accepts}
        className="w-fit"
        onMobileTap={() => onMobilePlacement?.(`${playerId}-floating-cable-${cable.id}`, 'cable')}
      >
        {content}
      </DroppableZone>
    );
  }
  
  return content;
}

interface FloatingComputerCardProps {
  computer: PlacedCard;
  isCurrentPlayer: boolean;
  playerId: string;
  canReceiveAttacks: boolean;
  canReceiveResolutions: boolean;
  canRearrange: boolean;
  cardSize: string;
  showEasyModeHints?: boolean;
  onMobilePlacement?: (dropZoneId: string, dropZoneType: string) => void;
}

function FloatingComputerCard({
  computer,
  isCurrentPlayer,
  playerId,
  canReceiveAttacks,
  canReceiveResolutions,
  canRearrange,
  cardSize,
  showEasyModeHints = false,
  onMobilePlacement,
}: FloatingComputerCardProps) {
  const hasIssues = computer.attachedIssues.length > 0;
  
  const getAccepts = (): string[] => {
    const accepts: string[] = [];
    if (canReceiveAttacks) accepts.push('hacked', 'power-outage', 'new-hire');
    if (canReceiveResolutions && computer.attachedIssues.length > 0) {
      accepts.push('secured', 'powered', 'trained', 'helpdesk');
    }
    return accepts;
  };
  
  const accepts = getAccepts();
  
  const content = (
    <div className={cn(
      "relative",
      hasIssues && showEasyModeHints && "animate-pulse"
    )}>
      {hasIssues && showEasyModeHints && (
        <div className="absolute -top-2 -right-2 z-10">
          <AlertTriangle className="w-4 h-4 text-red-500 animate-bounce" />
        </div>
      )}
      
      {canRearrange ? (
        <DraggablePlacedCard
          placedCard={computer}
          disabled={false}
          className={cn("opacity-70", cardSize)}
          small
          sourceType="floating-computer"
          sourceId={computer.id}
          showIssueIndicator={false}
        />
      ) : (
        <div className="relative">
          <PlacedCardDisplay
            card={computer.card}
            placementId={computer.id}
            isDisabled={computer.isDisabled}
            className={cn("opacity-70", cardSize)}
            small
          />
        </div>
      )}
      
      {hasIssues && <FloatingIssueIndicator issues={computer.attachedIssues} />}
      
      <div className="absolute -bottom-1 left-0 right-0 text-center">
        <span className="text-[6px] bg-yellow-500 text-black px-0.5 rounded">floating</span>
      </div>
    </div>
  );
  
  if (accepts.length > 0) {
    return (
      <DroppableZone
        id={`${playerId}-floating-computer-${computer.id}`}
        type="computer"
        accepts={accepts}
        className="w-fit"
        onMobileTap={() => onMobilePlacement?.(`${playerId}-floating-computer-${computer.id}`, 'computer')}
      >
        {content}
      </DroppableZone>
    );
  }
  
  return content;
}

// ============== Display Components ==============

interface PlacedCardDisplayProps {
  card: Card;
  placementId: string;
  isDisabled: boolean;
  isCascadeDisabled?: boolean;
  className?: string;
  small?: boolean;
}

const animatedCards = new Set<string>();

function PlacedCardDisplay({ card, placementId, isDisabled, isCascadeDisabled = false, className, small = false }: PlacedCardDisplayProps) {
  const [isNew, setIsNew] = useState(false);
  const [isReEnabled, setIsReEnabled] = useState(false);
  const prevDisabledRef = useRef(isDisabled);
  
  useEffect(() => {
    if (!animatedCards.has(placementId)) {
      animatedCards.add(placementId);
      setIsNew(true);
      const timer = setTimeout(() => setIsNew(false), 500);
      return () => clearTimeout(timer);
    }
  }, [placementId]);
  
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
      
      {isCascadeDisabled && (
        <div className="absolute inset-0 rounded animate-pulse pointer-events-none shadow-[0_0_12px_4px_rgba(239,68,68,0.5)]" />
      )}
      
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
  
  useEffect(() => {
    if (issues.length > prevIssueCount.current) {
      setShowImpact(true);
      const timer = setTimeout(() => setShowImpact(false), 600);
      return () => clearTimeout(timer);
    } else if (issues.length < prevIssueCount.current && prevIssueCount.current > 0) {
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
      {showImpact && (
        <>
          <div className="absolute inset-0 animate-[attack-flash_0.4s_ease-out] rounded" />
          <AttackImpactSparks />
        </>
      )}
      
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

function HealingEffect() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-green-400 animate-[heal-ring_0.6s_ease-out_forwards]" style={{ boxShadow: '0 0 15px #4ade80, 0 0 30px #22c55e' }} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-green-400 animate-[heal-ring_0.6s_ease-out_0.1s_forwards]" style={{ boxShadow: '0 0 15px #4ade80' }} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-green-400 animate-[heal-ring_0.6s_ease-out_0.2s_forwards]" style={{ boxShadow: '0 0 10px #4ade80' }} />
      
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
      
      <HealingSparkles />
      <div className="absolute inset-0 animate-[heal-flash_0.5s_ease-out] rounded" />
    </div>
  );
}

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

function FloatingIssueIndicator({ issues }: { issues: Card[] }) {
  const [showImpact, setShowImpact] = useState(false);
  const [showHealing, setShowHealing] = useState(false);
  const prevIssueCount = useRef(issues.length);
  
  useEffect(() => {
    if (issues.length > prevIssueCount.current) {
      setShowImpact(true);
      const timer = setTimeout(() => setShowImpact(false), 600);
      return () => clearTimeout(timer);
    } else if (issues.length < prevIssueCount.current && prevIssueCount.current > 0) {
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
      {showImpact && (
        <>
          <div className="absolute inset-0 animate-[attack-flash_0.4s_ease-out] rounded" />
          <AttackImpactSparks />
        </>
      )}
      
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
