// AI Decision Engine exports

// Types
export type { AIDifficulty } from './difficulty';
export type { AIAggression, AggressionConfig } from './profiles';
export type { 
  EvaluatedAction, 
  AIStateMemory,
  AIDecisionContext,
  NetworkAnalysis,
  HandAnalysis,
} from './types';

// Difficulty and Profile configs
export { getDifficultyConfig, type DifficultyConfig } from './difficulty';
export { getAggressionConfig, getAggressionDescription } from './profiles';

// Match state management
export { 
  initializeMatchState,
  getMatchState,
  resetMatchState,
  hasMatchState,
  getMatchStateDebug,
  recordAITurn,
  type AIMatchState,
  type AIProfile,
} from './matchState';

// Decision engine
export { 
  makeAIDecision, 
  decideAuditResponse,
  selectAuditTargets,
  resetAIMemory,
  getAIMemory,
  getAIDecisionDebug,
  initializeAIForGame,
} from './decisionEngine';

// Legacy config export (for backwards compatibility)
export { getAIConfig, getUtilityWeights } from './config';

// Analysis utilities
export { 
  analyzeNetwork, 
  analyzeHand, 
  analyzeOpponent,
  estimateTurnsToWin,
} from './analysis';

// Board state
export { computeBoardState, type BoardState } from './boardState';

// Action generation
export { existsLegalEquipmentPlay } from './actionGenerator';

// Auto-connect engine
export { hasAcceptableAutoConnect, findAutoConnectActions } from './autoConnect';
