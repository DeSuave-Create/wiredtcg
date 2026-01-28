// =============================================================================
// SIMULATION LOG - Wrapper around Simulation with AI Thought Process panel
// =============================================================================

import { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Bug, Brain, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useGameEngine } from '@/hooks/useGameEngine';
import { DifficultySelector } from '@/components/game/DifficultySelector';
import { SimulationIntro } from '@/components/game/SimulationIntro';
import { AIThoughtPanel } from '@/components/game/AIThoughtPanel';
import { MobileGameProvider } from '@/contexts/MobileGameContext';
import { AIDifficulty, makeAIDecision, getMatchStateDebug } from '@/utils/ai';
import { EvaluatedAction } from '@/utils/ai/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface AIDecisionLog {
  turn: number;
  timestamp: number;
  action: EvaluatedAction | null;
  allActions: EvaluatedAction[];
  reasoning?: string;
  profile?: { aggression: string; difficulty: string; turns: number } | null;
}

const SimulationLogContent = () => {
  const navigate = useNavigate();
  const {
    gameState,
    initializeGame,
    executeAITurn,
    aiDifficulty,
  } = useGameEngine();

  const [decisionHistory, setDecisionHistory] = useState<AIDecisionLog[]>([]);
  const [showDebugPanel, setShowDebugPanel] = useState(true);
  
  const hasSeenIntro = sessionStorage.getItem('hasSeenIntro') === 'true';
  const [showIntro, setShowIntro] = useState(!hasSeenIntro);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showDifficultySelector, setShowDifficultySelector] = useState(hasSeenIntro);
  
  // Track when AI turn happens
  const prevTurnRef = useRef<number>(0);

  const handleIntroComplete = () => {
    sessionStorage.setItem('hasSeenIntro', 'true');
    setIsTransitioning(true);
    setShowIntro(false);
    setShowDifficultySelector(true);
  };

  const handleStartGame = useCallback((difficulty: AIDifficulty) => {
    initializeGame('You', difficulty);
    setShowDifficultySelector(false);
    setDecisionHistory([]);
  }, [initializeGame]);

  const handleNewGame = useCallback(() => {
    setShowDifficultySelector(true);
    setDecisionHistory([]);
  }, []);

  useEffect(() => {
    if (!gameState && !showDifficultySelector && !showIntro) {
      navigate('/');
    }
  }, [gameState, showDifficultySelector, showIntro, navigate]);

  // Capture AI decisions during AI turn
  useEffect(() => {
    if (!gameState) return;
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const currentTurn = gameState.turnNumber;
    
    if (!currentPlayer.isHuman && gameState.phase === 'moves' && currentTurn !== prevTurnRef.current) {
      prevTurnRef.current = currentTurn;
      
      // Capture decision before executing
      const decision = makeAIDecision(gameState, aiDifficulty);
      const profile = getMatchStateDebug();
      
      setDecisionHistory(prev => [...prev, {
        turn: currentTurn,
        timestamp: Date.now(),
        action: decision.action,
        allActions: decision.allActions,
        reasoning: decision.action?.reasoning,
        profile,
      }]);
    }
  }, [gameState?.turnNumber, gameState?.currentPlayerIndex, gameState?.phase, aiDifficulty]);

  if (showIntro) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <SimulationIntro onComplete={handleIntroComplete} />
      </div>
    );
  }

  if (!gameState) {
    if (!showDifficultySelector) return null;
    
    return (
      <div className="min-h-screen flex flex-col bg-background relative">
        <div 
          className={cn(
            "fixed inset-0 bg-black z-40 pointer-events-none transition-opacity duration-700 ease-out",
            isTransitioning ? 'opacity-100' : 'opacity-0'
          )}
          onTransitionEnd={() => setIsTransitioning(false)}
        />
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <DifficultySelector
            isOpen={showDifficultySelector}
            onSelect={handleStartGame}
            onClose={() => setShowDifficultySelector(false)}
          />
        </div>
        <Footer />
      </div>
    );
  }

  const latestDecision = decisionHistory[decisionHistory.length - 1] || null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Link 
            to="/simulation" 
            className="inline-flex items-center gap-2 hover:opacity-80 transition-colors text-sm text-accent-green"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Simulation
          </Link>
          
          <div className="flex items-center gap-2">
            <Bug className="w-5 h-5 text-purple-400" />
            <h1 className="text-xl font-bold font-orbitron text-accent-green">
              AI Debug Log
            </h1>
          </div>
          
          <Button
            onClick={handleNewGame}
            variant="outline"
            size="sm"
            className="border-accent-green text-accent-green hover:bg-accent-green/20"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            New Game
          </Button>
        </div>

        {/* Info banner */}
        <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-3 mb-4">
          <p className="text-sm text-purple-200">
            <Brain className="w-4 h-4 inline mr-2" />
            This page shows the AI's thought process. Play the game at <Link to="/simulation" className="text-accent-green hover:underline">/simulation</Link> and monitor decisions here.
          </p>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Current Decision */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Latest AI Decision
            </h2>
            
            <AIThoughtPanel
              gameState={gameState}
              difficulty={aiDifficulty}
              lastDecision={latestDecision}
            />
          </div>

          {/* Right: Decision History */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              Decision History ({decisionHistory.length} decisions)
            </h2>
            
            <ScrollArea className="h-[600px] bg-gray-900/60 rounded-lg border border-gray-700 p-4">
              {decisionHistory.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Brain className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No AI decisions recorded yet.</p>
                  <p className="text-sm mt-1">Start a game and wait for the AI's turn.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {[...decisionHistory].reverse().map((decision, idx) => (
                    <div 
                      key={decision.timestamp}
                      className={cn(
                        "p-3 rounded-lg border",
                        idx === 0 
                          ? "bg-green-900/20 border-green-500/30" 
                          : "bg-gray-800/50 border-gray-700/50"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          Turn {decision.turn}
                        </span>
                        {decision.profile && (
                          <div className="flex items-center gap-1">
                            <span className={cn(
                              "px-1.5 py-0.5 rounded text-[10px] font-medium",
                              decision.profile.aggression === 'aggressive' && "bg-red-900/50 text-red-300",
                              decision.profile.aggression === 'passive' && "bg-blue-900/50 text-blue-300",
                              decision.profile.aggression === 'balanced' && "bg-gray-700/50 text-gray-300"
                            )}>
                              {decision.profile.aggression}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {decision.action ? (
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-foreground">
                              {decision.action.type}
                            </span>
                            {decision.action.card && (
                              <span className="text-xs text-muted-foreground">
                                "{decision.action.card.name}"
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Utility: <span className="text-accent-green">{decision.action.utility.toFixed(1)}</span>
                            {' | '}
                            Options: {decision.allActions.length}
                          </div>
                          {decision.reasoning && (
                            <p className="text-xs text-gray-400 mt-1 italic">
                              {decision.reasoning}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">No action taken</span>
                      )}
                      
                      {/* Top 3 alternatives */}
                      {decision.allActions.length > 1 && (
                        <details className="mt-2">
                          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                            View alternatives ({decision.allActions.length - 1} other options)
                          </summary>
                          <div className="mt-2 space-y-1 pl-2 border-l border-gray-700">
                            {decision.allActions
                              .filter(a => a !== decision.action)
                              .slice(0, 5)
                              .map((alt, altIdx) => (
                                <div key={altIdx} className="text-xs text-gray-500">
                                  {alt.type} 
                                  {alt.card && ` "${alt.card.name}"`}
                                  <span className="ml-1 text-gray-600">
                                    (u: {alt.utility.toFixed(1)})
                                  </span>
                                </div>
                              ))}
                          </div>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        {/* Game state summary */}
        <div className="mt-6 bg-gray-900/60 rounded-lg border border-gray-700 p-4">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Current Game State</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Turn:</span>
              <span className="ml-2 text-foreground">{gameState.turnNumber}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Phase:</span>
              <span className="ml-2 text-foreground">{gameState.phase}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Your Score:</span>
              <span className="ml-2 text-accent-green">{gameState.players[0].score}</span>
            </div>
            <div>
              <span className="text-muted-foreground">AI Score:</span>
              <span className="ml-2 text-red-400">{gameState.players[1].score}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Moves Left:</span>
              <span className="ml-2 text-foreground">{gameState.movesRemaining}</span>
            </div>
            <div>
              <span className="text-muted-foreground">AI Hand:</span>
              <span className="ml-2 text-foreground">{gameState.players[1].hand.length} cards</span>
            </div>
            <div>
              <span className="text-muted-foreground">Deck:</span>
              <span className="ml-2 text-foreground">{gameState.drawPile.length} cards</span>
            </div>
            <div>
              <span className="text-muted-foreground">Difficulty:</span>
              <span className="ml-2 text-purple-400">{aiDifficulty}</span>
            </div>
          </div>
        </div>
      </main>

      <DifficultySelector
        isOpen={showDifficultySelector}
        onSelect={handleStartGame}
        onClose={() => setShowDifficultySelector(false)}
      />

      <Footer />
    </div>
  );
};

const SimulationLog = () => {
  return (
    <MobileGameProvider>
      <SimulationLogContent />
    </MobileGameProvider>
  );
};

export default SimulationLog;
