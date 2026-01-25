// =============================================================================
// DIFFICULTY PARAMETERS - User-selectable Easy/Normal/Hard
// =============================================================================

import { AIDifficulty } from './types';

export interface DifficultyParams {
  // Lookahead for combo/endgame calculations
  lookaheadDepth: number;
  
  // Randomness applied after utility calculation (lower = more optimal)
  randomnessFactor: number;
  
  // Chance to skip optimal action and pick from top K instead
  skipOptimalChanceMin: number;
  skipOptimalChanceMax: number;
  skipOptimalK: { min: number; max: number }; // Range of top K to choose from
  
  // Utility noise added to final utility before ranking
  utilityNoiseRange: number;
  
  // Risk tolerance (affects RiskPenalty scaling - higher = more risky plays)
  riskTolerance: number;
  
  // Category threshold modifier
  thresholdMod: number;
  
  // Bluff settings
  bluffEnabled: boolean;
  bluffChanceMin: number;
  bluffChanceMax: number;
  bluffDeltaMax: number; // Max utility loss vs best for bluff to be considered
  
  // Opponent misplay estimation (for trap value calculation)
  opponentMisplayChance: number;
}

// Get complete difficulty parameters
export function getDifficultyParams(difficulty: AIDifficulty): DifficultyParams {
  switch (difficulty) {
    case 'easy':
      return {
        lookaheadDepth: 1,
        randomnessFactor: 0.40,
        skipOptimalChanceMin: 0.25,
        skipOptimalChanceMax: 0.40,
        skipOptimalK: { min: 3, max: 6 },
        utilityNoiseRange: 30,
        riskTolerance: 0.70,
        thresholdMod: 3, // Easier AI has higher thresholds (pickier)
        bluffEnabled: false,
        bluffChanceMin: 0,
        bluffChanceMax: 0,
        bluffDeltaMax: 0,
        opponentMisplayChance: 0.35,
      };
    
    case 'normal':
      return {
        lookaheadDepth: 2,
        randomnessFactor: 0.20,
        skipOptimalChanceMin: 0.10,
        skipOptimalChanceMax: 0.20,
        skipOptimalK: { min: 2, max: 4 },
        utilityNoiseRange: 15,
        riskTolerance: 0.50,
        thresholdMod: 0,
        bluffEnabled: true,
        bluffChanceMin: 0.08,
        bluffChanceMax: 0.15,
        bluffDeltaMax: 12,
        opponentMisplayChance: 0.25,
      };
    
    case 'hard':
      return {
        lookaheadDepth: 4,
        randomnessFactor: 0.05,
        skipOptimalChanceMin: 0,
        skipOptimalChanceMax: 0,
        skipOptimalK: { min: 1, max: 1 },
        utilityNoiseRange: 5,
        riskTolerance: 0.30,
        thresholdMod: -2, // Harder AI has lower thresholds (takes more marginal plays)
        bluffEnabled: true,
        bluffChanceMin: 0.04,
        bluffChanceMax: 0.08,
        bluffDeltaMax: 6,
        opponentMisplayChance: 0.15,
      };
  }
}

// Category base thresholds
export const CATEGORY_THRESHOLDS: Record<string, number> = {
  build: 10,
  reroute: 10,
  repair: 8,
  disrupt: 8,
  setup: 6,
  cycle: 0, // Always allowed
};

// Get final threshold for a category based on difficulty
export function getCategoryThreshold(category: string, difficulty: AIDifficulty): number {
  const base = CATEGORY_THRESHOLDS[category] ?? 5;
  const params = getDifficultyParams(difficulty);
  return base + params.thresholdMod;
}

// Random value within range for skip optimal chance
export function rollSkipOptimalChance(params: DifficultyParams): number {
  return params.skipOptimalChanceMin + 
    Math.random() * (params.skipOptimalChanceMax - params.skipOptimalChanceMin);
}

// Random K value for picking from top K actions
export function rollSkipOptimalK(params: DifficultyParams): number {
  const { min, max } = params.skipOptimalK;
  return Math.floor(min + Math.random() * (max - min + 1));
}

// Random bluff chance
export function rollBluffChance(params: DifficultyParams): number {
  return params.bluffChanceMin + 
    Math.random() * (params.bluffChanceMax - params.bluffChanceMin);
}

// Apply utility noise
export function applyUtilityNoise(utility: number, params: DifficultyParams): number {
  const noise = (Math.random() - 0.5) * 2 * params.utilityNoiseRange;
  return utility + noise;
}
