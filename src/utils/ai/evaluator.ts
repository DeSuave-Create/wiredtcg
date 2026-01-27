// =============================================================================
// ACTION EVALUATOR - Computes utility using new difficulty/aggression system
// =============================================================================

import { GameState, Player, Card } from '@/types/game';
import { EvaluatedAction } from './types';
import { BoardState } from './boardState';
import { DifficultyConfig, CATEGORY_ORDER_WEIGHTS, lerp } from './difficulty';
import { AggressionConfig, getCategoryBias } from './profiles';
import { AIMatchState } from './matchState';

// Utility components for an action
export interface UtilityComponents {
  baseUtility: number;
  categoryWeight: number;
  comboBonus: number;
  threatBonus: number;
  denyRecoveryBonus: number;
  riskAdjustment: number;
  floatingEquipmentMod: number;
  lookaheadValue: number;
  finalUtility: number;
}

// Base utility calculation
export function calculateBaseUtility(
  action: EvaluatedAction,
  boardState: BoardState,
  aiPlayer: Player
): number {
  let utility = 0;
  
  // Immediate bitcoin gain (highest priority)
  const deltaBitcoin = calculateDeltaBitcoin(action, boardState, aiPlayer);
  utility += 100 * deltaBitcoin;
  
  // Opponent denial
  const denial = calculateOpponentDenial(action, boardState);
  utility += 60 * denial;
  
  // Board stability
  utility += 25 * calculateBoardStability(action, boardState);
  
  // Future advantage
  utility += 15 * calculateFutureAdvantage(action, boardState);
  
  return utility;
}

// Calculate delta bitcoin this turn from an action
export function calculateDeltaBitcoin(
  action: EvaluatedAction,
  boardState: BoardState,
  aiPlayer: Player
): number {
  switch (action.type) {
    case 'play_computer':
      if (action.targetId && boardState.availableCableSlots > 0) return 1;
      return 0;
    
    case 'connect_floating_computer':
      return 1;
    
    case 'connect_cable_to_switch':
      const floatingCable = aiPlayer.network.floatingCables.find(c => c.id === action.sourceId);
      if (floatingCable) {
        return floatingCable.computers.filter(c => !c.isDisabled).length;
      }
      return 0;
    
    case 'move_cable_to_switch':
      for (const sw of aiPlayer.network.switches) {
        for (const cable of sw.cables) {
          if (cable.id === action.sourceId && sw.isDisabled) {
            return cable.computers.filter(c => !c.isDisabled).length;
          }
        }
      }
      return 0;
    
    case 'move_computer_to_cable':
      return 1;
    
    case 'play_resolution':
      return estimateResolutionValue(boardState, aiPlayer, action);
    
    case 'reroute_cable':
      return estimateRerouteValue(boardState, aiPlayer, action);
    
    default:
      return 0;
  }
}

// Estimate resolution value
function estimateResolutionValue(
  boardState: BoardState, 
  aiPlayer: Player, 
  action: EvaluatedAction
): number {
  if (!action.targetId) return 0;
  
  for (const sw of aiPlayer.network.switches) {
    if (sw.id === action.targetId && sw.isDisabled) {
      return sw.cables.reduce((sum, cable) => 
        sum + cable.computers.filter(c => !c.isDisabled).length, 0);
    }
    
    for (const cable of sw.cables) {
      if (cable.id === action.targetId && cable.isDisabled && !sw.isDisabled) {
        return cable.computers.filter(c => !c.isDisabled).length;
      }
      
      for (const comp of cable.computers) {
        if (comp.id === action.targetId && comp.isDisabled && !cable.isDisabled && !sw.isDisabled) {
          return 1;
        }
      }
    }
  }
  
  return 0;
}

// Estimate reroute value
function estimateRerouteValue(
  boardState: BoardState,
  aiPlayer: Player,
  action: EvaluatedAction
): number {
  for (const sw of aiPlayer.network.switches) {
    for (const cable of sw.cables) {
      if (cable.id === action.sourceId && sw.isDisabled) {
        return cable.computers.filter(c => !c.isDisabled).length;
      }
    }
  }
  return 0;
}

