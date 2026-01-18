// =============================================================================
// PRIORITY-BASED AI DECISION ENGINE
// Strict order: BUILD → REROUTE → REPAIR → DISRUPT → SETUP → CYCLE
// =============================================================================

import { GameState, Player, Card, PlayerNetwork } from '@/types/game';
import { AIDifficulty, EvaluatedAction, AIActionType } from './types';
import { BoardState, computeBoardState } from './boardState';
import { getAIConfig } from './config';

// Action categories in priority order
type ActionCategory = 'build' | 'reroute' | 'repair' | 'disrupt' | 'setup' | 'cycle';

const PRIORITY_ORDER: ActionCategory[] = ['build', 'reroute', 'repair', 'disrupt', 'setup', 'cycle'];

// Main decision function using strict priority order
export function makePriorityDecision(
  gameState: GameState,
  difficulty: AIDifficulty = 'normal'
): { action: EvaluatedAction | null; category: ActionCategory | null; allActions: EvaluatedAction[] } {
  const aiPlayerIndex = gameState.currentPlayerIndex;
  const aiPlayer = gameState.players[aiPlayerIndex];
  
  // Skip if not AI's turn
  if (aiPlayer.isHuman) {
    return { action: null, category: null, allActions: [] };
  }
  
  // Compute fresh board state
  const boardState = computeBoardState(gameState, aiPlayerIndex, difficulty);
  const config = getAIConfig(difficulty);
  const allActions: EvaluatedAction[] = [];
  
  // Process each category in strict priority order
  for (const category of PRIORITY_ORDER) {
    const categoryActions = evaluateCategory(category, boardState, gameState, aiPlayerIndex);
    allActions.push(...categoryActions);
    
    // Apply difficulty-based randomness to each action
    for (const action of categoryActions) {
      if (config.randomnessFactor > 0) {
        const randomAdjustment = (Math.random() - 0.5) * config.randomnessFactor * getRandomnessScale(difficulty);
        action.utility += randomAdjustment;
      }
    }
    
    // Sort actions within category by utility
    categoryActions.sort((a, b) => b.utility - a.utility);
    
    // Find first valuable action in this category
    const bestInCategory = categoryActions.find(a => a.utility > getUtilityThreshold(difficulty, category));
    
    if (bestInCategory) {
      // Difficulty-specific decision making
      if (difficulty === 'easy') {
        // Easy AI: 25-40% chance to skip good actions (visible mistakes)
        if (Math.random() < 0.3) {
          continue; // Skip this category, try next
        }
      } else if (difficulty === 'normal') {
        // Normal AI: 10-20% chance to miss optimal plays
        if (Math.random() < 0.15 && bestInCategory.utility < 15) {
          continue;
        }
      }
      // Hard AI: Always takes best action (no skip)
      
      return { action: bestInCategory, category, allActions };
    }
  }
  
  // Fallback: Force discard if no other action
  const discardAction = createFallbackDiscard(aiPlayer, difficulty);
  if (discardAction) {
    allActions.push(discardAction);
    return { action: discardAction, category: 'cycle', allActions };
  }
  
  return { action: null, category: null, allActions };
}

// Get randomness scale per difficulty
function getRandomnessScale(difficulty: AIDifficulty): number {
  switch (difficulty) {
    case 'easy': return 30; // High randomness (25-40%)
    case 'normal': return 15; // Medium (10-20%)
    case 'hard': return 5; // Low (2-5%)
  }
}

// Get utility threshold for considering an action
function getUtilityThreshold(difficulty: AIDifficulty, category: ActionCategory): number {
  const baseThresholds: Record<ActionCategory, number> = {
    build: 1,     // Very low - always try to build if possible
    reroute: 3,   // Low - rerouting is high value
    repair: 3,    // Low - repairs are important
    disrupt: 4,
    setup: 2,
    cycle: -20,
  };
  
  // Easy AI has lower thresholds (takes suboptimal actions more readily)
  if (difficulty === 'easy') return baseThresholds[category] - 2;
  // Hard AI has slightly higher thresholds (more selective)
  if (difficulty === 'hard') return baseThresholds[category] + 1;
  return baseThresholds[category];
}

