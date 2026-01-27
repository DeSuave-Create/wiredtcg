// =============================================================================
// AI AGGRESSION PROFILES - PASSIVE, BALANCED, AGGRESSIVE
// =============================================================================

export type AIAggression = 'passive' | 'balanced' | 'aggressive';

// Aggression config - biases for action categories
export interface AggressionConfig {
  buildBias: number;      // Preference for building network
  disruptBias: number;    // Preference for attacking
  repairBias: number;     // Preference for repairs
  setupBias: number;      // Preference for classifications/setup
  cycleBias: number;      // Preference for cycling cards
  finishBias: number;     // Preference for win-line plays
}

// Get aggression configuration
export function getAggressionConfig(aggression: AIAggression): AggressionConfig {
  switch (aggression) {
    case 'passive':
      return {
        buildBias: 1.15,
        disruptBias: 0.75,
        repairBias: 1.20,
        setupBias: 1.10,
        cycleBias: 0.95,
        finishBias: 0.85,
      };
    
    case 'balanced':
      return {
        buildBias: 1.00,
        disruptBias: 1.00,
        repairBias: 1.00,
        setupBias: 1.00,
        cycleBias: 1.00,
        finishBias: 1.00,
      };
    
    case 'aggressive':
      return {
        buildBias: 0.95,
        disruptBias: 1.25,
        repairBias: 0.85,
        setupBias: 1.05,
        cycleBias: 1.05,
        finishBias: 1.20,
      };
  }
}

// Randomly select an aggression profile at game start
export function selectRandomAggression(seed?: number): AIAggression {
  const profiles: AIAggression[] = ['passive', 'balanced', 'aggressive'];
  
  // Use seed if provided for reproducibility
  const random = seed !== undefined 
    ? seededRandom(seed)
    : Math.random();
  
  const index = Math.floor(random * profiles.length);
  return profiles[index];
}

// Simple seeded random for reproducible selection
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Profile descriptions for debugging
export function getAggressionDescription(aggression: AIAggression): string {
  switch (aggression) {
    case 'passive':
      return 'Defensive focus, prioritizes building and repairs over disruption';
    case 'balanced':
      return 'Even approach, adapts to game state';
    case 'aggressive':
      return 'Offensive focus, prioritizes attacks and finishing moves';
  }
}

// Get category bias from aggression config
export function getCategoryBias(category: string, config: AggressionConfig): number {
  switch (category) {
    case 'build': return config.buildBias;
    case 'reroute': return 1.00; // No bias for reroute
    case 'repair': return config.repairBias;
    case 'disrupt': return config.disruptBias;
    case 'setup': return config.setupBias;
    case 'cycle': return config.cycleBias;
    default: return 1.00;
  }
}
