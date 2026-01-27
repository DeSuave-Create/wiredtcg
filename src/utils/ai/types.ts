import { Card, PlayerNetwork, Player, GameState, PlacedCard } from '@/types/game';

// Re-export difficulty type
export type { AIDifficulty } from './difficulty';

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
  | 'connect_floating_computer'
  | 'reroute_cable'
  | 'move_cable_to_switch'
  | 'move_computer_to_cable'
  | 'steal_classification'
  | 'start_audit'
  | 'discard'
  | 'pass';

// Evaluated action with utility score
export interface EvaluatedAction {
  type: AIActionType;
  card?: Card;
  targetId?: string;
  sourceId?: string;
  targetPlayerIndex?: number;
  utility: number;
  reasoning: string;
  risk: number;
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
  redundancyScore: number;
  vulnerabilityScore: number;
  projectedScoring: number;
  singlePointFailures: number;
  availableCableSlots: number;
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
  deadCards: Card[];
  potentialMoves: number;
}

// Opponent analysis for tracking behavior
export interface OpponentAnalysis {
  likelyCounters: number;
  likelyAttacks: number;
  threateningClassifications: string[];
  stealProtected: boolean;
  projectedScoring: number;
  behaviorPattern: 'aggressive' | 'defensive' | 'building' | 'unknown';
}

// State memory for tracking game history
export interface AIStateMemory {
  observedCards: Card[];
  attacksUsed: Record<string, number>;
  resolutionsRemaining: Record<string, number>;
  opponentBehavior: OpponentAnalysis;
  lastDisruption: string | null;
  vulnerableStructures: string[];
}

// Reroute opportunity
export interface RerouteOpportunity {
  sourceSwitchId: string;
  targetSwitchId: string;
  cableId: string;
  computersAffected: number;
  bitcoinRecovery: number;
}

// Import difficulty type locally for interface use
import { AIDifficulty as DifficultyType } from './difficulty';

// Legacy AIConfig interface for backwards compatibility
export interface AIConfig {
  difficulty: DifficultyType;
  lookaheadDepth: number;
  randomnessFactor: number;
  holdProbability: number;
  bluffProbability: number;
  riskTolerance: number;
  counterEstimationAccuracy: number;
}

// Legacy UtilityWeights for backwards compatibility
export interface UtilityWeights {
  bitcoinGain: number;
  bitcoinDenial: number;
  boardStability: number;
  futureAdvantage: number;
  riskPenalty: number;
  redundancyBonus: number;
  classificationValue: number;
}

// Complete AI decision context (includes legacy fields for backwards compatibility)
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
  scoreDifference: number;
  turnsToWin: number;
  humanTurnsToWin: number;
}
