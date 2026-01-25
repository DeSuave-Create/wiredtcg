// =============================================================================
// AI DECISION ENGINE - Main entry point for AI decisions
// =============================================================================

import { GameState, Player, Card, AIAction } from '@/types/game';
import { AIDifficulty, EvaluatedAction, AIStateMemory } from './types';
import { selectBestAction } from './moveSelector';
import { getMatchState, initializeMatchState, resetMatchState, hasMatchState, getMatchStateDebug } from './matchState';
import { decideAuditResponse as auditResponse, selectAuditTargets as selectTargets } from './auditDecisions';

// Initialize AI for a new game (call at game start)
export function initializeAIForGame(difficulty: AIDifficulty, seed?: number): void {
  initializeMatchState(difficulty, seed);
}

// Reset AI memory for new game
export function resetAIMemory(): void {
  resetMatchState();
}

// Main decision function
export function makeAIDecision(
  gameState: GameState,
  difficulty: AIDifficulty = 'normal'
): { action: EvaluatedAction | null; allActions: EvaluatedAction[] } {
  const aiPlayerIndex = gameState.currentPlayerIndex;
  const aiPlayer = gameState.players[aiPlayerIndex];

  // Skip if not AI's turn
  if (aiPlayer.isHuman) {
    return { action: null, allActions: [] };
  }

  // Ensure match state exists (auto-initialize if needed)
  const matchState = getMatchState(difficulty);
  
  // Use new modular selector
  const result = selectBestAction(gameState, aiPlayerIndex, matchState);

  return { 
    action: result.action, 
    allActions: result.allActions 
  };
}

// AI response to audit
export function decideAuditResponse(
  gameState: GameState,
  difficulty: AIDifficulty,
  isTargetTurn: boolean
): { shouldCounter: boolean; cardId: string | null; reasoning: string } {
  return auditResponse(gameState, difficulty, isTargetTurn);
}

// AI selection of computers during audit
export function selectAuditTargets(
  gameState: GameState,
  difficulty: AIDifficulty,
  availableComputers: { id: string; card: Card; location: string }[],
  count: number
): string[] {
  return selectTargets(gameState, difficulty, availableComputers, count);
}

// Get debug info
export function getAIDecisionDebug(
  gameState: GameState,
  difficulty: AIDifficulty
): { matchState: ReturnType<typeof getMatchStateDebug>; topActions: EvaluatedAction[] } {
  const { action, allActions } = makeAIDecision(gameState, difficulty);
  
  return {
    matchState: getMatchStateDebug(),
    topActions: allActions.slice(0, 5),
  };
}

// Legacy compatibility - get AI memory (now uses match state)
export function getAIMemory(): AIStateMemory {
  return {
    observedCards: [],
    attacksUsed: {},
    resolutionsRemaining: {},
    opponentBehavior: {
      likelyCounters: 0,
      likelyAttacks: 0,
      threateningClassifications: [],
      stealProtected: false,
      projectedScoring: 0,
      behaviorPattern: 'unknown',
    },
    lastDisruption: null,
    vulnerableStructures: [],
  };
}
