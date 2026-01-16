import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, pointerWithin, CollisionDetection, DroppableContainer } from '@dnd-kit/core';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useGameEngine } from '@/hooks/useGameEngine';
import { PlayerHandDraggable } from '@/components/game/PlayerHandDraggable';
import { NetworkBoardDroppable } from '@/components/game/NetworkBoardDroppable';
import { ClassificationSection } from '@/components/game/ClassificationSection';
import { GameControlsSimple } from '@/components/game/GameControlsSimple';
import { GameLog } from '@/components/game/GameLog';
import { ScoreDisplay } from '@/components/game/ScoreDisplay';
import { DiscardZone } from '@/components/game/DiscardZone';
import { ConnectComputersDialog } from '@/components/game/ConnectComputersDialog';
import { ConnectCablesDialog } from '@/components/game/ConnectCablesDialog';
import { StealClassificationDialog } from '@/components/game/StealClassificationDialog';
import { Card } from '@/types/game';
import { toast } from 'sonner';

// Custom collision detection that prefers specific targets over board zones
const preferSpecificTargets: CollisionDetection = (args) => {
  const collisions = pointerWithin(args);
  
  if (collisions.length <= 1) {
    return collisions;
  }
  
  // Sort to prefer specific targets (switch, cable, floating-cable) over board
  const sorted = [...collisions].sort((a, b) => {
    const aId = String(a.id);
    const bId = String(b.id);
    
    // Board zones should have lowest priority
    const aIsBoard = aId.includes('-board');
    const bIsBoard = bId.includes('-board');
    
    if (aIsBoard && !bIsBoard) return 1;  // a goes after b
    if (!aIsBoard && bIsBoard) return -1; // a goes before b
    
    return 0;
  });
  
  // Return only the highest priority collision
  return sorted.slice(0, 1);
};

