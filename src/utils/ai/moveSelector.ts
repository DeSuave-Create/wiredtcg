// =============================================================================
// MOVE SELECTOR - Final action selection with new difficulty/aggression system
// =============================================================================

import { GameState, Player } from '@/types/game';
import { EvaluatedAction } from './types';
import { BoardState, computeBoardState } from './boardState';
import { ActionCategory, generateActionsForCategory, existsLegalEquipmentPlay } from './actionGenerator';
import { evaluateActionUtility, calculateDeltaBitcoin } from './evaluator';
import { analyzeEndgame, isWinningAction, findWinningLine } from './endgame';
import { AIMatchState, getMatchState, recordAITurn } from './matchState';
import { AIDifficulty, applyUtilityNoise, shouldMakeMistake } from './difficulty';
import { 
  findAutoConnectActions, 
  isAcceptableAutoConnect, 
  scoreAutoConnect, 
  AutoConnectAction 
} from './autoConnect';

// Priority order of categories
const CATEGORY_ORDER: ActionCategory[] = ['build', 'reroute', 'repair', 'disrupt', 'setup', 'cycle'];

export interface SelectionResult {
  action: EvaluatedAction | null;
  category: ActionCategory | null;
  allActions: EvaluatedAction[];
  reasoning: string;
}

// Main selection function
export function selectBestAction(
  gameState: GameState,
  aiPlayerIndex: number,
  matchState: AIMatchState
): SelectionResult {
  const aiPlayer = gameState.players[aiPlayerIndex];
  const { diffCfg, aggCfg, difficulty } = matchState.profile;
  const boardState = computeBoardState(gameState, aiPlayerIndex, difficulty);
  
  // Analyze endgame state
  const endgame = analyzeEndgame(boardState, gameState, aiPlayerIndex, difficulty);
  
  // CRITICAL: Check for winning line first (all difficulties)
  if (endgame.canWinThisTurn) {
    const winResult = forceWinningAction(gameState, aiPlayerIndex, boardState, matchState);
    if (winResult.action) return winResult;
  }
  
  // Generate all legal moves
  let allLegalMoves = generateAllMoves(gameState, aiPlayerIndex, boardState, matchState);
  
  // Apply mistake rate (Easy/Normal only)
  if (shouldMakeMistake(diffCfg) && allLegalMoves.length > 3) {
    // Reduce search quality by sampling subset
    const sampleSize = Math.max(3, Math.floor(allLegalMoves.length * 0.6));
    allLegalMoves = shuffleAndSample(allLegalMoves, sampleSize);
  }
  
  // ==========================================================================
  // PRIORITY: Check for auto-connect actions FIRST
  // ==========================================================================
  const autoConnectActions = findAutoConnectActions(boardState, gameState, aiPlayerIndex);
  const acceptableAutoConnects = autoConnectActions.filter(a => isAcceptableAutoConnect(a.move));
  
  if (acceptableAutoConnects.length > 0) {
    // Score all acceptable auto-connects
    for (const action of acceptableAutoConnects) {
      action.utility = scoreAutoConnect(action);
      action.utility = applyUtilityNoise(action.utility, diffCfg);
    }
    
    // Select with tie-breaking
    const selected = selectMoveWithTies(acceptableAutoConnects, diffCfg.tieBreakerRandomness);
    
    recordAITurn('build', selected.card?.subtype);
    
    return {
      action: selected,
      category: 'build',
      allActions: [...acceptableAutoConnects, ...allLegalMoves],
      reasoning: `Auto-connect: ${selected.reasoning} (utility: ${selected.utility.toFixed(1)})`,
    };
  }
  
  // ==========================================================================
  // NORMAL CATEGORY ORDER PROCESSING
  // ==========================================================================
  const allActions: EvaluatedAction[] = [];
  
  for (const category of CATEGORY_ORDER) {
    const categoryActions = generateActionsForCategory(category, boardState, gameState, aiPlayerIndex);
    if (categoryActions.length === 0) continue;
    
    // Evaluate each action
    for (const action of categoryActions) {
      const evaluation = evaluateActionUtility(action, boardState, gameState, aiPlayerIndex, matchState);
      action.utility = evaluation.finalUtility;
      
      // Apply utility noise
      action.utility = applyUtilityNoise(action.utility, diffCfg);
    }
    
    allActions.push(...categoryActions);
    
    // Sort by utility
    categoryActions.sort((a, b) => b.utility - a.utility);
    
    // Apply ABSOLUTE PRIORITY RULE (scoring actions take precedence)
    const scoringActions = categoryActions.filter(a => ((a as any).__deltaBitcoin ?? 0) >= 1);
    let validActions = categoryActions;
    
    if (scoringActions.length > 0) {
      // Force scoring action unless in denial mode with high threat
      if (!endgame.opponentCanWinNextTurn) {
        validActions = scoringActions;
      }
    }
    
    // SPECIAL BUILD HANDLING: Always allow equipment plays
    if (category === 'build' && validActions.length === 0 && categoryActions.length > 0) {
      const hasEquipment = boardState.equipmentInHand.length > 0 ||
        aiPlayer.network.floatingCables.length > 0 ||
        aiPlayer.network.floatingComputers.length > 0;
      
      if (hasEquipment) {
        validActions = [categoryActions[0]];
      }
    }
    
    if (validActions.length === 0) continue;
    
    // Select action with tie-breaking
    const selectedAction = selectMoveWithTies(validActions, diffCfg.tieBreakerRandomness);
    
    // Apply finish bias near endgame
    if (endgame.aiTurnsToWin !== undefined && endgame.aiTurnsToWin <= 2) {
      const deltaBitcoin = (selectedAction as any).__deltaBitcoin ?? 0;
      if (deltaBitcoin > 0) {
        // Boost utility for finish bias
        selectedAction.utility *= aggCfg.finishBias;
      }
    }
    
    recordAITurn(category, selectedAction.card?.subtype);
    
    return {
      action: selectedAction,
      category,
      allActions,
      reasoning: `Selected ${selectedAction.type} from ${category} (utility: ${selectedAction.utility.toFixed(1)})`,
    };
  }
  
  // Fallback: Force discard if nothing else
  return createFallbackDiscard(aiPlayer, allActions, difficulty);
}