// Evaluate actions for a specific category
function evaluateCategory(
  category: ActionCategory,
  boardState: BoardState,
  gameState: GameState,
  aiPlayerIndex: number
): EvaluatedAction[] {
  const aiPlayer = gameState.players[aiPlayerIndex];
  const oppPlayerIndex = aiPlayerIndex === 0 ? 1 : 0;
  const oppPlayer = gameState.players[oppPlayerIndex];
  
  switch (category) {
    case 'build':
      return evaluateBuildActions(boardState, aiPlayer, gameState.players[oppPlayerIndex]);
    case 'reroute':
      return evaluateRerouteActions(boardState, aiPlayer);
    case 'repair':
      return evaluateRepairActions(boardState, aiPlayer);
    case 'disrupt':
      return evaluateDisruptActions(boardState, aiPlayer, oppPlayer, oppPlayerIndex);
    case 'setup':
      return evaluateSetupActions(boardState, aiPlayer, oppPlayer);
    case 'cycle':
      return evaluateCycleActions(boardState, aiPlayer, oppPlayer);
    default:
      return [];
  }
}

// =============================================================================
// BUILD PHASE - Expand Scoring
// =============================================================================
function evaluateBuildActions(boardState: BoardState, aiPlayer: Player, oppPlayer: Player): EvaluatedAction[] {
  const actions: EvaluatedAction[] = [];
  const { difficulty } = boardState;
  
  // Strategy: Build in order - Switch first, then Cable, then Computer
  // If no switch: must play switch first
  // If switch but no cables with slots: must play cable
  // If cables with slots: play computers
  
  const hasEnabledSwitch = boardState.availableEnabledSwitches > 0;
  const hasCableSlots = boardState.availableCableSlots > 0;
  
  // Play Switch - CRITICAL if no enabled switch exists
  for (const switchCard of boardState.switchesInHand) {
    let utility = 8; // Base utility
    
    if (!hasEnabledSwitch) {
      utility = 50; // CRITICAL - need switch to start scoring
    } else if (boardState.switchRedundancyScore < 0.5 && difficulty !== 'easy') {
      utility = 20; // Build redundancy
    } else if (boardState.availableEnabledSwitches >= 2) {
      utility = 4; // Already have enough switches
    }
    
    // Racing to win - less redundancy focus
    if (boardState.turnsToWin <= 3 && difficulty === 'hard') {
      utility *= 0.8;
    }
    
    actions.push({
      type: 'play_switch',
      card: switchCard,
      utility,
      reasoning: !hasEnabledSwitch 
        ? 'CRITICAL: Must build switch to start scoring'
        : 'Expanding network capacity',
      risk: 0.2,
    });
  }
  
  // Play Cable - HIGH PRIORITY if we have switch but no cable slots for computers
  for (const cableCard of boardState.cablesInHand) {
    const cableCapacity = cableCard.subtype === 'cable-3' ? 3 : 2;
    let utility = 8; // Base utility
    
    if (!hasEnabledSwitch) {
      // No switch yet - still can play cable (will be floating), lower priority
      utility = 5; // Above threshold but lower than switch
    } else if (!hasCableSlots) {
      // Have switch but need cables to place computers
      utility = 25; // HIGH priority - opens up computer placement
    } else if (boardState.availableCableSlots >= 3) {
      // Have plenty of slots already
      utility = 6;
    } else {
      // Have some slots, cable adds more capacity
      utility = 10;
    }
    
    // Prefer 3-cables over 2-cables
    if (cableCard.subtype === 'cable-3') {
      utility += 3;
    }
    
    // Find best switch to attach to (prefer switches with fewer cables)
    let targetSwitchId: string | undefined;
    let minCables = Infinity;
    for (const sw of aiPlayer.network.switches) {
      if (!sw.isDisabled && sw.cables.length < minCables) {
        minCables = sw.cables.length;
        targetSwitchId = sw.id;
      }
    }
    
    actions.push({
      type: 'play_cable',
      card: cableCard,
      targetId: targetSwitchId,
      utility,
      reasoning: !hasEnabledSwitch 
        ? `Placing floating ${cableCapacity}-Cable (need switch first)`
        : !hasCableSlots
          ? `Adding ${cableCapacity}-Cable to enable computer placement`
          : `Adding ${cableCapacity}-capacity cable`,
      risk: 0.1,
    });
  }
  
  // Play Computer - HIGHEST priority when we can score immediately
  for (const computerCard of boardState.computersInHand) {
    let utility = 10; // Base utility
    
    // Find cable with space on enabled switch
    let targetCableId: string | undefined;
    let bestScore = -1;
    
    for (const sw of aiPlayer.network.switches) {
      if (sw.isDisabled) continue;
      
      for (const cable of sw.cables) {
        if (cable.isDisabled || cable.computers.length >= cable.maxComputers) continue;
        
        // Score based on available space and distribution
        const score = (cable.maxComputers - cable.computers.length) + 
          (1 / (sw.cables.length + 1)) * 2;
        
        if (score > bestScore) {
          bestScore = score;
          targetCableId = cable.id;
        }
      }
    }
    
    // Also check floating cables for computer placement
    if (!targetCableId) {
      for (const floatingCable of aiPlayer.network.floatingCables) {
        if (!floatingCable.isDisabled && floatingCable.computers.length < floatingCable.maxComputers) {
          // Can place on floating cable (won't score until cable is connected)
          utility = 8;
          break;
        }
      }
    }
    
    if (targetCableId) {
      utility = 30; // HIGHEST - Will immediately score bitcoin!
    } else if (!hasEnabledSwitch || !hasCableSlots) {
      // No place to put computer yet - still play it (floating) if nothing else to do
      utility = 4; // Above threshold but low priority
    }
    
    actions.push({
      type: 'play_computer',
      card: computerCard,
      targetId: targetCableId,
      utility,
      reasoning: targetCableId 
        ? 'Computer will score immediately - priority!'
        : 'Placing floating computer (need cable slot)',
      risk: 0.1,
    });
  }
  
  return actions;
}

