// =============================================================================
// AI MATCH STATE - Persists for entire game, selected at start
// =============================================================================

import { AIDifficulty, DifficultyConfig, getDifficultyConfig } from './difficulty';
import { AIAggression, AggressionConfig, getAggressionConfig, selectRandomAggression, getAggressionDescription } from './profiles';

// AI Profile - combines difficulty and aggression
export interface AIProfile {
  difficulty: AIDifficulty;
  aggression: AIAggression;
  diffCfg: DifficultyConfig;
  aggCfg: AggressionConfig;
}

// Match state - initialized once per game, persists across turns
export interface AIMatchState {
  profile: AIProfile;
  matchSeed: number;
  turnsPlayed: number;
  
  // Memory tracking
  observedOpponentCards: string[]; // Card subtypes seen
  attacksUsedByAI: Record<string, number>;
  attacksUsedByOpponent: Record<string, number>;
  
  // Behavioral tracking
  lastActionCategories: string[]; // Last 5 action categories for pattern detection
}

// Global match state (reset per game)
let currentMatchState: AIMatchState | null = null;

// Create AI profile for a game
export function createAIProfile(difficulty: AIDifficulty, seed?: number): AIProfile {
  const matchSeed = seed ?? Date.now();
  const aggression = selectRandomAggression(matchSeed);
  
  return {
    difficulty,
    aggression,
    diffCfg: getDifficultyConfig(difficulty),
    aggCfg: getAggressionConfig(aggression),
  };
}

// Initialize match state at game start
export function initializeMatchState(difficulty: AIDifficulty, seed?: number): AIMatchState {
  const matchSeed = seed ?? Date.now();
  const profile = createAIProfile(difficulty, matchSeed);
  
  currentMatchState = {
    profile,
    matchSeed,
    turnsPlayed: 0,
    observedOpponentCards: [],
    attacksUsedByAI: {},
    attacksUsedByOpponent: {},
    lastActionCategories: [],
  };
  
  // Debug log (only in dev)
  if (typeof window !== 'undefined' && (window as any).__AI_DEBUG__) {
    console.log(`[AI] Match initialized - Aggression: ${profile.aggression} (${getAggressionDescription(profile.aggression)}), Difficulty: ${profile.difficulty}`);
  }
  
  return currentMatchState;
}

// Get current match state (creates default if none exists)
export function getMatchState(difficulty: AIDifficulty = 'normal'): AIMatchState {
  if (!currentMatchState) {
    return initializeMatchState(difficulty);
  }
  return currentMatchState;
}

// Get profile from match state
export function getProfile(): AIProfile | null {
  return currentMatchState?.profile ?? null;
}

// Update match state after AI turn
export function recordAITurn(category: string, cardSubtype?: string): void {
  if (!currentMatchState) return;
  
  currentMatchState.turnsPlayed++;
  
  // Track action category
  currentMatchState.lastActionCategories.push(category);
  if (currentMatchState.lastActionCategories.length > 5) {
    currentMatchState.lastActionCategories.shift();
  }
  
  // Track card usage
  if (cardSubtype) {
    currentMatchState.attacksUsedByAI[cardSubtype] = 
      (currentMatchState.attacksUsedByAI[cardSubtype] || 0) + 1;
  }
}

// Record opponent card observation
export function recordOpponentCard(cardSubtype: string): void {
  if (!currentMatchState) return;
  
  if (!currentMatchState.observedOpponentCards.includes(cardSubtype)) {
    currentMatchState.observedOpponentCards.push(cardSubtype);
  }
  
  currentMatchState.attacksUsedByOpponent[cardSubtype] = 
    (currentMatchState.attacksUsedByOpponent[cardSubtype] || 0) + 1;
}

// Reset match state (call when starting new game)
export function resetMatchState(): void {
  currentMatchState = null;
}

// Check if match state exists
export function hasMatchState(): boolean {
  return currentMatchState !== null;
}

// Get match state for debugging
export function getMatchStateDebug(): { aggression: string; difficulty: string; turns: number } | null {
  if (!currentMatchState) return null;
  
  return {
    aggression: currentMatchState.profile.aggression,
    difficulty: currentMatchState.profile.difficulty,
    turns: currentMatchState.turnsPlayed,
  };
}
