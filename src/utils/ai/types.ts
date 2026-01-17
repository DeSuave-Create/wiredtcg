import { Card, PlayerNetwork, Player, GameState, PlacedCard } from '@/types/game';

// AI Difficulty levels
export type AIDifficulty = 'easy' | 'normal' | 'hard';

// Action types the AI can take
export type AIActionType = 
  | 'play_switch'
  | 'play_cable'
  | 'play_computer'
  | 'play_classification'
  | 'play_attack'
  | 'play_resolution'
  | 'connect_cable_to_switch'
  | 'connect_computer_to_cable'
  | 'reroute_cable'
  | 'steal_classification'
  | 'start_audit'
  | 'discard'
  | 'pass';

// Evaluated action with utility score
export interface EvaluatedAction {
  type: AIActionType;
  card?: Card;
  targetId?: string;
  targetPlayerIndex?: number;
  utility: number;
  reasoning: string;
  risk: number; // 0-1 risk factor
}

// Network analysis results
export interface NetworkAnalysis {
  connectedComputers: number;
  totalComputers: number;
  enabledSwitches: number;
  disabledSwitches: number;
  totalSwitches: number;
  enabledCables: number;
  disabledCables: number;
  floatingCables: number;
  floatingComputers: number;
  redundancyScore: number; // 0-1, higher = more resilient
  vulnerabilityScore: number; // 0-1, higher = more vulnerable
  projectedScoring: number;
  singlePointFailures: number; // Number of switches that if disabled would lose all scoring
  availableCableSlots: number; // Space for more computers
}

// Hand analysis results
export interface HandAnalysis {
  switches: Card[];
  cables: Card[];
  computers: Card[];
  attacks: Card[];
  resolutions: Card[];
  classifications: Card[];
  stealCards: Card[];
  auditCards: Card[];
  deadCards: Card[]; // Cards that can't be used effectively
  potentialMoves: number;
}

// Opponent analysis for tracking behavior
export interface OpponentAnalysis {
  likelyCounters: number; // Estimated Secured cards
  likelyAttacks: number; // Estimated attack cards
  threateningClassifications: string[];
  stealProtected: boolean;
  projectedScoring: number;
  behaviorPattern: 'aggressive' | 'defensive' | 'building' | 'unknown';
}

// State memory for tracking game history
export interface AIStateMemory {
  observedCards: Card[]; // Cards seen played by opponent
  attacksUsed: Record<string, number>; // Count of each attack type used
  resolutionsRemaining: Record<string, number>; // Estimated remaining in deck
  opponentBehavior: OpponentAnalysis;
  lastDisruption: string | null; // What was last attack on AI
  vulnerableStructures: string[]; // IDs of equipment that were previously attacked
}

// Configuration for different difficulty levels
export interface AIConfig {
  difficulty: AIDifficulty;
  lookaheadDepth: number; // 1-5 turns ahead
  randomnessFactor: number; // 0-1, higher = more random
  holdProbability: number; // Chance to hold cards instead of playing immediately
  bluffProbability: number; // Chance to bluff (discard good cards, hold bad)
  riskTolerance: number; // 0-1, higher = more willing to take risks
  counterEstimationAccuracy: number; // 0-1, how well it estimates opponent cards
}

// Utility weights for scoring actions
export interface UtilityWeights {
  bitcoinGain: number;
  bitcoinDenial: number;
  boardStability: number;
  futureAdvantage: number;
  riskPenalty: number;
  redundancyBonus: number;
  classificationValue: number;
}

// Reroute opportunity
export interface RerouteOpportunity {
  sourceSwitchId: string;
  targetSwitchId: string;
  cableId: string;
  computersAffected: number;
  bitcoinRecovery: number;
}

// Complete AI decision context
export interface AIDecisionContext {
  gameState: GameState;
  aiPlayerIndex: number;
  humanPlayerIndex: number;
  aiPlayer: Player;
  humanPlayer: Player;
  aiNetwork: NetworkAnalysis;
  humanNetwork: NetworkAnalysis;
  aiHand: HandAnalysis;
  memory: AIStateMemory;
  config: AIConfig;
  weights: UtilityWeights;
  movesRemaining: number;
  scoreDifference: number; // AI score - Human score
  turnsToWin: number; // Estimated turns for AI to win
  humanTurnsToWin: number; // Estimated turns for human to win
}