// =============================================================================
// REROUTE PHASE - Preserve Scoring
// =============================================================================
function evaluateRerouteActions(boardState: BoardState, aiPlayer: Player): EvaluatedAction[] {
  const actions: EvaluatedAction[] = [];
  const network = aiPlayer.network;
  
  // Move cables from disabled switches to enabled switches
  for (const disabledSwitch of network.switches) {
    if (!disabledSwitch.isDisabled) continue;
    
    for (const cable of disabledSwitch.cables) {
      const computersOnCable = cable.computers.length;
      
      for (const targetSwitch of network.switches) {
        if (targetSwitch.isDisabled || targetSwitch.id === disabledSwitch.id) continue;
        
        const scoringComputers = cable.computers.filter(c => c.attachedIssues.length === 0).length;
        const utility = scoringComputers * 15 + 5; // High priority - recover bitcoin
        
        if (scoringComputers > 0) {
          actions.push({
            type: 'move_cable_to_switch',
            targetId: targetSwitch.id,
            sourceId: cable.id,
            utility,
            reasoning: `Move cable (${computersOnCable} computers) from disabled switch - recover ${scoringComputers} bitcoin`,
            risk: 0,
          });
        }
      }
    }
  }
  
  // Connect floating cables to enabled switches (HIGH PRIORITY when computers attached)
  for (const floatingCable of network.floatingCables) {
    for (const sw of network.switches) {
      if (sw.isDisabled) continue;
      
      const computersOnCable = floatingCable.computers.length;
      const utility = computersOnCable > 0 
        ? computersOnCable * 20 + 10 // High priority: immediate bitcoin
        : 5; // Lower priority if empty
      
      actions.push({
        type: 'connect_cable_to_switch',
        targetId: sw.id,
        sourceId: floatingCable.id,
        utility,
        reasoning: computersOnCable > 0
          ? `PRIORITY: Connect floating cable with ${computersOnCable} computers - immediate ${computersOnCable} bitcoin`
          : 'Connect empty floating cable for expansion',
        risk: 0,
      });
    }
  }
  
  // Connect floating computers to working cables
  for (const floatingComp of network.floatingComputers) {
    for (const sw of network.switches) {
      if (sw.isDisabled) continue;
      
      for (const cable of sw.cables) {
        if (cable.isDisabled || cable.computers.length >= cable.maxComputers) continue;
        
        const utility = 18; // High priority - immediate bitcoin
        
        actions.push({
          type: 'connect_floating_computer',
          targetId: cable.id,
          sourceId: floatingComp.id,
          utility,
          reasoning: 'Connect floating computer to working cable - gain 1 bitcoin',
          risk: 0,
        });
      }
    }
  }
  
  // Move computers from disabled cables to working cables
  for (const sw of network.switches) {
    for (const cable of sw.cables) {
      if (!cable.isDisabled && !sw.isDisabled) continue;
      
      for (const comp of cable.computers) {
        if (comp.attachedIssues.length > 0) continue; // Skip computers with direct attacks
        
        // Find working cable with space
        for (const targetSw of network.switches) {
          if (targetSw.isDisabled) continue;
          
          for (const targetCable of targetSw.cables) {
            if (targetCable.isDisabled || targetCable.id === cable.id) continue;
            if (targetCable.computers.length >= targetCable.maxComputers) continue;
            
            actions.push({
              type: 'move_computer_to_cable',
              targetId: targetCable.id,
              sourceId: comp.id,
              utility: 16,
              reasoning: 'Move computer from disabled path to working cable - recover 1 bitcoin',
              risk: 0,
            });
          }
        }
      }
    }
  }
  
  return actions;
}