// Calculate opponent denial
function calculateOpponentDenial(
  action: EvaluatedAction,
  boardState: BoardState
): number {
  if (action.type === 'start_audit') {
    return Math.ceil(boardState.oppTotalComputers / 2);
  }
  
  if (action.type === 'play_attack' && action.targetId) {
    // Estimate impact based on target type
    return 1; // Simplified - actual calculation would inspect opponent network
  }
  
  return 0;
}

// Board stability score (0-10)
function calculateBoardStability(
  action: EvaluatedAction,
  boardState: BoardState
): number {
  let score = 0;
  
  if (action.type === 'play_switch') {
    score += Math.min(2, boardState.availableEnabledSwitches + 1);
    if (boardState.availableEnabledSwitches === 0) score += 3;
  }
  
  if (action.type === 'play_cable' && boardState.availableEnabledSwitches >= 2) {
    score += 1;
  }
  
  if (action.type === 'play_resolution') {
    score += 2;
  }
  
  return Math.min(10, score) / 10;
}

// Future advantage score (0-10)
function calculateFutureAdvantage(
  action: EvaluatedAction,
  boardState: BoardState
): number {
  let score = 0;
  
  if (action.type === 'play_cable' && boardState.computersInHand.length > 0) score += 2;
  if (action.type === 'play_switch' && boardState.cablesInHand.length > 0) score += 2;
  if (action.card?.subtype === 'field-tech') score += 3;
  if (action.type === 'play_classification') score += 2;
  
  return Math.min(10, score) / 10;
}

// =============================================================================
// CATEGORY WEIGHT - enforces order + personality
// =============================================================================
export function calculateCategoryWeight(
  category: string,
  boardState: BoardState,
  diffCfg: DifficultyConfig,
  aggCfg: AggressionConfig
): number {
  // Base order weight
  const baseOrderWeight = CATEGORY_ORDER_WEIGHTS[category] ?? 1.0;
  
  // Aggression bias
  const aggressionBias = getCategoryBias(category, aggCfg);
  
  // Contextual modifier
  const contextMod = calculateContextualModifier(category, boardState, diffCfg);
  
  return baseOrderWeight * aggressionBias * contextMod;
}

// Contextual category modifier
function calculateContextualModifier(
  category: string,
  boardState: BoardState,
  diffCfg: DifficultyConfig
): number {
  let mod = 1.0;
  
  // If key equipment is inactive, prioritize repair/reroute
  const hasCriticalInactive = boardState.strandedCables > 0 || 
    boardState.disabledSwitches > 0 || 
    boardState.disabledCables > 0;
  
  if ((category === 'repair' || category === 'reroute') && hasCriticalInactive) {
    mod += 0.20 * diffCfg.threatSensitivity;
  }
  
  // If opponent near winning, prioritize disrupt
  if (category === 'disrupt' && boardState.oppNearWin) {
    mod += 0.25 * diffCfg.threatSensitivity;
  }
  
  // If hand is clogged (all equipment), increase cycle preference slightly
  const handClogged = boardState.equipmentInHand.length >= 5;
  if (category === 'cycle' && handClogged) {
    mod += 0.15 * (1.0 - diffCfg.discardStrictness);
  }
  
  return mod;
}

// =============================================================================
// BONUS MODULES - Scale with difficulty
// =============================================================================

// Combo bonus - setup recognition
export function calculateComboBonus(
  action: EvaluatedAction,
  boardState: BoardState,
  diffCfg: DifficultyConfig
): number {
  if (diffCfg.comboAwareness <= 0) return 0;
  
  let bonus = 0;
  
  // Creates future connect node
  if (action.type === 'play_switch' || action.type === 'play_cable') {
    if (boardState.computersInHand.length > 0 || boardState.cablesInHand.length > 0) {
      bonus += 25 * diffCfg.comboAwareness;
    }
  }
  
  // Completes a combo (scores now AND sets up more)
  const deltaBitcoin = (action as any).__deltaBitcoin ?? 0;
  if (deltaBitcoin > 0 && boardState.availableCableSlots > deltaBitcoin) {
    bonus += 45 * diffCfg.comboAwareness;
  }
  
  return bonus;
}

