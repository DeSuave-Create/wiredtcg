// =============================================================================
// AUDIT DECISIONS - AI logic for audit battles
// =============================================================================

import { GameState, Card } from '@/types/game';
import { AIDifficulty, getDifficultyConfig } from './difficulty';

// AI response to audit (decide whether to counter)
export function decideAuditResponse(
  gameState: GameState,
  difficulty: AIDifficulty,
  isTargetTurn: boolean
): { shouldCounter: boolean; cardId: string | null; reasoning: string } {
  const config = getDifficultyConfig(difficulty);
  const aiPlayerIndex = gameState.currentPlayerIndex;
  const aiPlayer = gameState.players[aiPlayerIndex];
  
  if (!gameState.auditBattle) {
    return { shouldCounter: false, cardId: null, reasoning: 'No active audit' };
  }

  const neededType = isTargetTurn ? 'hacked' : 'secured';
  const counterCards = aiPlayer.hand.filter(c => c.subtype === neededType);
  
  if (counterCards.length === 0) {
    return { shouldCounter: false, cardId: null, reasoning: `No ${neededType} cards available` };
  }

  const computersAtRisk = gameState.auditBattle.computersToReturn;
  const chainLength = gameState.auditBattle.chain.length;

  let shouldCounter = false;
  let reasoning = '';

  if (isTargetTurn) {
    // AI is being audited - consider whether to block
    if (computersAtRisk >= 2) {
      shouldCounter = true;
      reasoning = `Protecting ${computersAtRisk} computers`;
    } else if (counterCards.length >= 2 && computersAtRisk >= 1) {
      shouldCounter = true;
      reasoning = 'Have spare counters, protecting computer';
    }
  } else {
    // AI is the auditor - consider whether to counter-counter
    if (computersAtRisk >= 3 && counterCards.length >= 1) {
      shouldCounter = true;
      reasoning = 'High-value audit, pressing advantage';
    } else if (chainLength >= 2 && difficulty === 'hard') {
      shouldCounter = counterCards.length >= 1;
      reasoning = 'Maintaining pressure in counter battle';
    }
  }

  // Risk tolerance adjustment
  if (Math.random() > config.riskTolerance && chainLength >= 2) {
    shouldCounter = false;
    reasoning = 'Backing off - too risky';
  }

  // Easy AI is more predictable
  if (difficulty === 'easy') {
    shouldCounter = counterCards.length >= 2;
    reasoning = counterCards.length >= 2 ? 'Have multiple counters' : 'Saving cards';
  }

  return {
    shouldCounter,
    cardId: shouldCounter ? counterCards[0].id : null,
    reasoning,
  };
}

// AI selection of computers during audit
export function selectAuditTargets(
  gameState: GameState,
  difficulty: AIDifficulty,
  availableComputers: { id: string; card: Card; location: string }[],
  count: number
): string[] {
  const config = getDifficultyConfig(difficulty);
  
  if (difficulty === 'easy') {
    // Random selection
    const shuffled = [...availableComputers].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map(c => c.id);
  }

  // Score each computer for removal priority
  const scored = availableComputers.map(comp => {
    let score = 50;
    
    // Prefer to remove connected computers (they're scoring)
    if (!comp.location.includes('Floating')) {
      score += 30;
    }
    
    // Prefer computers on cables with more computers
    if (comp.location.includes('Cable')) {
      score += 10;
    }
    
    // Add randomness based on difficulty (use utility noise)
    score += (Math.random() - 0.5) * config.utilityNoise * 100;
    
    return { ...comp, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, count).map(c => c.id);
}