// =============================================================================
// REPAIR PHASE - Fix Critical Failures
// =============================================================================
function evaluateRepairActions(boardState: BoardState, aiPlayer: Player): EvaluatedAction[] {
  const actions: EvaluatedAction[] = [];
  const network = aiPlayer.network;
  
  const issueMap: Record<string, string> = {
    'secured': 'hacked',
    'powered': 'power-outage',
    'trained': 'new-hire',
  };
  
  for (const resCard of boardState.resolutionsInHand) {
    const targetIssue = issueMap[resCard.subtype];
    const isHelpdesk = resCard.subtype === 'helpdesk';
    
    // Check switches first (highest impact)
    for (const sw of network.switches) {
      const matchingIssues = isHelpdesk 
        ? sw.attachedIssues.length 
        : sw.attachedIssues.filter(i => i.subtype === targetIssue).length;
      
      if (matchingIssues > 0) {
        // Calculate computers affected by this switch
        const computersOnSwitch = sw.cables.reduce((sum, c) => sum + c.computers.length, 0);
        const utility = computersOnSwitch * 8 + matchingIssues * 5; // High utility for switch repairs
        
        actions.push({
          type: 'play_resolution',
          card: resCard,
          targetId: sw.id,
          utility,
          reasoning: `Repair switch - restore ${computersOnSwitch} computer(s)`,
          risk: 0,
        });
      }
      
      // Check cables
      for (const cable of sw.cables) {
        const cableIssues = isHelpdesk
          ? cable.attachedIssues.length
          : cable.attachedIssues.filter(i => i.subtype === targetIssue).length;
        
        if (cableIssues > 0) {
          const computersOnCable = cable.computers.length;
          const utility = computersOnCable * 6 + cableIssues * 3;
          
          actions.push({
            type: 'play_resolution',
            card: resCard,
            targetId: cable.id,
            utility,
            reasoning: `Repair cable - restore ${computersOnCable} computer(s)`,
            risk: 0,
          });
        }
        
        // Check computers
        for (const comp of cable.computers) {
          const compIssues = isHelpdesk
            ? comp.attachedIssues.length
            : comp.attachedIssues.filter(i => i.subtype === targetIssue).length;
          
          if (compIssues > 0) {
            // Only repair if path is clear
            const pathClear = !sw.isDisabled && !cable.isDisabled;
            const utility = pathClear ? 10 : 3;
            
            actions.push({
              type: 'play_resolution',
              card: resCard,
              targetId: comp.id,
              utility,
              reasoning: pathClear 
                ? 'Repair computer - restore 1 bitcoin' 
                : 'Repair computer (path still blocked)',
              risk: 0,
            });
          }
        }
      }
    }
    
    // Check floating equipment
    for (const cable of network.floatingCables) {
      const cableIssues = isHelpdesk
        ? cable.attachedIssues.length
        : cable.attachedIssues.filter(i => i.subtype === targetIssue).length;
      
      if (cableIssues > 0) {
        actions.push({
          type: 'play_resolution',
          card: resCard,
          targetId: cable.id,
          utility: 5,
          reasoning: 'Repair floating cable',
          risk: 0,
        });
      }
    }
  }
  
  return actions;
}

