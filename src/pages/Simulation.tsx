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
import { GameControlsSimple } from '@/components/game/GameControlsSimple';
import { GameLog } from '@/components/game/GameLog';
import { ScoreDisplay } from '@/components/game/ScoreDisplay';
import { DiscardZone } from '@/components/game/DiscardZone';
import { ConnectComputersDialog } from '@/components/game/ConnectComputersDialog';
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
    discardCard,
    endPhase,
    executeAITurn,
    countConnectedComputers,
    connectFloatingComputersToCable,
  } = useGameEngine();

  const [activeCard, setActiveCard] = useState<Card | null>(null);
  
  // Dialog state for connecting floating computers
  const [connectDialog, setConnectDialog] = useState<{
    isOpen: boolean;
    cableId: string;
    maxConnections: number;
    cableType: string;
  } | null>(null);

  // Initialize game on mount
  useEffect(() => {
    initializeGame('You');
  }, [initializeGame]);

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

  const handleDragStart = (event: DragStartEvent) => {
    const card = event.active.data.current?.card as Card;
    setActiveCard(card);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const droppedCard = activeCard;
    setActiveCard(null);
    
    const { active, over } = event;
    if (!over || !gameState) {
      // Dropped outside valid zone
      if (droppedCard) {
        showCardHint(droppedCard);
      }
      return;
    }

    const card = active.data.current?.card as Card;
    const dropZoneId = over.id as string;
    const dropData = over.data.current;

    if (!card || !dropData) return;

    // Parse the drop zone ID
    const parts = dropZoneId.split('-');
    const targetPlayerId = parts[0] + '-' + parts[1]; // e.g., "player-1" or "player-2"
    const zoneType = parts[2]; // e.g., "internet", "switch", "cable", "computer", "discard"

    // Check if this card type is accepted
    const accepts = dropData.accepts as string[];
    if (!accepts.includes(card.subtype)) {
      showCardHint(card);
      return;
    }

    const isHumanTarget = targetPlayerId === 'player-1';
    const isComputerTarget = targetPlayerId === 'player-2';
    const computerPlayerIndex = 1;

    // Handle discard
    if (zoneType === 'discard') {
      discardCard(card.id);
      toast.success('Card discarded');
      return;
    }

    // Handle equipment cards (only on own network)
    if (card.type === 'equipment' && isHumanTarget) {
      if (card.subtype === 'switch') {
        playSwitch(card.id);
        toast.success('Switch placed!');
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

          {/* Main game area */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Left sidebar - Game log */}
            <div className="lg:col-span-1 order-3 lg:order-1">
              <GameLog messages={gameState.gameLog} />
              
              {/* Discard zone - always visible and active during player's turn */}
              <div className="mt-4">
                <DiscardZone 
                  discardPile={gameState.discardPile}
                  isActive={isHumanTurn && (canPlayCards || isDiscardPhase)}
                  isDiscardPhase={isDiscardPhase}
                  playerId="player-1"
                />
              </div>
              
              {/* Quick rules reference */}
              <div className="mt-4 bg-black/40 rounded-lg border border-gray-700 p-3">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Quick Rules</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• <span className="text-green-400">Any equipment</span> → drag to your board</li>
                  <li>• <span className="text-yellow-400">Connect</span>: drop cable ON switch, PC ON cable</li>
                  <li>• <span className="text-red-400">Attack</span> → drag to opponent's equipment</li>
                  <li>• <span className="text-blue-400">Resolution</span> → drag to your disabled equipment</li>
                  <li>• <span className="text-gray-400">Discard</span> → drag unwanted cards to trash</li>
                  <li>• Only <span className="text-green-400">connected</span> 💻 = 1 bitcoin/turn</li>
                  <li>• First to 25 bitcoin wins!</li>
                </ul>
              </div>
            </div>

            {/* Main game board */}
            <div className="lg:col-span-3 order-1 lg:order-2 space-y-4">
              {/* Opponent's area */}
              <div className="bg-black/20 rounded-lg p-4 border border-gray-700">
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
                <NetworkBoardDroppable
                  network={computerPlayer.network}
                  isCurrentPlayer={false}
                  label="Computer's Network"
                  playerId="player-2"
                  canReceiveAttacks={canPlayCards} // Human can attack during their moves phase
                  canReceiveResolutions={false} // Can't play resolutions on opponent
                />
              </div>

              {/* Game controls */}
              <GameControlsSimple
                phase={gameState.phase}
                movesRemaining={gameState.movesRemaining}
                onEndPhase={endPhase}
                isCurrentPlayerHuman={isHumanTurn}
                isDragging={activeCard !== null}
              />

              {/* Player's area */}
              <div className="bg-black/20 rounded-lg p-4 border border-accent-green/30">
                <NetworkBoardDroppable
                  network={humanPlayer.network}
                  isCurrentPlayer={isHumanTurn}
                  label="Your Network"
                  playerId="player-1"
                  canReceiveAttacks={false} // Can't attack yourself
                  canReceiveResolutions={canPlayCards && hasResolutionCards && playerHasDisabledEquipment}
                />
                
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-accent-green font-medium">Your Hand</span>
                    <span className="text-xs text-muted-foreground">
                      {isDiscardPhase 
                        ? 'Drag cards to discard pile' 
                        : canPlayCards 
                          ? 'Drag cards to play' 
                          : 'Wait for your turn'
                      }
                    </span>
                  </div>
                  <PlayerHandDraggable
                    cards={humanPlayer.hand}
                    isCurrentPlayer={isHumanTurn}
                    showCards={true}
                    disabled={!canPlayCards && !isDiscardPhase}
                  />
                </div>
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
              toast.success(`Connected ${selectedIds.length} computer(s)!`);
            }
            setConnectDialog(null);
          }}
        />
      )}

      <Footer />
    </div>
  );
};

export default Simulation;
