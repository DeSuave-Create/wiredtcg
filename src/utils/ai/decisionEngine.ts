import { GameState, Player, Card, AIAction } from '@/types/game';
import { 
  AIDifficulty, 
  AIDecisionContext, 
  EvaluatedAction, 
  AIStateMemory,
} from './types';
import { getAIConfig, getUtilityWeights } from './config';
import { 
  analyzeNetwork, 
  analyzeHand, 
  analyzeOpponent, 
  initializeMemory,
  estimateTurnsToWin,
} from './analysis';
import {
  evaluateNetworkBuilding,
  evaluateRecoveryActions,
  evaluateAttacks,
  evaluateAudit,
  evaluateSteals,
  evaluateClassifications,
  evaluateDiscards,
  findRerouteOpportunities,
} from './strategies';

// Global memory storage (persists across turns)
let aiMemory: AIStateMemory = initializeMemory();

// Reset memory for new game
export function resetAIMemory(): void {
  aiMemory = initializeMemory();
}

// Get current memory (for debug display)
export function getAIMemory(): AIStateMemory {
  return aiMemory;
}

// Main decision function
export function makeAIDecision(
  gameState: GameState,
  difficulty: AIDifficulty = 'normal'
): { action: EvaluatedAction | null; allActions: EvaluatedAction[] } {
  const aiPlayerIndex = gameState.currentPlayerIndex;
  const humanPlayerIndex = aiPlayerIndex === 0 ? 1 : 0;
  const aiPlayer = gameState.players[aiPlayerIndex];
  const humanPlayer = gameState.players[humanPlayerIndex];

  // Skip if not AI's turn
  if (aiPlayer.isHuman) {
    return { action: null, allActions: [] };
  }

  // Build decision context
  const config = getAIConfig(difficulty);
  const aiNetwork = analyzeNetwork(aiPlayer.network);
  const humanNetwork = analyzeNetwork(humanPlayer.network);
  const aiHand = analyzeHand(aiPlayer.hand, aiPlayer.network);
  
  const scoreDifference = aiPlayer.score - humanPlayer.score;
  const turnsToWin = estimateTurnsToWin(aiPlayer.score, aiNetwork.projectedScoring);
  const humanTurnsToWin = estimateTurnsToWin(humanPlayer.score, humanNetwork.projectedScoring);
  
  const weights = getUtilityWeights(difficulty, scoreDifference, turnsToWin);

  // Update opponent analysis
  const cardsInPlay = gameState.discardPile.length + 
    gameState.players.reduce((sum, p) => sum + p.hand.length, 0);
  aiMemory.opponentBehavior = analyzeOpponent(humanPlayer, aiMemory, cardsInPlay, difficulty);

  const context: AIDecisionContext = {
    gameState,
    aiPlayerIndex,
    humanPlayerIndex,
    aiPlayer,
    humanPlayer,
    aiNetwork,
    humanNetwork,
    aiHand,
    memory: aiMemory,
    config,
    weights,
    movesRemaining: gameState.movesRemaining,
    scoreDifference,
    turnsToWin,
    humanTurnsToWin,
  };

  // Collect all possible actions
  const allActions: EvaluatedAction[] = [
    ...evaluateRecoveryActions(context),     // Priority 1: Resolve issues
    ...evaluateClassifications(context),     // Priority 2: Play classifications
    ...evaluateNetworkBuilding(context),     // Priority 3: Build network
    ...evaluateSteals(context),              // Priority 4: Steal classifications
    ...evaluateAudit(context),               // Priority 5: Audit
    ...evaluateAttacks(context),             // Priority 6: Attack opponent
    ...evaluateDiscards(context),            // Priority 7: Discard dead cards
  ];

  // Apply difficulty-based randomness
  for (const action of allActions) {
    if (config.randomnessFactor > 0) {
      const randomAdjustment = (Math.random() - 0.5) * config.randomnessFactor * 20;
      action.utility += randomAdjustment;
    }

    // Apply risk penalty based on risk tolerance
    action.utility -= action.risk * (1 - config.riskTolerance) * 10;
  }

  // Sort by utility (highest first)
  allActions.sort((a, b) => b.utility - a.utility);

  // Apply hold probability for non-easy difficulties
  if (config.holdProbability > 0 && allActions.length > 0) {
    const topAction = allActions[0];
    
    // Consider holding if action is not critical
    if (topAction.utility < 15 && Math.random() < config.holdProbability) {
      // Prefer to hold attacks for better timing
      if (topAction.type === 'play_attack' || topAction.type === 'start_audit') {
        // Find next best non-attack action
        const nonAttackAction = allActions.find(a => 
          a.type !== 'play_attack' && a.type !== 'start_audit' && a.utility > 0
        );
        if (nonAttackAction) {
          return { action: nonAttackAction, allActions };
        }
      }
    }
  }

  // Select best action
  const bestAction = allActions.length > 0 && allActions[0].utility > -5 
    ? allActions[0] 
    : null;

  return { action: bestAction, allActions };
}

// Execute a full AI turn (called from game engine)
export interface AITurnResult {
  actions: AIAction[];
  logs: string[];
  finalState: 'continue' | 'end_turn';
}

