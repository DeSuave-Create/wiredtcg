import { Card, Player, PlayerNetwork, GameState } from '@/types/game';
import { NetworkAnalysis, HandAnalysis, OpponentAnalysis, AIStateMemory } from './types';
import { DECK_COMPOSITION, TOTAL_DECK_SIZE } from './config';

// Analyze a player's network
export function analyzeNetwork(network: PlayerNetwork): NetworkAnalysis {
  let connectedComputers = 0;
  let totalComputers = 0;
  let enabledSwitches = 0;
  let disabledSwitches = 0;
  let enabledCables = 0;
  let disabledCables = 0;
  let availableCableSlots = 0;
  let singlePointFailures = 0;

  // Analyze switches and their equipment
  for (const sw of network.switches) {
    if (sw.isDisabled) {
      disabledSwitches++;
    } else {
      enabledSwitches++;
      
      // Count computers dependent on this switch
      let switchDependentComputers = 0;
      
      for (const cable of sw.cables) {
        if (cable.isDisabled) {
          disabledCables++;
        } else {
          enabledCables++;
          availableCableSlots += cable.maxComputers - cable.computers.length;
          
          for (const comp of cable.computers) {
            totalComputers++;
            if (!comp.isDisabled) {
              connectedComputers++;
              switchDependentComputers++;
            }
          }
        }
      }
      
      // If all scoring depends on one switch, it's a single point of failure
      if (switchDependentComputers > 0 && enabledSwitches === 1) {
        singlePointFailures++;
      }
    }
  }

  // Count floating equipment
  const floatingCables = network.floatingCables.length;
  const floatingComputers = network.floatingComputers.length + 
    network.floatingCables.reduce((sum, c) => sum + c.computers.length, 0);

  // Add floating computers to total
  totalComputers += floatingComputers;

  // Calculate redundancy score (0-1)
  // Higher if multiple switches, lower if single point of failure
  const redundancyScore = enabledSwitches > 1 
    ? Math.min(1, enabledSwitches * 0.4 - singlePointFailures * 0.3)
    : singlePointFailures > 0 ? 0.1 : 0.3;

  // Calculate vulnerability score (0-1)
  // Higher if many disabled or under attack
  const totalEquipment = network.switches.length + 
    network.switches.reduce((sum, sw) => sum + sw.cables.length + 
      sw.cables.reduce((s, c) => s + c.computers.length, 0), 0);
  const disabledEquipment = disabledSwitches + disabledCables + 
    network.switches.reduce((sum, sw) => 
      sw.cables.reduce((s, c) => s + c.computers.filter(comp => comp.isDisabled).length, 0), 0);
  
  const vulnerabilityScore = totalEquipment > 0 
    ? disabledEquipment / totalEquipment 
    : 0;

  return {
    connectedComputers,
    totalComputers,
    enabledSwitches,
    disabledSwitches,
    totalSwitches: network.switches.length,
    enabledCables,
    disabledCables,
    floatingCables,
    floatingComputers,
    redundancyScore,
    vulnerabilityScore,
    projectedScoring: connectedComputers,
    singlePointFailures,
    availableCableSlots,
  };
}

// Analyze a player's hand
export function analyzeHand(hand: Card[], network: PlayerNetwork): HandAnalysis {
  const switches = hand.filter(c => c.subtype === 'switch');
  const cables = hand.filter(c => c.subtype === 'cable-2' || c.subtype === 'cable-3');
  const computers = hand.filter(c => c.subtype === 'computer');
  const attacks = hand.filter(c => c.type === 'attack' && c.subtype !== 'audit');
  const resolutions = hand.filter(c => c.type === 'resolution');
  const classifications = hand.filter(c => c.type === 'classification' && 
    c.subtype !== 'head-hunter' && c.subtype !== 'seal-the-deal');
  const stealCards = hand.filter(c => c.subtype === 'head-hunter' || c.subtype === 'seal-the-deal');
  const auditCards = hand.filter(c => c.subtype === 'audit');

  // Identify dead cards (can't be used effectively right now)
  const deadCards: Card[] = [];
  
  // Resolutions with no matching issues
  for (const res of resolutions) {
    const hasMatchingIssue = findMatchingIssue(network, res.subtype);
    if (!hasMatchingIssue && res.subtype !== 'helpdesk') {
      deadCards.push(res);
    }
  }

  // Calculate potential moves
  const potentialMoves = switches.length + cables.length + computers.length + 
    attacks.length + resolutions.length + classifications.length + stealCards.length;

  return {
    switches,
    cables,
    computers,
    attacks,
    resolutions,
    classifications,
    stealCards,
    auditCards,
    deadCards,
    potentialMoves,
  };
}

