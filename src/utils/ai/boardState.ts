// =============================================================================
// GLOBAL BOARD STATE - Computed before every AI action
// =============================================================================

import { GameState, Player, PlayerNetwork, Card } from '@/types/game';
import { AIDifficulty, NetworkAnalysis } from './types';
import { analyzeNetwork, analyzeHand } from './analysis';

// Complete board state snapshot for AI decision making
export interface BoardState {
  // AI Network metrics
  myConnectedComputers: number;
  myPotentialComputers: number; // Can score this turn if connected/repaired
  myBitcoin: number;
  myTotalComputers: number;
  
  // Opponent Network metrics
  oppConnectedComputers: number;
  oppBitcoin: number;
  oppNearWin: boolean; // oppBitcoin + oppConnectedComputers >= 25
  oppTotalComputers: number;
  
  // AI Network issues
  disabledSwitches: number;
  disabledCables: number;
  disabledComputers: number;
  strandedCables: number; // Active cables not connected to enabled switch
  floatingCables: number;
  floatingComputers: number;
  
  // AI Network capacity
  availableEnabledSwitches: number;
  availableCableSlots: number; // Open computer slots on enabled cables
  switchRedundancyScore: number; // 0-1, higher = more resilient
  
  // Hand breakdown
  equipmentInHand: Card[];
  switchesInHand: Card[];
  cablesInHand: Card[];
  computersInHand: Card[];
  attacksInHand: Card[];
  resolutionsInHand: Card[];
  classificationsInHand: Card[];
  auditCardsInHand: Card[];
  stealCardsInHand: Card[];
  
  // Opponent defense flags
  oppHasSecuritySpecialist: boolean;
  oppHasFacilities: boolean;
  oppHasSupervisor: boolean;
  oppIsStealProtected: boolean;
  
  // AI defense flags
  myHasSecuritySpecialist: boolean;
  myHasFacilities: boolean;
  myHasSupervisor: boolean;
  myHasFieldTech: boolean;
  myFieldTechCount: number; // 0, 1, or 2
  myIsStealProtected: boolean;
  
  // Game state
  turnsToWin: number;
  oppTurnsToWin: number;
  scoreDifference: number; // positive = AI ahead
  movesRemaining: number;
  equipmentMovesRemaining: number; // Bonus moves from Field Tech
  
  // Difficulty-aware calculations
  difficulty: AIDifficulty;
}

// Compute complete board state before every move
export function computeBoardState(
  gameState: GameState,
  aiPlayerIndex: number,
  difficulty: AIDifficulty
): BoardState {
  const aiPlayer = gameState.players[aiPlayerIndex];
  const oppPlayerIndex = aiPlayerIndex === 0 ? 1 : 0;
  const oppPlayer = gameState.players[oppPlayerIndex];
  
  const aiNetwork = analyzeNetwork(aiPlayer.network);
  const oppNetwork = analyzeNetwork(oppPlayer.network);
  const aiHand = analyzeHand(aiPlayer.hand, aiPlayer.network);
  
  // Count disabled equipment and stranded cables
  let disabledCables = 0;
  let disabledComputers = 0;
  let strandedCables = 0;
  
  for (const sw of aiPlayer.network.switches) {
    for (const cable of sw.cables) {
      if (cable.isDisabled) {
        disabledCables++;
      } else if (sw.isDisabled) {
        // Active cable but switch is disabled - stranded
        strandedCables++;
      }
      
      for (const comp of cable.computers) {
        if (comp.isDisabled || cable.isDisabled || sw.isDisabled) {
          disabledComputers++;
        }
      }
    }
  }
  
  // Calculate potential computers (can score if connected/repaired this turn)
  const potentialComputers = calculatePotentialComputers(aiPlayer, aiHand);
  
  // Opponent classifications
  const oppClassifications = oppPlayer.classificationCards.map(c => c.card.subtype);
  const oppClassTypes = oppPlayer.classificationCards.map(c => c.card.subtype);
  const oppIsStealProtected = oppClassTypes.length === 2 && oppClassTypes[0] === oppClassTypes[1];
  
  // AI classifications
  const myClassifications = aiPlayer.classificationCards.map(c => c.card.subtype);
  const myClassTypes = aiPlayer.classificationCards.map(c => c.card.subtype);
  const myIsStealProtected = myClassTypes.length === 2 && myClassTypes[0] === myClassTypes[1];
  const myFieldTechCount = myClassifications.filter(c => c === 'field-tech').length;
  
  // Turns to win calculation
  const turnsToWin = aiNetwork.connectedComputers > 0 
    ? Math.ceil((25 - aiPlayer.score) / aiNetwork.connectedComputers)
    : Infinity;
  const oppTurnsToWin = oppNetwork.connectedComputers > 0
    ? Math.ceil((25 - oppPlayer.score) / oppNetwork.connectedComputers)
    : Infinity;
  
  return {
    // AI Network
    myConnectedComputers: aiNetwork.connectedComputers,
    myPotentialComputers: potentialComputers,
    myBitcoin: aiPlayer.score,
    myTotalComputers: aiNetwork.totalComputers,
    
    // Opponent Network
    oppConnectedComputers: oppNetwork.connectedComputers,
    oppBitcoin: oppPlayer.score,
    oppNearWin: oppPlayer.score + oppNetwork.connectedComputers >= 25,
    oppTotalComputers: oppNetwork.totalComputers,
    
    // AI Network issues
    disabledSwitches: aiNetwork.disabledSwitches,
    disabledCables,
    disabledComputers,
    strandedCables,
    floatingCables: aiNetwork.floatingCables,
    floatingComputers: aiNetwork.floatingComputers,
    
    // AI Network capacity
    availableEnabledSwitches: aiNetwork.enabledSwitches,
    availableCableSlots: aiNetwork.availableCableSlots,
    switchRedundancyScore: aiNetwork.redundancyScore,
    
    // Hand breakdown
    equipmentInHand: [...aiHand.switches, ...aiHand.cables, ...aiHand.computers],
    switchesInHand: aiHand.switches,
    cablesInHand: aiHand.cables,
    computersInHand: aiHand.computers,
    attacksInHand: aiHand.attacks,
    resolutionsInHand: aiHand.resolutions,
    classificationsInHand: aiHand.classifications,
    auditCardsInHand: aiHand.auditCards,
    stealCardsInHand: aiHand.stealCards,
    
    // Opponent defense
    oppHasSecuritySpecialist: oppClassifications.includes('security-specialist'),
    oppHasFacilities: oppClassifications.includes('facilities'),
    oppHasSupervisor: oppClassifications.includes('supervisor'),
    oppIsStealProtected,
    
    // AI defense
    myHasSecuritySpecialist: myClassifications.includes('security-specialist'),
    myHasFacilities: myClassifications.includes('facilities'),
    myHasSupervisor: myClassifications.includes('supervisor'),
    myHasFieldTech: myClassifications.includes('field-tech'),
    myFieldTechCount,
    myIsStealProtected,
    
    // Game state
    turnsToWin,
    oppTurnsToWin,
    scoreDifference: aiPlayer.score - oppPlayer.score,
    movesRemaining: gameState.movesRemaining,
    equipmentMovesRemaining: gameState.equipmentMovesRemaining,
    
    difficulty,
  };
}

