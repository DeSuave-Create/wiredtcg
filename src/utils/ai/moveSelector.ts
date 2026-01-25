// =============================================================================
// MOVE SELECTOR - Final action selection with difficulty randomness/bluff
// =============================================================================

import { GameState, Player } from '@/types/game';
import { AIDifficulty, EvaluatedAction } from './types';
import { BoardState, computeBoardState } from './boardState';
import { ActionCategory, generateActionsForCategory } from './actionGenerator';
import { evaluateActionUtility } from './evaluator';
import { analyzeEndgame, applyEndgameModifiers, isWinningAction, findWinningLine } from './endgame';
import { AIMatchState, getMatchState, recordAITurn } from './matchState';
import { getProfileMultipliers } from './profiles';
import { 
  DifficultyParams, 
  getDifficultyParams, 
  getCategoryThreshold,
  applyUtilityNoise,
  rollSkipOptimalChance,
  rollSkipOptimalK,
  rollBluffChance,
} from './difficulty';

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
  const boardState = computeBoardState(gameState, aiPlayerIndex, matchState.difficulty);
  const params = getDifficultyParams(matchState.difficulty);
  
  // Analyze endgame state
  const endgame = analyzeEndgame(boardState, gameState, aiPlayerIndex, matchState.difficulty);
  
  // CRITICAL: Check for winning line first
  if (endgame.canWinThisTurn) {
    const winLine = findWinningLine(
      boardState, 
      gameState, 
      aiPlayerIndex,
      gameState.movesRemaining,
      gameState.equipmentMovesRemaining
    );
    
    if (winLine) {
      // Force winning actions - search all categories for best scoring action
      return forceWinningAction(gameState, aiPlayerIndex, boardState, matchState);
    }
  }
  
  // Get profile multipliers with endgame adjustments
  const baseMultipliers = getProfileMultipliers(matchState.profile, matchState.difficulty);
  const adjustedMultipliers = applyEndgameModifiers(baseMultipliers, endgame);
  
  // Collect all evaluated actions
  const allActions: EvaluatedAction[] = [];
  
  // Process categories in priority order
  for (const category of CATEGORY_ORDER) {
    const categoryActions = generateActionsForCategory(category, boardState, gameState, aiPlayerIndex);
    
    // Evaluate each action
    for (const action of categoryActions) {
      const evaluation = evaluateActionUtility(action, boardState, gameState, aiPlayerIndex, matchState);
      action.utility = evaluation.finalUtility;
      
      // Apply endgame future cap if needed
      if (endgame.futureCap < 10 && evaluation.futureAdvantageScore > endgame.futureCap) {
        // Reduce utility for over-planning near endgame
        action.utility -= (evaluation.futureAdvantageScore - endgame.futureCap) * 15;
      }
      
      // Store delta bitcoin for absolute priority rule
      (action as any).__deltaBitcoin = evaluation.deltaBitcoinThisTurn;
      (action as any).__deltaOpponentDenial = evaluation.deltaOpponentBitcoinPrevented;
    }
    
    allActions.push(...categoryActions);
    
    // Apply utility noise
    for (const action of categoryActions) {
      action.utility = applyUtilityNoise(action.utility, params);
    }
    
    // Sort by utility
    categoryActions.sort((a, b) => b.utility - a.utility);
    
    // Apply ABSOLUTE PRIORITY RULE
    const scoringActions = categoryActions.filter(a => ((a as any).__deltaBitcoin || 0) >= 1);
    const bestScoring = scoringActions[0];
    
    if (bestScoring) {
      // Must choose a scoring action unless denial prevents more
      const nonScoringBetter = categoryActions.filter(a => {
        const denial = (a as any).__deltaOpponentDenial || 0;
        const scoring = (a as any).__deltaBitcoin || 0;
        return scoring === 0 && denial > (bestScoring as any).__deltaBitcoin;
      });
      
      if (nonScoringBetter.length === 0) {
        // Force scoring action
        categoryActions.length = 0;
        categoryActions.push(...scoringActions);
        categoryActions.sort((a, b) => b.utility - a.utility);
      }
    }
    
    // Get category threshold
    const threshold = getCategoryThreshold(category, matchState.difficulty);
    
    // Filter actions above threshold
    const validActions = categoryActions.filter(a => a.utility >= threshold);
    
    if (validActions.length === 0) {
      continue; // No valid actions in this category
    }
    
    // Apply skip optimal chance (intentional mistakes for Easy/Normal)
    let selectedAction = validActions[0];
    
    if (params.skipOptimalChanceMax > 0 && !endgame.canWinThisTurn && !endgame.opponentCanWinNextTurn) {
      const skipChance = rollSkipOptimalChance(params);
      
      if (Math.random() < skipChance && validActions.length > 1) {
        // Pick from top K instead of top 1
        const k = rollSkipOptimalK(params);
        const topK = validActions.slice(0, Math.min(k, validActions.length));
        
        // Weighted random selection (higher utility = higher chance)
        selectedAction = weightedRandomSelect(topK);
      }
    }
    
    // Apply bluff logic for Normal/Hard
    if (params.bluffEnabled && !endgame.canWinThisTurn && !endgame.opponentCanWinNextTurn) {
      const bluffAction = evaluateBluffOpportunity(
        validActions, 
        selectedAction, 
        params, 
        boardState
      );
      
      if (bluffAction) {
        selectedAction = bluffAction;
      }
    }
    
    // Record the action
    recordAITurn(category, selectedAction.card?.subtype);
    
    return {
      action: selectedAction,
      category,
      allActions,
      reasoning: `Selected ${selectedAction.type} from ${category} (utility: ${selectedAction.utility.toFixed(1)})`,
    };
  }
  
  // Fallback: Force discard if nothing else
  return createFallbackDiscard(aiPlayer, allActions, matchState.difficulty);
}