// =============================================================================
// DISRUPT PHASE - Attack Opponent
// =============================================================================
function evaluateDisruptActions(
  boardState: BoardState, 
  aiPlayer: Player, 
  oppPlayer: Player,
  oppPlayerIndex: number
): EvaluatedAction[] {
  const actions: EvaluatedAction[] = [];
  const { difficulty, oppNearWin, scoreDifference, oppConnectedComputers } = boardState;
  
  // Don't attack weak opponents (waste of attacks) - except easy AI
  if (oppConnectedComputers < 2 && difficulty !== 'easy') {
    if (boardState.attacksInHand.length < 3) {
      return actions;
    }
  }
  
  // Attack evaluation
  for (const attackCard of boardState.attacksInHand) {
    // Check classification immunity
    const isBlocked = 
      (attackCard.subtype === 'hacked' && boardState.oppHasSecuritySpecialist) ||
      (attackCard.subtype === 'power-outage' && boardState.oppHasFacilities) ||
      (attackCard.subtype === 'new-hire' && boardState.oppHasSupervisor);
    
    if (isBlocked) {
      // Can still bait out classifications
      actions.push({
        type: 'play_attack',
        card: attackCard,
        utility: -5,
        reasoning: 'Attack would be blocked by classification',
        risk: 1,
      });
      continue;
    }
    
    // Find targets
    const targets = findAttackTargets(oppPlayer.network);
    
    for (const target of targets) {
      let utility = 8;
      
      // Prioritize by impact
      if (target.type === 'switch') {
        utility = target.computersAffected * 5 + 10; // Switches have cascading effect
      } else if (target.type === 'cable') {
        utility = target.computersAffected * 4 + 5;
      } else {
        utility = 6; // Single computer
      }
      
      // Urgency multiplier
      if (oppNearWin) {
        utility *= 2; // Must disrupt!
      } else if (scoreDifference < -5) {
        utility *= 1.5; // Behind - be aggressive
      }
      
      // Hard AI waits for bigger impact
      if (difficulty === 'hard' && oppConnectedComputers < 3) {
        utility *= 0.6;
      }
      
      // Easy AI attacks immediately
      if (difficulty === 'easy') {
        utility *= 1.2;
      }
      
      actions.push({
        type: 'play_attack',
        card: attackCard,
        targetId: target.equipmentId,
        targetPlayerIndex: oppPlayerIndex,
        utility,
        reasoning: `Attack ${target.type} affecting ${target.computersAffected} computer(s)`,
        risk: 0.2,
      });
    }
  }
  
  // Audit evaluation
  for (const auditCard of boardState.auditCardsInHand) {
    const computersToReturn = Math.ceil(boardState.oppTotalComputers / 2);
    
    if (computersToReturn === 0) {
      continue;
    }
    
    let utility = computersToReturn * 6;
    
    // Check counter resources
    const aiSecuredCount = aiPlayer.hand.filter(c => c.subtype === 'secured').length;
    
    // Hard AI uses strategically
    if (difficulty === 'hard') {
      if (aiSecuredCount < 1) utility *= 0.4;
      if (boardState.oppTurnsToWin <= 3) utility *= 2;
    }
    
    // Easy AI uses immediately
    if (difficulty === 'easy') {
      utility *= 1.3;
    }
    
    if (oppNearWin) {
      utility *= 1.8;
    }
    
    actions.push({
      type: 'start_audit',
      card: auditCard,
      targetPlayerIndex: oppPlayerIndex,
      utility,
      reasoning: `Audit would return ${computersToReturn} computer(s)`,
      risk: 0.4,
    });
  }
  
  return actions;
}