// Generate all moves across categories
function generateAllMoves(
  gameState: GameState,
  aiPlayerIndex: number,
  boardState: BoardState,
  matchState: AIMatchState
): EvaluatedAction[] {
  const allMoves: EvaluatedAction[] = [];
  
  for (const category of CATEGORY_ORDER) {
    const actions = generateActionsForCategory(category, boardState, gameState, aiPlayerIndex);
    allMoves.push(...actions);
  }
  
  return allMoves;
}

// Force a winning action
function forceWinningAction(
  gameState: GameState,
  aiPlayerIndex: number,
  boardState: BoardState,
  matchState: AIMatchState
): SelectionResult {
  const allActions: EvaluatedAction[] = [];
  const aiPlayer = gameState.players[aiPlayerIndex];
  
  // Generate and evaluate all actions
  for (const category of CATEGORY_ORDER) {
    const actions = generateActionsForCategory(category, boardState, gameState, aiPlayerIndex);
    
    for (const action of actions) {
      const evaluation = evaluateActionUtility(action, boardState, gameState, aiPlayerIndex, matchState);
      action.utility = evaluation.finalUtility;
    }
    
    allActions.push(...actions);
  }
  
  // Find highest immediate bitcoin gain
  allActions.sort((a, b) => {
    const deltaA = (a as any).__deltaBitcoin ?? 0;
    const deltaB = (b as any).__deltaBitcoin ?? 0;
    return deltaB - deltaA;
  });
  
  const winningAction = allActions.find(a => ((a as any).__deltaBitcoin ?? 0) > 0);
  
  if (winningAction) {
    recordAITurn('build', winningAction.card?.subtype);
    return {
      action: winningAction,
      category: 'build',
      allActions,
      reasoning: 'WINNING MOVE: Taking action to reach victory',
    };
  }
  
  return {
    action: null,
    category: null,
    allActions,
    reasoning: 'No winning action available',
  };
}

// Select move with tie-breaking randomness
function selectMoveWithTies(
  scoredMoves: EvaluatedAction[],
  tieBreakerRandomness: number
): EvaluatedAction {
  if (scoredMoves.length === 0) {
    throw new Error('No moves to select from');
  }
  
  if (scoredMoves.length === 1) {
    return scoredMoves[0];
  }
  
  // Sort descending by utility
  const sorted = [...scoredMoves].sort((a, b) => b.utility - a.utility);
  const bestScore = sorted[0].utility;
  
  // Collect near-ties (within epsilon)
  const epsilon = Math.abs(bestScore) * 0.03 + 0.5;
  const candidates = sorted.filter(m => m.utility >= bestScore - epsilon);
  
  if (candidates.length === 1) {
    return candidates[0];
  }
  
  // Random selection among ties based on tieBreakerRandomness
  if (Math.random() < tieBreakerRandomness) {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }
  
  return candidates[0];
}

// Shuffle and sample array
function shuffleAndSample<T>(array: T[], sampleSize: number): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, sampleSize);
}

// Create fallback discard action
function createFallbackDiscard(
  aiPlayer: Player, 
  allActions: EvaluatedAction[],
  difficulty: AIDifficulty
): SelectionResult {
  if (aiPlayer.hand.length === 0) {
    return {
      action: null,
      category: null,
      allActions,
      reasoning: 'No cards in hand, cannot take action',
    };
  }
  
  // Discard priority: attacks > resolutions > classifications > equipment
  const cardPriority: Record<string, number> = {
    'attack': 1,
    'resolution': 2,
    'classification': 3,
    'equipment': 4,
  };
  
  const sortedHand = [...aiPlayer.hand].sort((a, b) => {
    const priorityA = cardPriority[a.type] || 5;
    const priorityB = cardPriority[b.type] || 5;
    return priorityA - priorityB;
  });
  
  const discardCard = sortedHand[0];
  
  const discardAction: EvaluatedAction = {
    type: 'discard',
    card: discardCard,
    utility: -5,
    reasoning: `Fallback discard: ${discardCard.name}`,
    risk: 0,
  };
  
  allActions.push(discardAction);
  recordAITurn('cycle', discardCard.subtype);
  
  return {
    action: discardAction,
    category: 'cycle',
    allActions,
    reasoning: 'Fallback: No valid actions, discarding least valuable card',
  };
}