// Threat bonus - defensive/offensive responses
export function calculateThreatBonus(
  action: EvaluatedAction,
  boardState: BoardState,
  diffCfg: DifficultyConfig
): number {
  if (diffCfg.threatSensitivity <= 0) return 0;
  
  let bonus = 0;
  
  // Blocks opponent win line
  if (boardState.oppNearWin && action.type === 'play_attack') {
    bonus += 60 * diffCfg.threatSensitivity;
  }
  
  // Reduces opponent tempo
  if (action.type === 'play_attack' || action.type === 'start_audit') {
    bonus += 25 * diffCfg.threatSensitivity;
  }
  
  return bonus;
}

// Deny recovery bonus - target opponent rebuilding
export function calculateDenyRecoveryBonus(
  action: EvaluatedAction,
  boardState: BoardState,
  diffCfg: DifficultyConfig
): number {
  if (diffCfg.denyRecoveryPriority <= 0) return 0;
  
  // Attacks that target opponent's key infrastructure
  if (action.type === 'play_attack') {
    return 35 * diffCfg.denyRecoveryPriority;
  }
  
  return 0;
}

// Risk adjustment based on risk tolerance
export function calculateRiskAdjustment(
  action: EvaluatedAction,
  boardState: BoardState,
  diffCfg: DifficultyConfig
): number {
  let variance = 0;
  
  // High variance actions
  if (action.type === 'start_audit') variance = 30; // Can be countered
  if (action.type === 'play_attack') variance = 20;
  if (action.type === 'steal_classification') variance = 40;
  
  // Low variance = building
  if (action.type === 'play_switch' || action.type === 'play_cable' || action.type === 'play_computer') {
    variance = 5;
  }
  
  // Risk tolerance affects how we value variance
  // High tolerance (0.92) -> slight bonus for variance
  // Low tolerance (0.25) -> penalty for variance
  return (diffCfg.riskTolerance - 0.5) * variance * 0.5;
}

// =============================================================================
// FLOATING EQUIPMENT RULE - Penalty/bonus for discarding vs playing
// =============================================================================
export function calculateFloatingEquipmentMod(
  action: EvaluatedAction,
  boardState: BoardState,
  diffCfg: DifficultyConfig
): number {
  if (action.type === 'discard' && action.card?.type === 'equipment') {
    const canConnectSoon = existsLegalConnectNextTurn(boardState, action.card);
    
    if (canConnectSoon) {
      // Big penalty for discarding useful equipment
      return -lerp(40, 120, diffCfg.discardStrictness);
    } else {
      // Smaller penalty for discarding stranded equipment
      return -lerp(5, 35, diffCfg.discardStrictness);
    }
  }
  
  // Reward playing equipment as floating if it enables future connections
  if (action.type === 'play_computer' || action.type === 'play_cable') {
    const isFloating = !action.targetId || action.reasoning?.includes('floating');
    if (isFloating && boardState.availableEnabledSwitches > 0) {
      return lerp(10, 60, diffCfg.comboAwareness);
    }
  }
  
  return 0;
}

// Check if equipment can connect next turn
function existsLegalConnectNextTurn(boardState: BoardState, card: Card): boolean {
  if (card.subtype === 'computer') {
    return boardState.availableCableSlots > 0 || boardState.cablesInHand.length > 0;
  }
  if (card.subtype?.includes('cable')) {
    return boardState.availableEnabledSwitches > 0 || boardState.switchesInHand.length > 0;
  }
  if (card.subtype === 'switch') {
    return true; // Switch can always be placed
  }
  return false;
}