// =============================================================================
// SETUP PHASE - Long-term Positioning
// =============================================================================
function evaluateSetupActions(boardState: BoardState, aiPlayer: Player, oppPlayer: Player): EvaluatedAction[] {
  const actions: EvaluatedAction[] = [];
  const { difficulty } = boardState;
  
  // Already at max classifications
  if (aiPlayer.classificationCards.length >= 2) {
    return actions;
  }
  
  for (const classCard of boardState.classificationsInHand) {
    // Skip steal cards in setup phase (handled in disrupt via steals)
    if (classCard.subtype === 'head-hunter' || classCard.subtype === 'seal-the-deal') {
      continue;
    }
    
    let utility = 8;
    
    // Field Tech is most valuable (+1 equipment move)
    if (classCard.subtype === 'field-tech') {
      utility = 15;
    }
    
    // Defensive classifications - value based on vulnerability
    if (['security-specialist', 'facilities', 'supervisor'].includes(classCard.subtype)) {
      if (boardState.disabledSwitches > 0 || boardState.disabledCables > 0) {
        utility = 12; // Under attack - need protection
      }
      
      // Check if would auto-resolve existing issues
      const resolveType = {
        'security-specialist': 'hacked',
        'facilities': 'power-outage',
        'supervisor': 'new-hire',
      }[classCard.subtype];
      
      if (resolveType) {
        const wouldResolve = countIssuesOfType(aiPlayer.network, resolveType);
        utility += wouldResolve * 4;
      }
    }
    
    // Hard AI times classifications optimally
    if (difficulty === 'hard') {
      if (boardState.myConnectedComputers < 3) {
        utility *= 0.7; // Wait until network is established
      }
    }
    
    actions.push({
      type: 'play_classification',
      card: classCard,
      utility,
      reasoning: `Play ${classCard.name}`,
      risk: 0,
    });
  }
  
  // Steal evaluation
  if (oppPlayer.classificationCards.length > 0 && !boardState.oppIsStealProtected) {
    for (const stealCard of boardState.stealCardsInHand) {
      for (const targetClass of oppPlayer.classificationCards) {
        // Don't steal if we already have that type
        if (aiPlayer.classificationCards.some(c => c.card.subtype === targetClass.card.subtype)) {
          continue;
        }
        
        let utility = 10;
        
        // Seal the Deal is unblockable
        if (stealCard.subtype === 'seal-the-deal') {
          utility = 15;
          // Hard AI saves for high-value targets
          if (difficulty === 'hard' && targetClass.card.subtype !== 'field-tech') {
            utility *= 0.6;
          }
        }
        
        actions.push({
          type: 'steal_classification',
          card: stealCard,
          targetId: targetClass.id,
          utility,
          reasoning: `Steal ${targetClass.card.name}`,
          risk: stealCard.subtype === 'seal-the-deal' ? 0 : 0.3,
        });
      }
    }
  }
  
  return actions;
}

