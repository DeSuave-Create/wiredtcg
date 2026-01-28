// =============================================================================
// AI THOUGHT PANEL - Shows AI decision-making process for debugging
// =============================================================================

import { useEffect, useState } from 'react';
import { GameState } from '@/types/game';
import { Brain, Target, Zap, AlertTriangle, TrendingUp, Shuffle, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getMatchStateDebug, computeBoardState, AIDifficulty } from '@/utils/ai';
import { EvaluatedAction } from '@/utils/ai/types';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AIThoughtPanelProps {
  gameState: GameState | null;
  difficulty: AIDifficulty;
  lastDecision?: {
    action: EvaluatedAction | null;
    allActions: EvaluatedAction[];
    reasoning?: string;
  } | null;
}

interface ThoughtEntry {
  timestamp: number;
  category: 'profile' | 'evaluation' | 'decision' | 'warning' | 'action';
  message: string;
  details?: Record<string, unknown>;
}

export function AIThoughtPanel({ gameState, difficulty, lastDecision }: AIThoughtPanelProps) {
  const [thoughts, setThoughts] = useState<ThoughtEntry[]>([]);
  const [matchInfo, setMatchInfo] = useState<{ aggression: string; difficulty: string; turns: number } | null>(null);

  // Update match state info
  useEffect(() => {
    const state = getMatchStateDebug();
    if (state) {
      setMatchInfo(state);
    }
  }, [gameState?.turnNumber]);

  // Track AI decisions and generate thought log
  useEffect(() => {
    if (!gameState || !lastDecision) return;

    const newThoughts: ThoughtEntry[] = [];
    const now = Date.now();

    // Profile info
    if (matchInfo) {
      newThoughts.push({
        timestamp: now,
        category: 'profile',
        message: `Profile: ${matchInfo.aggression.toUpperCase()} | ${matchInfo.difficulty.toUpperCase()}`,
        details: matchInfo,
      });
    }

    // Board state analysis
    if (gameState.players[1]) {
      const aiPlayer = gameState.players[1];
      const boardState = computeBoardState(gameState, 1, difficulty);
      
      newThoughts.push({
        timestamp: now + 1,
        category: 'evaluation',
        message: `Board: ${boardState.myConnectedComputers} active computers, ${boardState.myPotentialComputers} potential`,
        details: {
          connectedComputers: boardState.myConnectedComputers,
          potentialComputers: boardState.myPotentialComputers,
          availableSwitches: boardState.availableEnabledSwitches,
          cableSlots: boardState.availableCableSlots,
          equipmentInHand: boardState.equipmentInHand.length,
        },
      });

      // Hand analysis
      const handTypes = {
        equipment: boardState.equipmentInHand.length,
        switches: boardState.switchesInHand.length,
        cables: boardState.cablesInHand.length,
        computers: boardState.computersInHand.length,
        attacks: boardState.attacksInHand.length,
        resolutions: boardState.resolutionsInHand.length,
      };

      newThoughts.push({
        timestamp: now + 2,
        category: 'evaluation',
        message: `Hand: ${aiPlayer.hand.length} cards (${handTypes.equipment} equipment, ${handTypes.attacks} attacks)`,
        details: handTypes,
      });

      // Floating equipment warning
      const floatingCount = aiPlayer.network.floatingCables.length + aiPlayer.network.floatingComputers.length;
      if (floatingCount > 0) {
        newThoughts.push({
          timestamp: now + 3,
          category: 'warning',
          message: `⚠️ ${floatingCount} floating equipment needs connection`,
        });
      }

      // Opponent threat assessment
      if (boardState.oppNearWin) {
        newThoughts.push({
          timestamp: now + 4,
          category: 'warning',
          message: `🚨 OPPONENT NEAR WIN! Score: ${gameState.players[0].score}, Income: ${boardState.oppConnectedComputers}`,
        });
      }
    }

    // Top evaluated actions
    if (lastDecision.allActions && lastDecision.allActions.length > 0) {
      const topActions = [...lastDecision.allActions]
        .sort((a, b) => b.utility - a.utility)
        .slice(0, 5);

      newThoughts.push({
        timestamp: now + 5,
        category: 'evaluation',
        message: `Evaluated ${lastDecision.allActions.length} possible actions`,
      });

      topActions.forEach((action, idx) => {
        const deltaBitcoin = (action as any).__deltaBitcoin ?? 0;
        newThoughts.push({
          timestamp: now + 6 + idx,
          category: 'evaluation',
          message: `#${idx + 1}: ${action.type} (utility: ${action.utility.toFixed(1)}, Δ₿: ${deltaBitcoin})`,
          details: {
            type: action.type,
            utility: action.utility,
            deltaBitcoin,
            cardName: action.card?.name,
            reasoning: action.reasoning,
          },
        });
      });
    }

    // Final decision
    if (lastDecision.action) {
      const deltaBitcoin = (lastDecision.action as any).__deltaBitcoin ?? 0;
      newThoughts.push({
        timestamp: now + 20,
        category: 'decision',
        message: `✅ CHOSE: ${lastDecision.action.type} "${lastDecision.action.card?.name || 'N/A'}"`,
        details: {
          utility: lastDecision.action.utility,
          deltaBitcoin,
          reasoning: lastDecision.action.reasoning,
        },
      });

      if (lastDecision.reasoning) {
        newThoughts.push({
          timestamp: now + 21,
          category: 'action',
          message: `Reasoning: ${lastDecision.reasoning}`,
        });
      }
    }

    setThoughts(newThoughts);
  }, [lastDecision, gameState?.turnNumber, matchInfo, difficulty]);

  const getCategoryIcon = (category: ThoughtEntry['category']) => {
    switch (category) {
      case 'profile': return <Settings className="w-3 h-3 text-purple-400" />;
      case 'evaluation': return <Brain className="w-3 h-3 text-blue-400" />;
      case 'decision': return <Target className="w-3 h-3 text-green-400" />;
      case 'warning': return <AlertTriangle className="w-3 h-3 text-yellow-400" />;
      case 'action': return <Zap className="w-3 h-3 text-cyan-400" />;
    }
  };

  const getCategoryColor = (category: ThoughtEntry['category']) => {
    switch (category) {
      case 'profile': return 'border-purple-500/30 bg-purple-900/20';
      case 'evaluation': return 'border-blue-500/30 bg-blue-900/20';
      case 'decision': return 'border-green-500/30 bg-green-900/20';
      case 'warning': return 'border-yellow-500/30 bg-yellow-900/20';
      case 'action': return 'border-cyan-500/30 bg-cyan-900/20';
    }
  };

  return (
    <div className="bg-gray-900/80 rounded-lg border border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-2 border-b border-gray-700 flex items-center gap-2">
        <Brain className="w-4 h-4 text-purple-400" />
        <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider">AI Thought Process</h2>
      </div>

      {/* Match Profile Summary */}
      {matchInfo && (
        <div className="px-3 py-2 border-b border-gray-700/50 bg-gray-800/50">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className={cn(
                "px-2 py-0.5 rounded font-medium",
                matchInfo.aggression === 'aggressive' && "bg-red-900/50 text-red-300",
                matchInfo.aggression === 'passive' && "bg-blue-900/50 text-blue-300",
                matchInfo.aggression === 'balanced' && "bg-gray-700/50 text-gray-300"
              )}>
                {matchInfo.aggression.toUpperCase()}
              </span>
              <span className={cn(
                "px-2 py-0.5 rounded font-medium",
                matchInfo.difficulty === 'easy' && "bg-green-900/50 text-green-300",
                matchInfo.difficulty === 'normal' && "bg-yellow-900/50 text-yellow-300",
                matchInfo.difficulty === 'hard' && "bg-orange-900/50 text-orange-300",
                matchInfo.difficulty === 'nightmare' && "bg-purple-900/50 text-purple-300"
              )}>
                {matchInfo.difficulty.toUpperCase()}
              </span>
            </div>
            <span className="text-gray-500">Turn {matchInfo.turns}</span>
          </div>
        </div>
      )}

      {/* Thought Log */}
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1.5">
          {thoughts.length === 0 ? (
            <div className="text-xs text-gray-500 italic p-2">
              AI thoughts will appear here during its turn...
            </div>
          ) : (
            thoughts.map((thought, idx) => (
              <div
                key={idx}
                className={cn(
                  "p-2 rounded border text-xs",
                  getCategoryColor(thought.category),
                  "animate-[fade-in_0.2s_ease-out]"
                )}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 flex-shrink-0">
                    {getCategoryIcon(thought.category)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-gray-200">{thought.message}</span>
                    {thought.details && thought.category === 'evaluation' && thought.details.reasoning && (
                      <div className="mt-1 text-[10px] text-gray-400 italic">
                        {String(thought.details.reasoning)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Quick Stats Footer */}
      {lastDecision && lastDecision.allActions.length > 0 && (
        <div className="px-3 py-2 border-t border-gray-700/50 bg-gray-800/30">
          <div className="flex items-center justify-between text-[10px] text-gray-500">
            <span>Actions evaluated: {lastDecision.allActions.length}</span>
            {lastDecision.action && (
              <span className="text-green-400">
                Best utility: {lastDecision.action.utility.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
