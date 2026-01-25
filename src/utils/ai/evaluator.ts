// =============================================================================
// ACTION EVALUATOR - Computes utility for each candidate action
// =============================================================================

import { GameState, Player, PlayerNetwork, Card } from '@/types/game';
import { AIDifficulty, EvaluatedAction } from './types';
import { BoardState } from './boardState';
import { AIProfile, ProfileMultipliers, getProfileMultipliers } from './profiles';
import { DifficultyParams, getDifficultyParams } from './difficulty';
import { AIMatchState } from './matchState';

// Utility components for an action
export interface UtilityComponents {
  deltaBitcoinThisTurn: number;
  deltaOpponentBitcoinPrevented: number;
  boardStabilityScore: number;
  futureAdvantageScore: number;
  riskPenalty: number;
  comboBonus: number;
}

// Base utility weights
const UTILITY_WEIGHTS = {
  bitcoinGain: 100,
  opponentDenial: 60,
  boardStability: 25,
  futureAdvantage: 15,
  riskPenalty: 20,
};

// Calculate delta bitcoin this turn from an action
export function calculateDeltaBitcoin(
  boardState: BoardState,
  action: EvaluatedAction,
  aiPlayer: Player
): number {
  // Immediate scoring actions
  switch (action.type) {
    case 'play_computer':
      // Computer on working cable = +1 bitcoin
      if (action.targetId && boardState.availableCableSlots > 0) {
        return 1;
      }
      return 0;
    
    case 'connect_floating_computer':
      // Floating computer to working cable = +1 bitcoin
      return 1;
    
    case 'connect_cable_to_switch':
      // Count computers on the floating cable being connected
      const floatingCable = aiPlayer.network.floatingCables.find(c => c.id === action.sourceId);
      if (floatingCable) {
        return floatingCable.computers.filter(c => !c.isDisabled).length;
      }
      return 0;
    
    case 'move_cable_to_switch':
      // Moving cable from disabled switch to enabled - count its computers
      for (const sw of aiPlayer.network.switches) {
        for (const cable of sw.cables) {
          if (cable.id === action.sourceId && sw.isDisabled) {
            return cable.computers.filter(c => !c.isDisabled).length;
          }
        }
      }
      return 0;
    
    case 'move_computer_to_cable':
      // Moving computer from disabled path to working path = +1
      return 1;
    
    case 'play_resolution':
      // Resolution might restore scoring if it fixes blocking issue
      return estimateResolutionValue(boardState, aiPlayer, action);
    
    case 'reroute_cable':
      // Rerouting cable to enabled switch
      return estimateRerouteValue(boardState, aiPlayer, action);
    
    default:
      return 0;
  }
}