// =============================================================================
// CYCLE PHASE - Hand Optimization
// =============================================================================
function evaluateCycleActions(boardState: BoardState, aiPlayer: Player, oppPlayer: Player): EvaluatedAction[] {
  const actions: EvaluatedAction[] = [];
  const { difficulty } = boardState;
  
  // Calculate card values for discard priority
  const cardPriorities: { card: Card; value: number; reason: string }[] = [];
  
  for (const card of aiPlayer.hand) {
    let value = 50; // Base value
    let reason = 'Standard value';
    
    // Discard priority order from spec:
    // 1) Duplicate attacks beyond immediate need
    // 2) Duplicate resolutions with no matching targets
    // 3) Extra switches if 4+ on board
    // 4) Extra cables if 5+ floating
    // 5) Low-impact cards
    
    if (card.type === 'attack' && card.subtype !== 'audit') {
      const sameTypeCount = aiPlayer.hand.filter(c => c.subtype === card.subtype).length;
      if (sameTypeCount > 2) {
        value = 15;
        reason = 'Duplicate attack beyond need';
      } else if (oppPlayer.network.switches.length === 0) {
        value = 20;
        reason = 'No attack targets available';
      }
    }
    
    if (card.type === 'resolution') {
      const hasMatchingIssue = hasMatchingIssueForResolution(aiPlayer.network, card.subtype);
      if (!hasMatchingIssue && card.subtype !== 'helpdesk') {
        value = 10;
        reason = 'Resolution with no matching target';
      }
    }
    
    if (card.subtype === 'switch') {
      if (boardState.availableEnabledSwitches >= 4) {
        value = 20;
        reason = 'Extra switch (4+ on board)';
      }
    }
    
    if (card.subtype === 'cable-2' || card.subtype === 'cable-3') {
      if (boardState.floatingCables >= 5) {
        value = 25;
        reason = 'Extra cable (5+ floating)';
      }
    }
    
    // Safety rule: Keep at least one Hacked or Secured if possible
    if (card.subtype === 'hacked' || card.subtype === 'secured') {
      const sameTypeCount = aiPlayer.hand.filter(c => c.subtype === card.subtype).length;
      if (sameTypeCount <= 1) {
        value = 80; // Don't discard last counter
        reason = 'Keep for counter battles';
      }
    }
    
    cardPriorities.push({ card, value, reason });
  }
  
  // Sort by value (lowest first for discarding)
  cardPriorities.sort((a, b) => a.value - b.value);
  
  for (const { card, value, reason } of cardPriorities) {
    const utility = -value * 0.15; // Negative utility - discarding is last resort
    
    actions.push({
      type: 'discard',
      card,
      utility,
      reasoning: reason,
      risk: 0,
    });
  }
  
  return actions;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function findAttackTargets(network: PlayerNetwork): { type: string; equipmentId: string; computersAffected: number }[] {
  const targets: { type: string; equipmentId: string; computersAffected: number }[] = [];
  
  for (const sw of network.switches) {
    if (!sw.isDisabled) {
      const totalComputers = sw.cables.reduce((sum, c) => 
        sum + c.computers.filter(comp => !comp.isDisabled).length, 0);
      targets.push({ type: 'switch', equipmentId: sw.id, computersAffected: totalComputers });
    }
    
    for (const cable of sw.cables) {
      if (!cable.isDisabled) {
        const computers = cable.computers.filter(c => !c.isDisabled).length;
        targets.push({ type: 'cable', equipmentId: cable.id, computersAffected: computers });
      }
      
      for (const comp of cable.computers) {
        if (!comp.isDisabled) {
          targets.push({ type: 'computer', equipmentId: comp.id, computersAffected: 1 });
        }
      }
    }
  }
  
  // Floating equipment
  for (const cable of network.floatingCables) {
    if (!cable.isDisabled) {
      targets.push({ type: 'floating_cable', equipmentId: cable.id, computersAffected: cable.computers.length });
    }
  }
  
  for (const comp of network.floatingComputers) {
    if (!comp.isDisabled) {
      targets.push({ type: 'floating_computer', equipmentId: comp.id, computersAffected: 0 });
    }
  }
  
  targets.sort((a, b) => b.computersAffected - a.computersAffected);
  return targets;
}

function countIssuesOfType(network: PlayerNetwork, issueType: string): number {
  let count = 0;
  
  for (const sw of network.switches) {
    count += sw.attachedIssues.filter(i => i.subtype === issueType).length;
    for (const cable of sw.cables) {
      count += cable.attachedIssues.filter(i => i.subtype === issueType).length;
      for (const comp of cable.computers) {
        count += comp.attachedIssues.filter(i => i.subtype === issueType).length;
      }
    }
  }
  
  return count;
}

function hasMatchingIssueForResolution(network: PlayerNetwork, resolutionSubtype: string): boolean {
  const issueMap: Record<string, string> = {
    'secured': 'hacked',
    'powered': 'power-outage',
    'trained': 'new-hire',
  };
  
  const targetIssue = issueMap[resolutionSubtype];
  if (!targetIssue) return false;
  
  for (const sw of network.switches) {
    if (sw.attachedIssues.some(i => i.subtype === targetIssue)) return true;
    for (const cable of sw.cables) {
      if (cable.attachedIssues.some(i => i.subtype === targetIssue)) return true;
      for (const comp of cable.computers) {
        if (comp.attachedIssues.some(i => i.subtype === targetIssue)) return true;
      }
    }
  }
  
  for (const cable of network.floatingCables) {
    if (cable.attachedIssues.some(i => i.subtype === targetIssue)) return true;
  }
  
  return false;
}

function createFallbackDiscard(aiPlayer: Player, difficulty: AIDifficulty): EvaluatedAction | null {
  if (aiPlayer.hand.length === 0) return null;
  
  // Find lowest value card
  const card = aiPlayer.hand[0];
  
  return {
    type: 'discard',
    card,
    utility: -15,
    reasoning: 'Forced discard - no better actions available',
    risk: 0,
  };
}
