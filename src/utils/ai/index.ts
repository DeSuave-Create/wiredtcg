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
  executeAITurnDecisions,
  decideAuditResponse,
  selectAuditTargets,
  resetAIMemory,
  getAIMemory,
  getAIDecisionDebug,
} from './decisionEngine';

export { getAIConfig, getUtilityWeights } from './config';

export { 
  analyzeNetwork, 
  analyzeHand, 
  analyzeOpponent,
  estimateTurnsToWin,
} from './analysis';