// Estimate resolution value (computers restored)
function estimateResolutionValue(
  boardState: BoardState, 
  aiPlayer: Player, 
  action: EvaluatedAction
): number {
  if (!action.targetId) return 0;
  
  // Find the target equipment
  for (const sw of aiPlayer.network.switches) {
    if (sw.id === action.targetId && sw.isDisabled) {
      // Repairing switch - count all computers on its cables
      return sw.cables.reduce((sum, cable) => 
        sum + cable.computers.filter(c => !c.isDisabled).length, 0);
    }
    
    for (const cable of sw.cables) {
      if (cable.id === action.targetId && cable.isDisabled && !sw.isDisabled) {
        // Repairing cable on active switch
        return cable.computers.filter(c => !c.isDisabled).length;
      }
      
      for (const comp of cable.computers) {
        if (comp.id === action.targetId && comp.isDisabled && !cable.isDisabled && !sw.isDisabled) {
          // Repairing computer on active path
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
  // Similar to move_cable_to_switch
  for (const sw of aiPlayer.network.switches) {
    for (const cable of sw.cables) {
      if (cable.id === action.sourceId) {
        // If currently on disabled switch and moving to enabled
        if (sw.isDisabled) {
          return cable.computers.filter(c => !c.isDisabled).length;
        }
      }
    }
  }
  return 0;
}

// Calculate opponent bitcoin prevented by this action
export function calculateOpponentDenial(
  boardState: BoardState,
  action: EvaluatedAction,
  oppPlayer: Player
): number {
  if (action.type !== 'play_attack' && action.type !== 'start_audit') {
    return 0;
  }
  
  if (action.type === 'start_audit') {
    // Audit returns computers = reduces opponent income
    return Math.ceil(boardState.oppTotalComputers / 2);
  }
  
  // Attack - find target and count affected computers
  if (!action.targetId) return 0;
  
  for (const sw of oppPlayer.network.switches) {
    if (sw.id === action.targetId && !sw.isDisabled) {
      // Disabling switch affects all computers on it
      return sw.cables.reduce((sum, cable) => 
        sum + cable.computers.filter(c => !c.isDisabled).length, 0);
    }
    
    for (const cable of sw.cables) {
      if (cable.id === action.targetId && !cable.isDisabled && !sw.isDisabled) {
        return cable.computers.filter(c => !c.isDisabled).length;
      }
      
      for (const comp of cable.computers) {
        if (comp.id === action.targetId && !comp.isDisabled) {
          return 1;
        }
      }
    }
  }
  
  return 0;
}

// Calculate board stability score (0-10)
export function calculateBoardStability(
  boardState: BoardState,
  action: EvaluatedAction,
  aiPlayer: Player
): number {
  let score = 0;
  
  // +1 per redundant path created (cap 4)
  if (action.type === 'play_switch') {
    score += Math.min(2, boardState.availableEnabledSwitches + 1); // New switch adds redundancy
  }
  
  if (action.type === 'play_cable' && boardState.availableEnabledSwitches >= 2) {
    score += 1; // Adding cable to redundant network
  }
  
  // +1 per critical node protected/connected (cap 3)
  if (action.type === 'play_resolution') {
    score += 2; // Repairing adds stability
  }
  
  // +1 per reduction in single point of failure (cap 3)
  if (boardState.availableEnabledSwitches === 1 && action.type === 'play_switch') {
    score += 3; // Critical - adding redundancy
  }
  
  return Math.min(10, score);
}

// Calculate future advantage score (0-10)
export function calculateFutureAdvantage(
  boardState: BoardState,
  action: EvaluatedAction,
  aiPlayer: Player
): number {
  let score = 0;
  
  // +2 if action sets up likely additional activation next turn
  if (action.type === 'play_cable' && boardState.computersInHand.length > 0) {
    score += 2; // Cable enables future computer placement
  }
  
  if (action.type === 'play_switch' && boardState.cablesInHand.length > 0) {
    score += 2; // Switch enables future cable placement
  }
  
  // +2 if action increases hand quality (via cycle)
  if (action.type === 'discard') {
    // Discarding low-value cards improves hand quality
    if (action.reasoning?.includes('Duplicate') || action.reasoning?.includes('no matching')) {
      score += 2;
    }
  }
  
  // +2 if action increases equipment mobility value (Field Tech synergy)
  if (action.card?.subtype === 'field-tech') {
    score += 3; // Field Tech provides future move advantage
  }
  
  // Classification cards provide ongoing value
  if (action.type === 'play_classification') {
    score += 2;
  }
  
  return Math.min(10, score);
}

// Calculate risk penalty (0-10)
export function calculateRiskPenalty(
  boardState: BoardState,
  action: EvaluatedAction,
  aiPlayer: Player,
  riskTolerance: number
): number {
  let penalty = 0;
  
  // +3 if action creates a fragile scoring path
  if (action.type === 'play_computer' && boardState.availableEnabledSwitches === 1) {
    penalty += 2; // Single switch dependency
  }
  
  // +2 if action spends a key defense/repair
  if (action.type === 'play_resolution') {
    const resolutionCount = boardState.resolutionsInHand.length;
    if (resolutionCount === 1) {
      penalty += 2; // Using last resolution
    }
  }
  
  // +2 if action reduces ability to respond to opponent next turn
  if (action.type === 'discard' && action.card?.subtype === 'secured') {
    penalty += 3; // Discarding counter is risky
  }
  
  if (action.type === 'start_audit') {
    penalty += 2; // Audits can be countered
  }
  
  // Scale by (1 + riskTolerance) - higher tolerance = lower effective penalty
  const rawPenalty = Math.min(10, penalty);
  return rawPenalty * (2 - riskTolerance); // riskTolerance 0.3 -> 1.7x penalty, 0.7 -> 1.3x penalty
}

// Calculate combo bonus (lookahead-based)
export function calculateComboBonus(
  boardState: BoardState,
  action: EvaluatedAction,
  aiPlayer: Player,
  lookaheadDepth: number
): number {
  // Simple lookahead: check if this action enables high-value follow-ups
  let bonus = 0;
  
  // If placing equipment, check for chain opportunities
  if (action.type === 'play_switch' && boardState.cablesInHand.length > 0) {
    bonus += 5; // Can follow with cable
    if (boardState.computersInHand.length > 0 && lookaheadDepth >= 2) {
      bonus += 5; // Can chain to computer
    }
  }
  
  if (action.type === 'play_cable' && boardState.computersInHand.length > 0) {
    bonus += 5; // Can follow with computer
  }
  
  // Field Tech enables equipment combos
  if (action.card?.subtype === 'field-tech' && boardState.equipmentInHand.length >= 2) {
    bonus += 8 * Math.min(lookaheadDepth, 2); // Free equipment moves enable combos
  }
  
  // Scale by 0.5 as per spec
  return bonus * 0.5;
}

// Calculate full utility for an action
export function evaluateActionUtility(
  action: EvaluatedAction,
  boardState: BoardState,
  gameState: GameState,
  aiPlayerIndex: number,
  matchState: AIMatchState
): UtilityComponents & { finalUtility: number } {
  const aiPlayer = gameState.players[aiPlayerIndex];
  const oppPlayer = gameState.players[aiPlayerIndex === 0 ? 1 : 0];
  const params = getDifficultyParams(matchState.difficulty);
  const profileMults = getProfileMultipliers(matchState.profile, matchState.difficulty);
  
  // Calculate all utility components
  const deltaBitcoinThisTurn = calculateDeltaBitcoin(boardState, action, aiPlayer);
  const deltaOpponentBitcoinPrevented = calculateOpponentDenial(boardState, action, oppPlayer);
  const boardStabilityScore = calculateBoardStability(boardState, action, aiPlayer);
  const futureAdvantageScore = calculateFutureAdvantage(boardState, action, aiPlayer);
  const riskPenalty = calculateRiskPenalty(boardState, action, aiPlayer, params.riskTolerance);
  const comboBonus = calculateComboBonus(boardState, action, aiPlayer, params.lookaheadDepth);
  
  // Apply profile multipliers to utility
  const finalUtility = 
    UTILITY_WEIGHTS.bitcoinGain * deltaBitcoinThisTurn * profileMults.bitcoinGainMult +
    UTILITY_WEIGHTS.opponentDenial * deltaOpponentBitcoinPrevented * profileMults.denyOpponentMult +
    UTILITY_WEIGHTS.boardStability * boardStabilityScore * profileMults.stabilityMult +
    UTILITY_WEIGHTS.futureAdvantage * futureAdvantageScore * profileMults.futureMult -
    UTILITY_WEIGHTS.riskPenalty * riskPenalty * profileMults.riskPenaltyMult +
    comboBonus;
  
  return {
    deltaBitcoinThisTurn,
    deltaOpponentBitcoinPrevented,
    boardStabilityScore,
    futureAdvantageScore,
    riskPenalty,
    comboBonus,
    finalUtility,
  };
}