const Simulation = () => {
  const {
    gameState,
    initializeGame,
    playSwitch,
    playCable,
    playComputer,
    playAttack,
    playResolution,
    playClassification,
    discardCard,
    endPhase,
    executeAITurn,
    countConnectedComputers,
    connectFloatingComputersToCable,
    connectFloatingCablesToSwitch,
    moveEquipment,
  } = useGameEngine();

  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [activePlacedCard, setActivePlacedCard] = useState<{
    card: Card;
    sourceType: 'switch' | 'cable' | 'computer' | 'floating-cable' | 'floating-computer';
    sourceId: string;
    parentId?: string;
  } | null>(null);
  
  // Dialog state for connecting floating computers
  const [connectDialog, setConnectDialog] = useState<{
    isOpen: boolean;
    cableId: string;
    maxConnections: number;
    cableType: string;
  } | null>(null);
  
  // Dialog state for connecting floating cables to a new switch
  const [cableDialog, setCableDialog] = useState<{
    isOpen: boolean;
    switchId: string;
  } | null>(null);
  
  // Dialog state for stealing classifications
  const [stealDialog, setStealDialog] = useState<{
    isOpen: boolean;
    cardId: string;
    cardName: string;
  } | null>(null);

  // Initialize game on mount
  useEffect(() => {
    initializeGame('You');
  }, [initializeGame]);

  // Track previous classifications to detect steals
  const [prevHumanClassCount, setPrevHumanClassCount] = useState<number>(0);

  // Execute AI turn when it's computer's turn
  useEffect(() => {
    if (!gameState) return;
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (!currentPlayer.isHuman && gameState.phase !== 'game-over') {
      const timer = setTimeout(() => {
        executeAITurn();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState?.currentPlayerIndex, gameState?.phase, executeAITurn]);

  // Detect when AI steals a classification and show visual feedback
  useEffect(() => {
    if (!gameState) return;
    
    const humanClassCount = gameState.players[0].classificationCards.length;
    
    // Check if human lost a classification (AI stole it)
    if (prevHumanClassCount > 0 && humanClassCount < prevHumanClassCount) {
      const lastLog = gameState.gameLog[gameState.gameLog.length - 1];
      if (lastLog?.includes('steal') || lastLog?.includes('Steal')) {
        toast.error('🎯 Your classification was stolen!', {
          duration: 3000,
          style: {
            background: '#7c2d12',
            border: '2px solid #f97316',
            color: '#fed7aa',
          },
        });
      }
    }
    
    setPrevHumanClassCount(humanClassCount);
  }, [gameState?.players[0].classificationCards.length]);

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current;
    const card = data?.card as Card;
    
    // Check if this is a placed card being dragged
    if (data?.isPlaced) {
      setActivePlacedCard({
        card,
        sourceType: data.sourceType,
        sourceId: data.sourceId,
        parentId: data.parentId,
      });
      setActiveCard(card);
    } else {
      setActiveCard(card);
      setActivePlacedCard(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const droppedCard = activeCard;
    const droppedPlacedCard = activePlacedCard;
    setActiveCard(null);
    setActivePlacedCard(null);
    
    const { active, over } = event;
    if (!over || !gameState) {
      // Dropped outside valid zone
      if (droppedCard && !droppedPlacedCard) {
        showCardHint(droppedCard);
      }
      return;
    }

    const data = active.data.current;
    const card = data?.card as Card;
    const dropZoneId = over.id as string;
    const dropData = over.data.current;

    if (!card) return;

    // Parse the drop zone ID
    const parts = dropZoneId.split('-');
    const targetPlayerId = parts[0] + '-' + parts[1]; // e.g., "player-1" or "player-2"
    const zoneType = parts[2]; // e.g., "internet", "switch", "cable", "computer", "discard", "floating", "board"

    const isHumanTarget = targetPlayerId === 'player-1';
    const isComputerTarget = targetPlayerId === 'player-2';
    const computerPlayerIndex = 1;
    
    // === Handle PLACED CARD being moved (rearranging) ===
    if (droppedPlacedCard && isHumanTarget) {
      const { sourceType, sourceId } = droppedPlacedCard;
      
      // Determine target type and ID
      let targetType: 'switch' | 'cable' | 'floating' | 'board' = 'board';
      let targetId: string | undefined;
      
      if (zoneType === 'switch') {
        targetType = 'switch';
        targetId = dropZoneId.replace(`${targetPlayerId}-switch-`, '');
      } else if (zoneType === 'cable') {
        targetType = 'cable';
        targetId = dropZoneId.replace(`${targetPlayerId}-cable-`, '');
      } else if (zoneType === 'floating') {
        targetType = 'cable';
        targetId = dropZoneId.replace(`${targetPlayerId}-floating-cable-`, '');
      } else if (zoneType === 'board' || zoneType === 'internet') {
        targetType = 'floating';
      }
      
      // Don't move to same location
      if (targetId === sourceId) {
        return;
      }
      
      moveEquipment(sourceType, sourceId, targetType, targetId);
      toast.success('Equipment moved!');
      return;
    }

    // === Handle HAND CARD being played ===
    
    // Check if this card type is accepted (only for non-placed cards)
    if (!droppedPlacedCard && dropData) {
      const accepts = dropData.accepts as string[];
      if (!accepts.includes(card.subtype)) {
        showCardHint(card);
        return;
      }
    }

    // Handle discard
    if (zoneType === 'discard') {
      discardCard(card.id);
      toast.success('Card discarded');
      return;
    }

    // Handle equipment cards (only on own network)
    if (card.type === 'equipment' && isHumanTarget) {
      if (card.subtype === 'switch') {
        const result = playSwitch(card.id);
        if (result.success) {
          toast.success('Switch placed!');
          
          // Check if there are floating cables to connect
          const humanPlayer = gameState!.players[0];
          if (humanPlayer.network.floatingCables.length > 0 && result.switchId) {
            setCableDialog({
              isOpen: true,
              switchId: result.switchId,
            });
          }
        }
      } else if (card.subtype === 'cable-2' || card.subtype === 'cable-3') {
        // If dropped on a switch, connect to it; otherwise floating
        const switchId = zoneType === 'switch' 
          ? dropZoneId.replace(`${targetPlayerId}-switch-`, '')
          : undefined;
        const result = playCable(card.id, switchId);
        
        if (result.success) {
          toast.success(switchId ? 'Cable connected to switch!' : 'Cable placed (floating - drag onto a switch to connect)');
          
          // Check if there are floating computers to connect
          const humanPlayer = gameState!.players[0];
          if (humanPlayer.network.floatingComputers.length > 0 && result.cableId && result.maxComputers) {
            setConnectDialog({
              isOpen: true,
              cableId: result.cableId,
              maxConnections: result.maxComputers,
              cableType: card.subtype,
            });
          }
        }
      } else if (card.subtype === 'computer') {
        // If dropped on a cable (connected or floating), connect to it; otherwise floating
        let cableId: string | undefined;
        if (zoneType === 'cable') {
          cableId = dropZoneId.replace(`${targetPlayerId}-cable-`, '');
        } else if (zoneType === 'floating') {
          // Dropped on floating cable
          cableId = dropZoneId.replace(`${targetPlayerId}-floating-cable-`, '');
        }
        playComputer(card.id, cableId);
        toast.success(cableId ? 'Computer connected to cable!' : 'Computer placed (floating - drag onto a cable to connect)');
      }
      return;
    }

    // Handle attack cards (on opponent's network)
    if (card.type === 'attack' && isComputerTarget) {
      let equipmentId = '';
      if (zoneType === 'switch') {
        equipmentId = dropZoneId.replace(`${targetPlayerId}-switch-`, '');
      } else if (zoneType === 'cable') {
        equipmentId = dropZoneId.replace(`${targetPlayerId}-cable-`, '');
      } else if (zoneType === 'computer') {
        equipmentId = dropZoneId.replace(`${targetPlayerId}-computer-`, '');
      }
      
      if (equipmentId) {
        playAttack(card.id, equipmentId, computerPlayerIndex);
        toast.success(`${card.name} attack played!`);
      }
      return;
    }

    // Handle resolution cards (on own network)
    if (card.type === 'resolution' && isHumanTarget) {
      let equipmentId = '';
      if (zoneType === 'switch') {
        equipmentId = dropZoneId.replace(`${targetPlayerId}-switch-`, '');
      } else if (zoneType === 'cable') {
        equipmentId = dropZoneId.replace(`${targetPlayerId}-cable-`, '');
      } else if (zoneType === 'computer') {
        equipmentId = dropZoneId.replace(`${targetPlayerId}-computer-`, '');
      }
      
      if (equipmentId) {
        playResolution(card.id, equipmentId);
        toast.success('Issue resolved!');
      }
      return;
    }

    // Handle classification cards
    if (card.type === 'classification' && zoneType === 'classification') {
      // Head Hunter and Seal the Deal - must target OPPONENT's classification zone
      if (card.subtype === 'head-hunter' || card.subtype === 'seal-the-deal') {
        if (!isComputerTarget) {
          toast.error(`${card.name} must be used on opponent's classifications!`);
          return;
        }
        
        const computerPlayer = gameState.players[1];
        const humanPlayer = gameState.players[0];
        
        if (computerPlayer.classificationCards.length === 0) {
          toast.error("Opponent has no classifications to steal!");
          return;
        }
        
        // Check if there are any stealable classifications (player doesn't already have the type)
        const stealable = computerPlayer.classificationCards.filter(oppClass => 
          !humanPlayer.classificationCards.some(c => c.card.subtype === oppClass.card.subtype)
        );
        
        if (stealable.length === 0) {
          toast.error("Can't steal - you already have the same classification types!");
          return;
        }
        
        // Open the steal dialog
        setStealDialog({
          isOpen: true,
          cardId: card.id,
          cardName: card.name,
        });
        return;
      }
      
      // Regular classifications (Field Tech, Supervisor, etc.) - on OWN zone only
      if (!isHumanTarget) {
        toast.error(`${card.name} must be placed on your own classification zone!`);
        return;
      }
      
      // Check if already at max classifications
      if (humanPlayer.classificationCards.length >= 2) {
        toast.error("Maximum 2 classification cards in play!");
        return;
      }
      
      // Check if same type already in play
      const sameTypeInPlay = humanPlayer.classificationCards.some(
        c => c.card.subtype === card.subtype
      );
      if (sameTypeInPlay) {
        toast.error(`${card.name} already in play! Can't have duplicates.`);
        return;
      }
      
      const success = playClassification(card.id);
      if (success) {
        toast.success(`${card.name} is now active!`);
      } else {
        toast.error(`Failed to play ${card.name}!`);
      }
      return;
    }
  };

  // Show helpful hint based on card type
  const showCardHint = (card: Card) => {
    const hints: Record<string, string> = {
      'switch': '🔌 Drag Switch to your network board',
      'cable-2': '🔗 Drag Cable to the board OR drop on a Switch to connect',
      'cable-3': '🔗 Drag Cable to the board OR drop on a Switch to connect',
      'computer': '💻 Drag Computer to the board OR drop on a Cable to connect',
      'hacked': '⚡ Drag attack cards to OPPONENT\'s equipment',
      'power-outage': '⚡ Drag attack cards to OPPONENT\'s equipment',
      'new-hire': '⚡ Drag attack cards to OPPONENT\'s equipment',
      'secured': '🔧 Drag to YOUR disabled equipment with Hacked issue',
      'powered': '🔧 Drag to YOUR disabled equipment with Power Outage issue',
      'trained': '🔧 Drag to YOUR disabled equipment with New Hire issue',
      'helpdesk': '🔧 Drag to YOUR disabled equipment to fix ALL issues',
      'security-specialist': '🎖️ Drag to YOUR classification zone (auto-resolves Hacked)',
      'facilities': '🎖️ Drag to YOUR classification zone (auto-resolves Power Outage)',
      'supervisor': '🎖️ Drag to YOUR classification zone (auto-resolves New Hire)',
      'field-tech': '🎖️ Drag to YOUR classification zone (+1 move/turn)',
      'head-hunter': '🎯 Drag to OPPONENT\'s classification zone to steal!',
      'seal-the-deal': '💎 Drag to OPPONENT\'s classification zone (unblockable steal)!',
    };
    
    const hint = hints[card.subtype] || `Cannot place ${card.name} here`;
    toast.info(hint, { duration: 3000 });
  };


  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-accent-green animate-pulse">Loading game...</div>
      </div>
    );
  }

  const humanPlayer = gameState.players[0];
  const computerPlayer = gameState.players[1];
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isHumanTurn = currentPlayer.isHuman;
  const canPlayCards = isHumanTurn && gameState.phase === 'moves' && gameState.movesRemaining > 0;
  const canDiscard = isHumanTurn && gameState.phase === 'moves'; // Can always discard during your turn
  const isDiscardPhase = isHumanTurn && gameState.phase === 'discard';
  
  // Check if player has resolution cards
  const hasResolutionCards = humanPlayer.hand.some(c => c.type === 'resolution');
  
  // Check if opponent has equipment with issues that need resolving
  const playerHasDisabledEquipment = humanPlayer.network.switches.some(sw => 
    sw.attachedIssues.length > 0 || 
    sw.cables.some(c => c.attachedIssues.length > 0 || c.computers.some(comp => comp.attachedIssues.length > 0))
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <DndContext 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        collisionDetection={preferSpecificTargets}
      >
        <main className="flex-grow container mx-auto px-4 py-6">
          {/* Back button and title */}
          <div className="flex items-center justify-between mb-4">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 hover:opacity-80 transition-colors"
              style={{ color: 'hsl(var(--accent-green))' }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            
            <h1 className="text-2xl font-bold font-orbitron text-accent-green">
              WIRED Simulator
            </h1>
            
            <Button
              onClick={() => initializeGame('You')}
              variant="outline"
              size="sm"
              className="border-accent-green text-accent-green hover:bg-accent-green/20"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              New Game
            </Button>
          </div>

          {/* Score display */}
          <div className="mb-4">
            <ScoreDisplay 
              players={gameState.players}
              currentPlayerIndex={gameState.currentPlayerIndex}
              countConnectedComputers={countConnectedComputers}
            />
          </div>

          {/* Game Over overlay */}
          {gameState.phase === 'game-over' && gameState.winner && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
              <div className="text-center p-8 bg-black/90 border-2 border-accent-green rounded-lg">
                <h2 className="text-4xl font-bold font-orbitron text-accent-green mb-4">
                  🎉 {gameState.winner.name} Wins!
                </h2>
                <p className="text-xl text-white mb-6">
                  Final Score: {gameState.winner.score} bitcoin
                </p>
                <Button
                  onClick={() => initializeGame('You')}
                  className="bg-accent-green hover:bg-accent-green/80 text-black font-bold"
                >
                  Play Again
                </Button>
              </div>
            </div>
          )}

          {/* Main game area - side by side on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Your Area - Left on desktop */}
            <div className="order-2 lg:order-1 bg-black/20 rounded-lg p-4 border border-accent-green/30 space-y-3">
              <h2 className="text-sm font-bold text-accent-green">YOUR AREA</h2>
              
              {/* Your Network */}
              <NetworkBoardDroppable
                network={humanPlayer.network}
                isCurrentPlayer={isHumanTurn}
                label="Your Network"
                playerId="player-1"
                canReceiveAttacks={false}
                canReceiveResolutions={canPlayCards && hasResolutionCards && playerHasDisabledEquipment}
                canRearrange={canPlayCards}
              />
              
              {/* Your Classifications */}
              <ClassificationSection
                classificationCards={humanPlayer.classificationCards}
                isCurrentPlayer={true}
                playerId="player-1"
              />
              
              {/* Your Hand + Discard + Controls */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-accent-green font-medium">Your Hand</span>
                  <span className="text-xs text-muted-foreground">
                    {isDiscardPhase 
                      ? 'Drag to discard' 
                      : canPlayCards 
                        ? 'Drag to play' 
                        : 'Wait for turn'
                    }
                  </span>
                </div>
                <div className="flex flex-col md:flex-row md:items-start gap-3 md:gap-4">
                  {/* Hand cards - 3x2 grid */}
                  <div className="flex-1">
                    <PlayerHandDraggable
                      cards={humanPlayer.hand}
                      isCurrentPlayer={isHumanTurn}
                      showCards={true}
                      disabled={!canPlayCards && !canDiscard && !isDiscardPhase}
                      gridLayout={true}
                    />
                  </div>
                  {/* Discard + Controls stacked - below on mobile, side on desktop */}
                  <div className="flex-shrink-0 flex flex-row md:flex-col items-center md:items-start gap-3">
                    <DiscardZone 
                      discardPile={gameState.discardPile}
                      isActive={canDiscard || isDiscardPhase}
                      isDiscardPhase={isDiscardPhase}
                      playerId="player-1"
                    />
                    <GameControlsSimple
                      phase={gameState.phase}
                      movesRemaining={gameState.movesRemaining}
                      onEndPhase={endPhase}
                      isCurrentPlayerHuman={isHumanTurn}
                      isDragging={activeCard !== null}
                      compact={true}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Opponent Area - Right on desktop, same size as player */}
            <div className="order-1 lg:order-2 bg-black/20 rounded-lg p-4 border border-gray-700 space-y-4">
              <h2 className="text-sm font-bold text-gray-400">OPPONENT</h2>
              
              {/* Computer's Network - full size like player */}
              <NetworkBoardDroppable
                network={computerPlayer.network}
                isCurrentPlayer={false}
                label="Computer's Network"
                playerId="player-2"
                canReceiveAttacks={canPlayCards}
                canReceiveResolutions={false}
              />
              
              {/* Computer's Classifications - full size */}
              <ClassificationSection
                classificationCards={computerPlayer.classificationCards}
                isCurrentPlayer={false}
                playerId="player-2"
              />
              
              {/* Computer's Hand - full size */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Computer's Hand</span>
                  <span className="text-sm text-muted-foreground">{computerPlayer.hand.length} cards</span>
                </div>
                <PlayerHandDraggable
                  cards={computerPlayer.hand}
                  isCurrentPlayer={false}
                  showCards={false}
                  disabled={true}
                />
              </div>
            </div>
          </div>
        </main>

        {/* Drag overlay - shows the card being dragged */}
        <DragOverlay>
          {activeCard && (
            <div className="w-24 h-32 rounded-lg border-2 border-yellow-400 overflow-hidden shadow-2xl rotate-6">
              <img 
                src={activeCard.image} 
                alt={activeCard.name}
                className="w-full h-full object-contain bg-black"
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Connect Computers Dialog */}
      {connectDialog && gameState && (
        <ConnectComputersDialog
          isOpen={connectDialog.isOpen}
          onClose={() => setConnectDialog(null)}
          floatingComputers={gameState.players[0].network.floatingComputers}
          maxConnections={connectDialog.maxConnections}
          cableType={connectDialog.cableType}
          onConfirm={(selectedIds) => {
            if (selectedIds.length > 0) {
              connectFloatingComputersToCable(connectDialog.cableId, selectedIds);
            }
            setConnectDialog(null);
          }}
        />
      )}
      
      {/* Connect Cables Dialog */}
      {cableDialog && gameState && (
        <ConnectCablesDialog
          isOpen={cableDialog.isOpen}
          onClose={() => setCableDialog(null)}
          floatingCables={gameState.players[0].network.floatingCables}
          onConfirm={(selectedIds) => {
            if (selectedIds.length > 0) {
              connectFloatingCablesToSwitch(cableDialog.switchId, selectedIds);
            }
            setCableDialog(null);
          }}
        />
      )}
      
      {/* Steal Classification Dialog */}
      {stealDialog && gameState && (
        <StealClassificationDialog
          isOpen={stealDialog.isOpen}
          onClose={() => setStealDialog(null)}
          opponentClassifications={gameState.players[1].classificationCards}
          playerClassifications={gameState.players[0].classificationCards}
          cardName={stealDialog.cardName}
          onSteal={(targetId) => {
            const success = playClassification(stealDialog.cardId, targetId);
            if (success) {
              toast.success(`${stealDialog.cardName} used!`);
            }
            setStealDialog(null);
          }}
        />
      )}

      <Footer />
    </div>
  );
};

export default Simulation;