// Check if network has an issue matching a resolution type
function findMatchingIssue(network: PlayerNetwork, resolutionSubtype: string): boolean {
  const issueMap: Record<string, string> = {
    'secured': 'hacked',
    'powered': 'power-outage',
    'trained': 'new-hire',
    'helpdesk': 'any',
  };
  
  const targetIssue = issueMap[resolutionSubtype];
  if (!targetIssue) return false;

  // Check switches
  for (const sw of network.switches) {
    if (targetIssue === 'any' && sw.attachedIssues.length > 0) return true;
    if (sw.attachedIssues.some(i => i.subtype === targetIssue)) return true;
    
    // Check cables
    for (const cable of sw.cables) {
      if (targetIssue === 'any' && cable.attachedIssues.length > 0) return true;
      if (cable.attachedIssues.some(i => i.subtype === targetIssue)) return true;
      
      // Check computers
      for (const comp of cable.computers) {
        if (targetIssue === 'any' && comp.attachedIssues.length > 0) return true;
        if (comp.attachedIssues.some(i => i.subtype === targetIssue)) return true;
      }
    }
  }

  // Check floating cables
  for (const cable of network.floatingCables) {
    if (targetIssue === 'any' && cable.attachedIssues.length > 0) return true;
    if (cable.attachedIssues.some(i => i.subtype === targetIssue)) return true;
    
    for (const comp of cable.computers) {
      if (targetIssue === 'any' && comp.attachedIssues.length > 0) return true;
      if (comp.attachedIssues.some(i => i.subtype === targetIssue)) return true;
    }
  }

  // Check floating computers
  for (const comp of network.floatingComputers) {
    if (targetIssue === 'any' && comp.attachedIssues.length > 0) return true;
    if (comp.attachedIssues.some(i => i.subtype === targetIssue)) return true;
  }

  return false;
}

// Analyze opponent based on observed behavior
export function analyzeOpponent(
  humanPlayer: Player,
  memory: AIStateMemory,
  cardsInPlay: number,
  difficulty: string
): OpponentAnalysis {
  // Estimate cards remaining based on what's been played
  const securedPlayed = memory.attacksUsed['secured'] || 0;
  const hackedPlayed = memory.attacksUsed['hacked'] || 0;
  
  // Base estimation on deck composition
  const securedInDeck = DECK_COMPOSITION['secured'];
  const hackedInDeck = DECK_COMPOSITION['hacked'];
  
  // Estimate likelihood opponent has counters
  const cardsRemaining = TOTAL_DECK_SIZE - cardsInPlay;
  const accuracyFactor = difficulty === 'hard' ? 0.85 : difficulty === 'normal' ? 0.6 : 0.3;
  
  const likelySecured = Math.max(0, (securedInDeck - securedPlayed) * (humanPlayer.hand.length / cardsRemaining) * accuracyFactor);
  
  // Identify threatening classifications
  const threateningClassifications = humanPlayer.classificationCards
    .map(c => c.card.subtype)
    .filter(type => ['security-specialist', 'facilities', 'supervisor'].includes(type));

  // Check steal protection
  const classTypes = humanPlayer.classificationCards.map(c => c.card.subtype);
  const stealProtected = classTypes.length === 2 && classTypes[0] === classTypes[1];

  // Determine behavior pattern
  let behaviorPattern: 'aggressive' | 'defensive' | 'building' | 'unknown' = 'unknown';
  const humanNetwork = analyzeNetwork(humanPlayer.network);
  
  if (memory.observedCards.filter(c => c.type === 'attack').length > 3) {
    behaviorPattern = 'aggressive';
  } else if (humanNetwork.connectedComputers > 3 && humanNetwork.enabledSwitches > 1) {
    behaviorPattern = 'building';
  } else if (humanPlayer.classificationCards.length >= 2) {
    behaviorPattern = 'defensive';
  }

  return {
    likelyCounters: Math.round(likelySecured * 10) / 10,
    likelyAttacks: Math.round((hackedInDeck - hackedPlayed) * 0.2 * 10) / 10,
    threateningClassifications,
    stealProtected,
    projectedScoring: humanNetwork.connectedComputers,
    behaviorPattern,
  };
}

// Initialize AI state memory
export function initializeMemory(): AIStateMemory {
  return {
    observedCards: [],
    attacksUsed: {},
    resolutionsRemaining: { ...DECK_COMPOSITION },
    opponentBehavior: {
      likelyCounters: 0,
      likelyAttacks: 0,
      threateningClassifications: [],
      stealProtected: false,
      projectedScoring: 0,
      behaviorPattern: 'unknown',
    },
    lastDisruption: null,
    vulnerableStructures: [],
  };
}

// Update memory when a card is observed
export function updateMemory(memory: AIStateMemory, card: Card, source: 'opponent' | 'deck'): AIStateMemory {
  const newMemory = { ...memory };
  
  if (source === 'opponent') {
    newMemory.observedCards = [...memory.observedCards, card];
  }
  
  // Track card usage
  if (newMemory.attacksUsed[card.subtype]) {
    newMemory.attacksUsed[card.subtype]++;
  } else {
    newMemory.attacksUsed[card.subtype] = 1;
  }
  
  // Update remaining estimates
  if (newMemory.resolutionsRemaining[card.subtype]) {
    newMemory.resolutionsRemaining[card.subtype]--;
  }
  
  return newMemory;
}

// Calculate estimated turns to win
export function estimateTurnsToWin(
  currentScore: number,
  projectedScoring: number,
  targetScore: number = 25
): number {
  if (projectedScoring <= 0) return Infinity;
  const remaining = targetScore - currentScore;
  return Math.ceil(remaining / projectedScoring);
}