// Force a winning action
function forceWinningAction(
  gameState: GameState,
  aiPlayerIndex: number,
  boardState: BoardState,
  matchState: AIMatchState
): SelectionResult {
  const allActions: EvaluatedAction[] = [];
  
  // Generate all actions and find highest immediate scoring
  for (const category of CATEGORY_ORDER) {
    const actions = generateActionsForCategory(category, boardState, gameState, aiPlayerIndex);
    
    for (const action of actions) {
      const evaluation = evaluateActionUtility(action, boardState, gameState, aiPlayerIndex, matchState);
      action.utility = evaluation.finalUtility;
      (action as any).__deltaBitcoin = evaluation.deltaBitcoinThisTurn;
    }
    
    allActions.push(...actions);
  }
  
  // Sort by immediate bitcoin gain
  allActions.sort((a, b) => {
    const deltaA = (a as any).__deltaBitcoin || 0;
    const deltaB = (b as any).__deltaBitcoin || 0;
    return deltaB - deltaA;
  });
  
  const winningAction = allActions.find(a => ((a as any).__deltaBitcoin || 0) > 0);
  
  if (winningAction) {
    recordAITurn('build', winningAction.card?.subtype);
    return {
      action: winningAction,
      category: 'build',
      allActions,
      reasoning: 'WINNING MOVE: Taking action to reach victory',
    };
  }
  
  // No winning action found, fall back to normal selection
  return {
    action: null,
    category: null,
    allActions,
    reasoning: 'No winning action available despite being close',
  };
}

// Evaluate bluff opportunity
function evaluateBluffOpportunity(
  validActions: EvaluatedAction[],
  currentBest: EvaluatedAction,
  params: DifficultyParams,
  boardState: BoardState
): EvaluatedAction | null {
  const bluffChance = rollBluffChance(params);
  
  if (Math.random() > bluffChance) {
    return null;
  }
  
  // Find near-optimal actions within bluff delta
  const nearOptimal = validActions.filter(a => 
    currentBest.utility - a.utility <= params.bluffDeltaMax && a !== currentBest
  );
  
  if (nearOptimal.length === 0) {
    return null;
  }
  
  // Calculate trap value for each candidate
  const trapCandidates = nearOptimal.map(action => {
    // Simple trap value calculation
    let trapValue = 0;
    
    // "Tempting weak link" - leave fragile path exposed while holding repair
    if (action.type === 'play_switch' && boardState.resolutionsInHand.length > 0) {
      trapValue += 2;
    }
    
    // "Delay attack" - hold attack for bigger impact
    if (action.type === 'discard' && action.card?.type !== 'attack') {
      trapValue += 1;
    }
    
    // "Decoy build" - build in one area while planning elsewhere
    if (action.type === 'play_cable' && boardState.attacksInHand.length > 0) {
      trapValue += 1.5;
    }
    
    const expectedSwing = trapValue * 2;
    const totalTrapValue = params.opponentMisplayChance * expectedSwing;
    
    return { action, trapValue: totalTrapValue };
  });
  
  // Filter to meaningful trap values (>= 2 bitcoin swing potential)
  const viableTraps = trapCandidates.filter(t => t.trapValue >= 1);
  
  if (viableTraps.length > 0) {
    // Pick best trap
    viableTraps.sort((a, b) => b.trapValue - a.trapValue);
    return viableTraps[0].action;
  }
  
  return null;
}

// Weighted random selection from top actions
function weightedRandomSelect(actions: EvaluatedAction[]): EvaluatedAction {
  if (actions.length === 1) return actions[0];
  
  // Softmax-style weighting based on utility
  const minUtility = Math.min(...actions.map(a => a.utility));
  const weights = actions.map(a => Math.exp((a.utility - minUtility) / 10));
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  
  let random = Math.random() * totalWeight;
  for (let i = 0; i < actions.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return actions[i];
    }
  }
  
  return actions[0];
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
