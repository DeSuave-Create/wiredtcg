import { AIDifficulty, AIConfig, UtilityWeights } from './types';

// Get AI configuration based on difficulty
export function getAIConfig(difficulty: AIDifficulty): AIConfig {
  switch (difficulty) {
    case 'easy':
      return {
        difficulty: 'easy',
        lookaheadDepth: 1,
        randomnessFactor: 0.4,
        holdProbability: 0.1,
        bluffProbability: 0.05,
        riskTolerance: 0.7,
        counterEstimationAccuracy: 0.3,
      };
    case 'normal':
      return {
        difficulty: 'normal',
        lookaheadDepth: 2,
        randomnessFactor: 0.2,
        holdProbability: 0.3,
        bluffProbability: 0.15,
        riskTolerance: 0.5,
        counterEstimationAccuracy: 0.6,
      };
    case 'hard':
      return {
        difficulty: 'hard',
        lookaheadDepth: 4,
        randomnessFactor: 0.05,
        holdProbability: 0.5,
        bluffProbability: 0.25,
        riskTolerance: 0.3,
        counterEstimationAccuracy: 0.85,
      };
  }
}

// Get utility weights based on game state and difficulty
export function getUtilityWeights(
  difficulty: AIDifficulty, 
  scoreDifference: number, 
  turnsToWin: number
): UtilityWeights {
  const baseWeights: UtilityWeights = {
    bitcoinGain: 10,
    bitcoinDenial: 8,
    boardStability: 5,
    futureAdvantage: 4,
    riskPenalty: 3,
    redundancyBonus: 3,
    classificationValue: 6,
  };

  // Adjust weights based on game state
  if (scoreDifference < -5) {
    // AI is behind - prioritize aggression
    baseWeights.bitcoinDenial *= 1.5;
    baseWeights.boardStability *= 0.7;
    baseWeights.riskPenalty *= 0.5;
  } else if (scoreDifference > 5) {
    // AI is ahead - prioritize defense
    baseWeights.boardStability *= 1.5;
    baseWeights.redundancyBonus *= 1.5;
    baseWeights.riskPenalty *= 1.3;
  }

  if (turnsToWin <= 2) {
    // Close to winning - maximize scoring
    baseWeights.bitcoinGain *= 2;
    baseWeights.futureAdvantage *= 0.3;
  }

  // Difficulty adjustments
  if (difficulty === 'easy') {
    baseWeights.futureAdvantage *= 0.5;
    baseWeights.redundancyBonus *= 0.5;
  } else if (difficulty === 'hard') {
    baseWeights.futureAdvantage *= 1.5;
    baseWeights.redundancyBonus *= 1.5;
    baseWeights.riskPenalty *= 1.5;
  }

  return baseWeights;
}

// Deck composition for probability calculations
export const DECK_COMPOSITION: Record<string, number> = {
  computer: 32,
  'cable-2': 16,
  'cable-3': 9,
  switch: 18,
  audit: 4,
  hacked: 9,
  'new-hire': 7,
  'power-outage': 7,
  helpdesk: 4,
  trained: 7,
  powered: 7,
  secured: 9,
  facilities: 2,
  'field-tech': 2,
  supervisor: 2,
  'security-specialist': 2,
  'head-hunter': 6,
  'seal-the-deal': 1,
};

export const TOTAL_DECK_SIZE = 144;
