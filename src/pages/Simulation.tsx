import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, pointerWithin } from '@dnd-kit/core';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useGameEngine } from '@/hooks/useGameEngine';
import { PlayerHandDraggable } from '@/components/game/PlayerHandDraggable';
import { NetworkBoardDroppable } from '@/components/game/NetworkBoardDroppable';
import { GameControlsSimple } from '@/components/game/GameControlsSimple';
import { GameLog } from '@/components/game/GameLog';
import { ScoreDisplay } from '@/components/game/ScoreDisplay';
import { Card } from '@/types/game';

const Simulation = () => {
  const {
    gameState,
    initializeGame,
    playSwitch,
    playCable,
    playComputer,
    discardCard,
    endPhase,
    executeAITurn,
    countConnectedComputers,
  } = useGameEngine();

  const [activeCard, setActiveCard] = useState<Card | null>(null);

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
    setActiveCard(null);
    
    const { active, over } = event;
    if (!over || !gameState) return;

    const card = active.data.current?.card as Card;
    const dropZoneId = over.id as string;
    const dropData = over.data.current;

    if (!card || !dropData) return;

    // Parse the drop zone ID
    const [playerId, zoneType, zoneId] = dropZoneId.split('-');
    
    // Only allow drops on the human player's network
    if (playerId !== 'player-1') return;

    // Check if this card type is accepted
    const accepts = dropData.accepts as string[];
    if (!accepts.includes(card.subtype)) return;

    // Execute the appropriate action
    if (card.subtype === 'switch' && zoneType === 'internet') {
      playSwitch();
    } else if ((card.subtype === 'cable-2' || card.subtype === 'cable-3') && zoneType === 'switch') {
      // zoneId contains the switch placement ID
      const switchId = dropZoneId.replace(`${playerId}-switch-`, '');
      playCable(switchId, card.subtype);
    } else if (card.subtype === 'computer' && zoneType === 'cable') {
      // zoneId contains the cable placement ID
      const cableId = dropZoneId.replace(`${playerId}-cable-`, '');
      playComputer(cableId);
    }
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <DndContext 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        collisionDetection={pointerWithin}
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
              
              {/* Quick rules reference */}
              <div className="mt-4 bg-black/40 rounded-lg border border-gray-700 p-3">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Quick Rules</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• <span className="text-green-400">Switch</span> → drag to Internet</li>
                  <li>• <span className="text-green-400">Cable</span> → drag to a Switch</li>
                  <li>• <span className="text-green-400">Computer</span> → drag to a Cable</li>
                  <li>• Each connected 💻 = 1 bitcoin/turn</li>
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
                />
                
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-accent-green font-medium">Your Hand</span>
                    <span className="text-xs text-muted-foreground">
                      {canPlayCards ? 'Drag cards to your network' : 'Wait for your turn'}
                    </span>
                  </div>
                  <PlayerHandDraggable
                    cards={humanPlayer.hand}
                    isCurrentPlayer={isHumanTurn}
                    showCards={true}
                    disabled={!canPlayCards}
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

      <Footer />
    </div>
  );
};

export default Simulation;