// Calculate computers that could score this turn if connected/repaired
function calculatePotentialComputers(player: Player, aiHand: ReturnType<typeof analyzeHand>): number {
  let potential = 0;
  const network = player.network;
  
  // Floating computers that could be connected
  potential += network.floatingComputers.length;
  
  // Computers on floating cables that could be connected
  for (const cable of network.floatingCables) {
    potential += cable.computers.length;
  }
  
  // Disabled computers that could be repaired (if we have matching resolutions)
  for (const sw of network.switches) {
    if (sw.isDisabled) continue;
    
    for (const cable of sw.cables) {
      if (cable.isDisabled) continue;
      
      for (const comp of cable.computers) {
        if (comp.isDisabled && comp.attachedIssues.length > 0) {
          // Check if we have a resolution for this issue
          const issueType = comp.attachedIssues[0].subtype;
          const hasResolution = aiHand.resolutions.some(r => {
            if (r.subtype === 'helpdesk') return true;
            if (r.subtype === 'secured' && issueType === 'hacked') return true;
            if (r.subtype === 'powered' && issueType === 'power-outage') return true;
            if (r.subtype === 'trained' && issueType === 'new-hire') return true;
            return false;
          });
          
          if (hasResolution) potential++;
        }
      }
    }
  }
  
  // Computers in hand that could be played
  potential += Math.min(aiHand.computers.length, 
    network.switches.reduce((slots, sw) => {
      if (sw.isDisabled) return slots;
      return slots + sw.cables.reduce((s, c) => {
        if (c.isDisabled) return s;
        return s + (c.maxComputers - c.computers.length);
      }, 0);
    }, 0)
  );
  
  return potential;
}

// Check if any high-priority action exists in a category
export function hasCriticalAction(boardState: BoardState, category: string): boolean {
  switch (category) {
    case 'build':
      // Can score immediately if we place equipment
      return boardState.availableCableSlots > 0 && boardState.computersInHand.length > 0;
    
    case 'reroute':
      // Have stranded cables or floating equipment that can be connected
      return boardState.strandedCables > 0 || 
        (boardState.floatingCables > 0 && boardState.availableEnabledSwitches > 0) ||
        (boardState.floatingComputers > 0 && boardState.availableCableSlots > 0);
    
    case 'repair':
      // Have disabled equipment and resolutions
      return (boardState.disabledSwitches > 0 || 
              boardState.disabledCables > 0 || 
              boardState.disabledComputers > 0) && 
             boardState.resolutionsInHand.length > 0;
    
    case 'disrupt':
      // Opponent has computers and we have attacks
      return boardState.oppConnectedComputers > 0 && 
             (boardState.attacksInHand.length > 0 || boardState.auditCardsInHand.length > 0);
    
    case 'setup':
      // Have classifications to play
      return boardState.classificationsInHand.length > 0;
    
    case 'cycle':
      // Always can discard
      return true;
    
    default:
      return false;
  }
}
