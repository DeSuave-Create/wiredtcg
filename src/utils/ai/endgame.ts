// =============================================================================
// ENDGAME ANALYSIS - Winning/blocking detection
// =============================================================================

import { GameState, Player } from '@/types/game';
import { EvaluatedAction } from './types';
import { BoardState } from './boardState';
import { AIDifficulty, DifficultyConfig, getDifficultyConfig } from './difficulty';

export interface EndgameState {
  canWinThisTurn: boolean;
  opponentCanWinNextTurn: boolean;
  aiTurnsToWin: number;
  oppTurnsToWin: number;
  futureCap: number;
  denialMultiplier: number;
  scoringMultiplier: number;
  aiCanWinNextTurn: boolean;
  denyMultiplierBoost: number;
  bitcoinMultiplierBoost: number;
}

const WIN_TARGET = 25;

// Analyze endgame state
export function analyzeEndgame(
  boardState: BoardState,
  gameState: GameState,
  aiPlayerIndex: number,
  difficulty: AIDifficulty
): EndgameState {
  const diffCfg = getDifficultyConfig(difficulty);
  const aiPlayer = gameState.players[aiPlayerIndex];
  const oppPlayer = gameState.players[aiPlayerIndex === 0 ? 1 : 0];
  
  const aiIncome = boardState.myConnectedComputers;
  const aiPotential = boardState.myPotentialComputers;
  const oppIncome = boardState.oppConnectedComputers;
  
  // Calculate turns to win
  const aiTurnsToWin = aiIncome > 0 
    ? Math.ceil((WIN_TARGET - aiPlayer.score) / aiIncome)
    : Infinity;
  
  const oppTurnsToWin = oppIncome > 0
    ? Math.ceil((WIN_TARGET - oppPlayer.score) / oppIncome)
    : Infinity;
  
  // Can AI win this turn?
  const movesAvailable = gameState.movesRemaining + gameState.equipmentMovesRemaining;
  const canWinThisTurn = (aiPlayer.score + aiIncome + Math.min(aiPotential, movesAvailable)) >= WIN_TARGET;
  
  // Can opponent win next turn?
  const opponentCanWinNextTurn = oppPlayer.score + oppIncome >= WIN_TARGET;
  
  // Can AI win next turn?
  const aiCanWinNextTurn = aiTurnsToWin <= 1 && !canWinThisTurn;
  
  // Calculate modifiers based on difficulty
  let denialMultiplier = 1.0;
  let scoringMultiplier = 1.0;
  let futureCap = 10;
  
  // If opponent can win next turn, boost denial based on difficulty
  if (opponentCanWinNextTurn) {
    switch (difficulty) {
      case 'easy': denialMultiplier = 1.2; break;
      case 'normal': denialMultiplier = 1.5; break;
      case 'hard': denialMultiplier = 2.0; break;
      case 'nightmare': denialMultiplier = 2.5; break;
    }
  }
  
  // If AI can win next turn, boost scoring based on difficulty
  if (aiTurnsToWin <= 1) {
    switch (difficulty) {
      case 'easy': scoringMultiplier = 1.2; break;
      case 'normal': scoringMultiplier = 1.4; break;
      case 'hard': scoringMultiplier = 1.6; break;
      case 'nightmare': scoringMultiplier = 1.8; break;
    }
    futureCap = 4; // Don't over-plan near victory
  }
  
  return {
    canWinThisTurn,
    opponentCanWinNextTurn,
    aiTurnsToWin,
    oppTurnsToWin,
    futureCap,
    denialMultiplier,
    scoringMultiplier,
    aiCanWinNextTurn,
    denyMultiplierBoost: denialMultiplier,
    bitcoinMultiplierBoost: scoringMultiplier,
  };
}

// Check if an action wins the game
export function isWinningAction(
  action: EvaluatedAction,
  boardState: BoardState,
  aiPlayer: Player
): boolean {
  const deltaBitcoin = (action as any).__deltaBitcoin ?? 0;
  return aiPlayer.score + boardState.myConnectedComputers + deltaBitcoin >= WIN_TARGET;
}

// Find a winning line of actions within available moves
export function findWinningLine(
  boardState: BoardState,
  gameState: GameState,
  aiPlayerIndex: number,
  movesRemaining: number,
  equipmentMovesRemaining: number
): EvaluatedAction[] | null {
  const aiPlayer = gameState.players[aiPlayerIndex];
  const neededBitcoin = WIN_TARGET - aiPlayer.score - boardState.myConnectedComputers;
  
  if (neededBitcoin <= 0) {
    return [];
  }
  
  const totalMoves = movesRemaining + equipmentMovesRemaining;
  if (boardState.myPotentialComputers >= neededBitcoin && totalMoves >= neededBitcoin) {
    return [];
  }
  
  return null;
}

// Apply endgame modifiers to utility
export function applyEndgameModifiers(
  utility: number,
  endgame: EndgameState,
  action: EvaluatedAction
): number {
  let modified = utility;
  
  const deltaBitcoin = (action as any).__deltaBitcoin ?? 0;
  if (deltaBitcoin > 0) {
    modified *= endgame.scoringMultiplier;
  }
  
  if (action.type === 'play_attack' || action.type === 'start_audit') {
    modified *= endgame.denialMultiplier;
  }
  
  return modified;
}
