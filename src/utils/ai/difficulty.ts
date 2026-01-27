// =============================================================================
// DIFFICULTY PARAMETERS - Easy/Normal/Hard/Nightmare scaling
// =============================================================================

export type AIDifficulty = 'easy' | 'normal' | 'hard' | 'nightmare';

// Complete difficulty configuration
export interface DifficultyConfig {
  lookaheadDepth: number;           // 1-4
  utilityMultiplier: number;        // Scales base utility
  utilityNoise: number;             // 0..1 - randomness applied to scores
  riskTolerance: number;            // 0..1 - higher = more risky plays
  discardStrictness: number;        // 0..1 - higher = less discarding
  comboAwareness: number;           // 0..1 - setup recognition
  threatSensitivity: number;        // 0..1 - reacts to opponent threats
  denyRecoveryPriority: number;     // 0..1 - targets opponent repairs/setup
  mistakeRate: number;              // 0..1 - random "human" errors
  tieBreakerRandomness: number;     // 0..1 - randomness in tie-breaking
}

// Get difficulty configuration
export function getDifficultyConfig(difficulty: AIDifficulty): DifficultyConfig {
  switch (difficulty) {
    case 'easy':
      return {
        lookaheadDepth: 1,
        utilityMultiplier: 0.75,
        utilityNoise: 0.35,
        riskTolerance: 0.25,
        discardStrictness: 0.35,
        comboAwareness: 0.10,
        threatSensitivity: 0.35,
        denyRecoveryPriority: 0.15,
        mistakeRate: 0.18,
        tieBreakerRandomness: 0.35,
      };
    
    case 'normal':
      return {
        lookaheadDepth: 2,
        utilityMultiplier: 1.00,
        utilityNoise: 0.18,
        riskTolerance: 0.50,
        discardStrictness: 0.60,
        comboAwareness: 0.45,
        threatSensitivity: 0.55,
        denyRecoveryPriority: 0.35,
        mistakeRate: 0.08,
        tieBreakerRandomness: 0.20,
      };
    
    case 'hard':
      return {
        lookaheadDepth: 3,
        utilityMultiplier: 1.20,
        utilityNoise: 0.08,
        riskTolerance: 0.75,
        discardStrictness: 0.82,
        comboAwareness: 0.75,
        threatSensitivity: 0.80,
        denyRecoveryPriority: 0.60,
        mistakeRate: 0.03,
        tieBreakerRandomness: 0.10,
      };
    
    case 'nightmare':
      return {
        lookaheadDepth: 4,
        utilityMultiplier: 1.35,
        utilityNoise: 0.00,
        riskTolerance: 0.92,
        discardStrictness: 0.93,
        comboAwareness: 0.95,
        threatSensitivity: 0.92,
        denyRecoveryPriority: 0.80,
        mistakeRate: 0.00,
        tieBreakerRandomness: 0.05,
      };
  }
}

// Category order base weights
export const CATEGORY_ORDER_WEIGHTS: Record<string, number> = {
  build: 1.20,
  reroute: 1.12,
  repair: 1.10,
  disrupt: 1.05,
  setup: 1.00,
  cycle: 0.92,
};

// Apply utility noise based on difficulty
export function applyUtilityNoise(utility: number, config: DifficultyConfig): number {
  if (config.utilityNoise === 0) return utility;
  const magnitude = config.utilityNoise * Math.abs(utility);
  const noise = (Math.random() * 2 - 1) * magnitude;
  return utility + noise;
}

// Check if AI makes a "mistake" this decision (reduces search quality)
export function shouldMakeMistake(config: DifficultyConfig): boolean {
  return Math.random() < config.mistakeRate;
}

// Lerp helper
export function lerp(min: number, max: number, t: number): number {
  return min + (max - min) * t;
}
