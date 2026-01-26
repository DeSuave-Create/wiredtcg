// AI Decision Engine exports
export type { 
  AIDifficulty, 
  EvaluatedAction, 
  AIStateMemory,
  AIDecisionContext,
  NetworkAnalysis,
  HandAnalysis,
} from './types';

export { 
  makeAIDecision, 
  decideAuditResponse,
  selectAuditTargets,
  resetAIMemory,
  getAIMemory,
  getAIDecisionDebug,
  initializeAIForGame,
} from './decisionEngine';

export { getAIConfig, getUtilityWeights } from './config';

export { 
  analyzeNetwork, 
  analyzeHand, 
  analyzeOpponent,
  estimateTurnsToWin,
} from './analysis';

export { computeBoardState, type BoardState } from './boardState';
export { getMatchStateDebug, hasMatchState } from './matchState';
export { existsLegalEquipmentPlay } from './actionGenerator';
export type { AIProfile } from './profiles';
export { getProfileDescription } from './profiles';
