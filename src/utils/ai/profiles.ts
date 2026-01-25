// =============================================================================
// AI AGGRESSION PROFILES - Selected randomly at game start, persists for match
// =============================================================================

export type AIProfile = 'RUSH' | 'CONTROL' | 'DENIAL';

// Profile multipliers (base values)
export interface ProfileMultipliers {
  bitcoinGainMult: number;
  denyOpponentMult: number;
  stabilityMult: number;
  futureMult: number;
  riskPenaltyMult: number;
}

// Base profile configurations
const BASE_PROFILES: Record<AIProfile, ProfileMultipliers> = {
  RUSH: {
    bitcoinGainMult: 1.25,
    denyOpponentMult: 0.85,
    stabilityMult: 0.75,
    futureMult: 0.85,
    riskPenaltyMult: 0.80,
  },
  CONTROL: {
    bitcoinGainMult: 0.95,
    denyOpponentMult: 1.00,
    stabilityMult: 1.35,
    futureMult: 1.20,
    riskPenaltyMult: 1.25,
  },
  DENIAL: {
    bitcoinGainMult: 0.90,
    denyOpponentMult: 1.40,
    stabilityMult: 1.00,
    futureMult: 0.95,
    riskPenaltyMult: 1.10,
  },
};

// Profile intensity based on difficulty (scales how committed AI is to profile)
export function getProfileIntensity(difficulty: 'easy' | 'normal' | 'hard'): number {
  switch (difficulty) {
    case 'easy': return 0.70;
    case 'normal': return 1.00;
    case 'hard': return 1.25;
  }
}

// Calculate effective multiplier: lerp from 1.0 toward base based on intensity
function applyIntensity(baseMult: number, intensity: number): number {
  return 1.0 + (baseMult - 1.0) * intensity;
}

// Get scaled profile multipliers based on difficulty
export function getProfileMultipliers(
  profile: AIProfile, 
  difficulty: 'easy' | 'normal' | 'hard'
): ProfileMultipliers {
  const base = BASE_PROFILES[profile];
  const intensity = getProfileIntensity(difficulty);
  
  return {
    bitcoinGainMult: applyIntensity(base.bitcoinGainMult, intensity),
    denyOpponentMult: applyIntensity(base.denyOpponentMult, intensity),
    stabilityMult: applyIntensity(base.stabilityMult, intensity),
    futureMult: applyIntensity(base.futureMult, intensity),
    riskPenaltyMult: applyIntensity(base.riskPenaltyMult, intensity),
  };
}

// Randomly select a profile at game start
export function selectRandomProfile(seed?: number): AIProfile {
  const profiles: AIProfile[] = ['RUSH', 'CONTROL', 'DENIAL'];
  
  // Use seed if provided for reproducibility, otherwise random
  const random = seed !== undefined 
    ? seededRandom(seed)
    : Math.random();
  
  const index = Math.floor(random * profiles.length);
  return profiles[index];
}

// Simple seeded random for reproducible profile selection
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Profile descriptions for debugging
export function getProfileDescription(profile: AIProfile): string {
  switch (profile) {
    case 'RUSH':
      return 'Aggressive scoring focus, less concerned with stability or risk';
    case 'CONTROL':
      return 'Balanced approach, emphasizes stability and future advantage';
    case 'DENIAL':
      return 'Disruptive focus, prioritizes denying opponent bitcoin';
  }
}
