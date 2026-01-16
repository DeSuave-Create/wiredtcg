import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useGameEngine } from '@/hooks/useGameEngine';
import { PlayerHand } from '@/components/game/PlayerHand';
import { NetworkBoard } from '@/components/game/NetworkBoard';
import { GameControls } from '@/components/game/GameControls';
import { GameLog } from '@/components/game/GameLog';
import { ScoreDisplay } from '@/components/game/ScoreDisplay';

const Simulation = () => {
  const {
    gameState,
    selectedCard,
    setSelectedCard,
    initializeGame,
    playSwitch,
    playCable,
    playComputer,
    discardCard,
    endPhase,
    executeAITurn,
    countConnectedComputers,
  } = useGameEngine();

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

  const hasSwitch = humanPlayer.hand.some(c => c.subtype === 'switch');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
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
                <li>• <span className="text-green-400">Switch</span> → connects to Internet</li>
                <li>• <span className="text-green-400">Cable</span> → connects to Switch</li>
                <li>• <span className="text-green-400">Computer</span> → connects to Cable</li>
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
              <PlayerHand
                cards={computerPlayer.hand}
                selectedCard={null}
                onSelectCard={() => {}}
                isCurrentPlayer={false}
                showCards={false}
              />
              <NetworkBoard
                network={computerPlayer.network}
                isCurrentPlayer={false}
                selectedCard={null}
                label="Computer's Network"
              />
            </div>

            {/* Game controls */}
            <GameControls
              phase={gameState.phase}
              movesRemaining={gameState.movesRemaining}
              onPlaySwitch={playSwitch}
              onEndPhase={endPhase}
              hasSwitch={hasSwitch}
              isCurrentPlayerHuman={isHumanTurn}
            />

            {/* Player's area */}
            <div className="bg-black/20 rounded-lg p-4 border border-accent-green/30">
              <NetworkBoard
                network={humanPlayer.network}
                isCurrentPlayer={isHumanTurn}
                selectedCard={selectedCard}
                onPlayCable={(switchId) => {
                  if (selectedCard?.subtype === 'cable-2' || selectedCard?.subtype === 'cable-3') {
                    playCable(switchId, selectedCard.subtype);
                    setSelectedCard(null);
                  }
                }}
                onPlayComputer={(cableId) => {
                  if (selectedCard?.subtype === 'computer') {
                    playComputer(cableId);
                    setSelectedCard(null);
                  }
                }}
                label="Your Network"
              />
              
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-accent-green font-medium">Your Hand</span>
                  {selectedCard && (
                    <span className="text-xs text-yellow-400">
                      Selected: {selectedCard.name}
                    </span>
                  )}
                </div>
                <PlayerHand
                  cards={humanPlayer.hand}
                  selectedCard={selectedCard}
                  onSelectCard={setSelectedCard}
                  onDiscard={gameState.phase === 'discard' ? discardCard : undefined}
                  isCurrentPlayer={isHumanTurn}
                  showCards={true}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Simulation;
