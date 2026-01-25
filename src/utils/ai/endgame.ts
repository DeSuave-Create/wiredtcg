// =============================================================================
// ENDGAME ANALYZER - Detects win/loss conditions and applies overrides
// =============================================================================

import { GameState, Player } from '@/types/game';
import { BoardState } from './boardState';
import { AIDifficulty } from './types';
import { ProfileMultipliers } from './profiles';

export interface EndgameState {
  canWinThisTurn: boolean;
  opponentCanWinNextTurn: boolean;
  aiCanWinNextTurn: boolean;
  
  // Multiplier adjustments for endgame situations
  denyMultiplierBoost: number;
  bitcoinMultiplierBoost: number;
  futureCap: number; // Cap on future advantage contribution
}

const WIN_TARGET = 25;

// Analyze endgame state
export function analyzeEndgame(
  boardState: BoardState,
  gameState: GameState,
  aiPlayerIndex: number,
  difficulty: AIDifficulty
): EndgameState {
  const aiPlayer = gameState.players[aiPlayerIndex];
  const oppPlayer = gameState.players[aiPlayerIndex === 0 ? 1 : 0];
  
  const aiBitcoin = aiPlayer.score;
  const oppBitcoin = oppPlayer.score;
  const aiIncome = boardState.myConnectedComputers;
  const oppIncome = boardState.oppConnectedComputers;
  
  // Turns to win calculations
  const aiTurnsToWin = aiIncome > 0 
    ? Math.ceil((WIN_TARGET - aiBitcoin) / aiIncome) 
    : Infinity;
  const oppTurnsToWin = oppIncome > 0 
    ? Math.ceil((WIN_TARGET - oppBitcoin) / oppIncome) 
    : Infinity;
  
  // Can AI win this turn?
  // Check if current score + potential scoring this turn >= WIN_TARGET
  const potentialScoreThisTurn = aiBitcoin + aiIncome + boardState.myPotentialComputers;
  const canWinThisTurn = potentialScoreThisTurn >= WIN_TARGET;
  
  // Can opponent win next turn?
  const opponentCanWinNextTurn = oppTurnsToWin <= 1;
  
  // Can AI win next turn (but not this turn)?
  const aiCanWinNextTurn = aiTurnsToWin <= 1 && !canWinThisTurn;
  
  // Calculate multiplier adjustments based on endgame state
  let denyMultiplierBoost = 1.0;
  let bitcoinMultiplierBoost = 1.0;
  let futureCap = 10; // Default no cap
  
  if (opponentCanWinNextTurn && !canWinThisTurn) {
    // CRITICAL: Must deny opponent
    switch (difficulty) {
      case 'easy': denyMultiplierBoost = 1.2; break;
      case 'normal': denyMultiplierBoost = 1.5; break;
      case 'hard': denyMultiplierBoost = 2.0; break;
    }
  }
  
  if (aiCanWinNextTurn) {
    // Push for win - emphasize bitcoin gain
    switch (difficulty) {
      case 'easy': bitcoinMultiplierBoost = 1.2; break;
      case 'normal': bitcoinMultiplierBoost = 1.4; break;
      case 'hard': bitcoinMultiplierBoost = 1.6; break;
    }
    futureCap = 4; // Don't over-plan when about to win
  }
  
  return {
    canWinThisTurn,
    opponentCanWinNextTurn,
    aiCanWinNextTurn,
    denyMultiplierBoost,
    bitcoinMultiplierBoost,
    futureCap,
  };
}

// Apply endgame modifiers to profile multipliers
export function applyEndgameModifiers(
  baseMultipliers: ProfileMultipliers,
  endgame: EndgameState
): ProfileMultipliers {
  return {
    ...baseMultipliers,
    bitcoinGainMult: baseMultipliers.bitcoinGainMult * endgame.bitcoinMultiplierBoost,
    denyOpponentMult: baseMultipliers.denyOpponentMult * endgame.denyMultiplierBoost,
  };
}

// Check if this action could lead to a win this turn
export function isWinningAction(
  currentScore: number,
  deltaBitcoin: number,
  potentialFollowups: number = 0
): boolean {
  return currentScore + deltaBitcoin + potentialFollowups >= WIN_TARGET;
}

// Find winning line if it exists (limited search)
export function findWinningLine(
  boardState: BoardState,
  gameState: GameState,
  aiPlayerIndex: number,
  movesRemaining: number,
  equipmentMovesRemaining: number
): { actionSequence: string[]; totalBitcoin: number } | null {
  const aiPlayer = gameState.players[aiPlayerIndex];
  const currentScore = aiPlayer.score;
  const neededToWin = WIN_TARGET - currentScore;
  
  // Quick check: can't possibly win if not enough potential
  const maxPotential = boardState.myConnectedComputers + 
    boardState.floatingComputers + 
    boardState.computersInHand.length +
    boardState.floatingCables * 2; // Rough estimate
  
  if (maxPotential < neededToWin) {
    return null;
  }
  
  // Simplified win-line search
  // Priority: Connect floating computers/cables first (free moves), then play from hand
  const actionSequence: string[] = [];
  let totalBitcoin = boardState.myConnectedComputers;
  let freeMovesLeft = equipmentMovesRemaining;
  let regularMovesLeft = movesRemaining;
  
  // Connect floating computers (free)
  const floatingComps = boardState.floatingComputers;
  const slotsAvailable = boardState.availableCableSlots;
  const connectableFloating = Math.min(floatingComps, slotsAvailable);
  
  if (connectableFloating > 0) {
    totalBitcoin += connectableFloating;
    actionSequence.push(`Connect ${connectableFloating} floating computer(s)`);
  }
  
  // Connect floating cables with computers (free)
  // This would need more detailed analysis of cable contents
  
  // Play computers from hand
  let remainingSlots = slotsAvailable - connectableFloating;
  const computersToPlay = Math.min(boardState.computersInHand.length, remainingSlots, regularMovesLeft);
  
  if (computersToPlay > 0) {
    totalBitcoin += computersToPlay;
    regularMovesLeft -= computersToPlay;
    actionSequence.push(`Play ${computersToPlay} computer(s) from hand`);
  }
  
  if (currentScore + totalBitcoin >= WIN_TARGET) {
    return { actionSequence, totalBitcoin };
  }
  
  return null;
}