export function executeAITurnDecisions(
  gameState: GameState,
  difficulty: AIDifficulty = 'normal',
  maxActions: number = 10
): { decisions: EvaluatedAction[]; reasoning: string[] } {
  const decisions: EvaluatedAction[] = [];
  const reasoning: string[] = [];
  
  let currentState = gameState;
  let movesUsed = 0;
  
  while (movesUsed < maxActions && currentState.movesRemaining > 0) {
    const { action, allActions } = makeAIDecision(currentState, difficulty);
    
    if (!action || action.utility <= -10) {
      reasoning.push('No valuable actions remaining');
      break;
    }

    decisions.push(action);
    reasoning.push(`${action.type}: ${action.reasoning} (utility: ${action.utility.toFixed(1)})`);
    
    // Simulate move consumption
    movesUsed++;
    currentState = {
      ...currentState,
      movesRemaining: currentState.movesRemaining - 1,
    };

    // Update memory with played cards
    if (action.card) {
      aiMemory.attacksUsed[action.card.subtype] = 
        (aiMemory.attacksUsed[action.card.subtype] || 0) + 1;
    }
  }

  return { decisions, reasoning };
}

// AI response to audit (decide whether to counter)
export function decideAuditResponse(
  gameState: GameState,
  difficulty: AIDifficulty,
  isTargetTurn: boolean // true if AI is being audited, false if AI is the auditor
): { shouldCounter: boolean; cardId: string | null; reasoning: string } {
  const config = getAIConfig(difficulty);
  const aiPlayerIndex = gameState.currentPlayerIndex;
  const aiPlayer = gameState.players[aiPlayerIndex];
  
  if (!gameState.auditBattle) {
    return { shouldCounter: false, cardId: null, reasoning: 'No active audit' };
  }

  const neededType = isTargetTurn ? 'hacked' : 'secured';
  const counterCards = aiPlayer.hand.filter(c => c.subtype === neededType);
  
  if (counterCards.length === 0) {
    return { shouldCounter: false, cardId: null, reasoning: `No ${neededType} cards available` };
  }

  const computersAtRisk = gameState.auditBattle.computersToReturn;
  const chainLength = gameState.auditBattle.chain.length;

  // Calculate value of countering
  let shouldCounter = false;
  let reasoning = '';

  if (isTargetTurn) {
    // AI is being audited - consider whether to block
    if (computersAtRisk >= 2) {
      shouldCounter = true;
      reasoning = `Protecting ${computersAtRisk} computers`;
    } else if (counterCards.length >= 2 && computersAtRisk >= 1) {
      shouldCounter = true;
      reasoning = 'Have spare counters, protecting computer';
    }
  } else {
    // AI is the auditor - consider whether to counter-counter
    if (computersAtRisk >= 3 && counterCards.length >= 1) {
      shouldCounter = true;
      reasoning = 'High-value audit, pressing advantage';
    } else if (chainLength >= 2 && config.difficulty === 'hard') {
      // Hard AI is more persistent
      shouldCounter = counterCards.length >= 1;
      reasoning = 'Maintaining pressure in counter battle';
    }
  }

  // Risk tolerance adjustment
  if (Math.random() > config.riskTolerance && chainLength >= 2) {
    shouldCounter = false;
    reasoning = 'Backing off - too risky';
  }

  // Easy AI is more predictable
  if (config.difficulty === 'easy') {
    shouldCounter = counterCards.length >= 2;
    reasoning = counterCards.length >= 2 ? 'Have multiple counters' : 'Saving cards';
  }

  return {
    shouldCounter,
    cardId: shouldCounter ? counterCards[0].id : null,
    reasoning,
  };
}

// AI selection of computers during audit
export function selectAuditTargets(
  gameState: GameState,
  difficulty: AIDifficulty,
  availableComputers: { id: string; card: Card; location: string }[],
  count: number
): string[] {
  const config = getAIConfig(difficulty);
  
  // Hard AI prioritizes connected computers over floating
  // Easy AI just picks randomly
  
  if (config.difficulty === 'easy') {
    // Random selection
    const shuffled = [...availableComputers].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map(c => c.id);
  }

  // Score each computer for removal priority
  const scored = availableComputers.map(comp => {
    let score = 50;
    
    // Prefer to remove connected computers (they're scoring)
    if (!comp.location.includes('Floating')) {
      score += 30;
    }
    
    // Prefer computers on cables with more computers (break clustering)
    if (comp.location.includes('Cable')) {
      score += 10;
    }
    
    // Add randomness based on difficulty
    score += (Math.random() - 0.5) * config.randomnessFactor * 40;
    
    return { ...comp, score };
  });

  // Sort by score (highest = most desirable to remove)
  scored.sort((a, b) => b.score - a.score);
  
  return scored.slice(0, count).map(c => c.id);
}

// Debug output for AI decision reasoning
export function getAIDecisionDebug(
  gameState: GameState,
  difficulty: AIDifficulty
): {
  context: Partial<AIDecisionContext>;
  topActions: EvaluatedAction[];
  memory: AIStateMemory;
} {
  const { action, allActions } = makeAIDecision(gameState, difficulty);
  
  const aiPlayerIndex = gameState.currentPlayerIndex;
  const humanPlayerIndex = aiPlayerIndex === 0 ? 1 : 0;
  
  return {
    context: {
      scoreDifference: gameState.players[aiPlayerIndex].score - gameState.players[humanPlayerIndex].score,
      movesRemaining: gameState.movesRemaining,
    },
    topActions: allActions.slice(0, 5),
    memory: aiMemory,
  };
}