// =============================================================================
// LOOKAHEAD - Mini simulation for deeper evaluation
// =============================================================================
export function calculateLookaheadValue(
  action: EvaluatedAction,
  boardState: BoardState,
  diffCfg: DifficultyConfig
): number {
  if (diffCfg.lookaheadDepth <= 0) return 0;
  
  // Simple lookahead based on immediate follow-up potential
  let value = 0;
  
  // Chain potential
  if (action.type === 'play_switch') {
    if (boardState.cablesInHand.length > 0) value += 20;
    if (boardState.computersInHand.length > 0 && diffCfg.lookaheadDepth >= 2) value += 15;
  }
  
  if (action.type === 'play_cable') {
    if (boardState.computersInHand.length > 0) value += 20;
  }
  
  // Field Tech combo potential
  if (action.card?.subtype === 'field-tech' && boardState.equipmentInHand.length >= 2) {
    value += 30 * Math.min(diffCfg.lookaheadDepth / 4, 1);
  }
  
  // Scale by difficulty's trust in lookahead
  return value * lerp(0.6, 1.2, diffCfg.utilityMultiplier / 1.35);
}

// =============================================================================
// MAIN EVALUATION - Combines all components
// =============================================================================
export function evaluateActionUtility(
  action: EvaluatedAction,
  boardState: BoardState,
  gameState: GameState,
  aiPlayerIndex: number,
  matchState: AIMatchState
): UtilityComponents {
  const aiPlayer = gameState.players[aiPlayerIndex];
  const { diffCfg, aggCfg } = matchState.profile;
  
  // Base utility
  const baseUtility = calculateBaseUtility(action, boardState, aiPlayer);
  
  // Store delta bitcoin for priority rules
  const deltaBitcoin = calculateDeltaBitcoin(action, boardState, aiPlayer);
  (action as any).__deltaBitcoin = deltaBitcoin;
  
  // Category weight
  const category = categorizeAction(action);
  const categoryWeight = calculateCategoryWeight(category, boardState, diffCfg, aggCfg);
  
  // Bonus modules
  const comboBonus = calculateComboBonus(action, boardState, diffCfg);
  const threatBonus = calculateThreatBonus(action, boardState, diffCfg);
  const denyRecoveryBonus = calculateDenyRecoveryBonus(action, boardState, diffCfg);
  const riskAdjustment = calculateRiskAdjustment(action, boardState, diffCfg);
  const floatingEquipmentMod = calculateFloatingEquipmentMod(action, boardState, diffCfg);
  const lookaheadValue = calculateLookaheadValue(action, boardState, diffCfg);
  
  // Apply difficulty multiplier
  let effective = baseUtility * diffCfg.utilityMultiplier;
  
  // Add bonuses
  effective += comboBonus;
  effective += threatBonus;
  effective += denyRecoveryBonus;
  effective += riskAdjustment;
  effective += floatingEquipmentMod;
  effective += lookaheadValue;
  
  // Apply category weight last
  const finalUtility = effective * categoryWeight;
  
  return {
    baseUtility,
    categoryWeight,
    comboBonus,
    threatBonus,
    denyRecoveryBonus,
    riskAdjustment,
    floatingEquipmentMod,
    lookaheadValue,
    finalUtility,
  };
}

// Categorize action for weighting
function categorizeAction(action: EvaluatedAction): string {
  switch (action.type) {
    case 'play_switch':
    case 'play_cable':
    case 'play_computer':
    case 'connect_floating_computer':
    case 'connect_cable_to_switch':
      return 'build';
    
    case 'reroute_cable':
    case 'move_cable_to_switch':
    case 'move_computer_to_cable':
      return 'reroute';
    
    case 'play_resolution':
      return 'repair';
    
    case 'play_attack':
    case 'start_audit':
      return 'disrupt';
    
    case 'play_classification':
    case 'steal_classification':
      return 'setup';
    
    case 'discard':
    case 'pass':
      return 'cycle';
    
    default:
      return 'cycle';
  }
}
