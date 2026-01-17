import { Card, PlayerNetwork, Player, PlacedCard, CableNode, SwitchNode } from '@/types/game';
import { AIDecisionContext, EvaluatedAction, RerouteOpportunity, NetworkAnalysis } from './types';

// =============================================================================
// NETWORK BUILDING STRATEGY
// =============================================================================

export function evaluateNetworkBuilding(context: AIDecisionContext): EvaluatedAction[] {
  const actions: EvaluatedAction[] = [];
  const { aiHand, aiNetwork, aiPlayer, config, weights } = context;

  // Should we deploy multiple switches for redundancy?
  const shouldBuildRedundancy = 
    aiNetwork.singlePointFailures > 0 && 
    aiHand.switches.length > 0 && 
    config.difficulty !== 'easy';

  // Play Switch - higher priority if we have none or need redundancy
  for (const switchCard of aiHand.switches) {
    let utility = weights.boardStability * 3;
    
    if (aiNetwork.enabledSwitches === 0) {
      utility += weights.bitcoinGain * 5; // Critical - need switch to score
    } else if (shouldBuildRedundancy) {
      utility += weights.redundancyBonus * 4; // Build redundancy
    } else if (aiNetwork.enabledSwitches >= 2) {
      utility *= 0.3; // Already have enough
    }

    actions.push({
      type: 'play_switch',
      card: switchCard,
      utility,
      reasoning: aiNetwork.enabledSwitches === 0 
        ? 'Must build switch to start scoring' 
        : shouldBuildRedundancy 
          ? 'Building redundant switch for protection'
          : 'Expanding network capacity',
      risk: 0.2,
    });
  }

  // Play Cable
  for (const cableCard of aiHand.cables) {
    let utility = weights.boardStability * 2;
    const cableCapacity = cableCard.subtype === 'cable-3' ? 3 : 2;
    
    if (aiNetwork.enabledSwitches > 0 && aiNetwork.availableCableSlots === 0) {
      utility += weights.bitcoinGain * 3; // Need cables to place computers
    }
    
    // Prefer 3-cables
    if (cableCard.subtype === 'cable-3') {
      utility += weights.futureAdvantage * 1.5;
    }

    // Find best switch to attach to (distribute across switches for redundancy)
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
      reasoning: `Adding ${cableCapacity}-capacity cable to network`,
      risk: 0.1,
    });
  }

  // Play Computer - only if there's somewhere to put it
  for (const computerCard of aiHand.computers) {
    let utility = weights.bitcoinGain * 2;
    
    // Find cable with space on an enabled switch
    let targetCableId: string | undefined;
    let bestScore = -1;
    
    for (const sw of aiPlayer.network.switches) {
      if (sw.isDisabled) continue;
      
      for (const cable of sw.cables) {
        if (cable.isDisabled || cable.computers.length >= cable.maxComputers) continue;
        
        // Prefer cables on switches with fewer cables (spread risk)
        const score = (cable.maxComputers - cable.computers.length) + 
          (1 / (sw.cables.length + 1)) * 2;
        
        if (score > bestScore) {
          bestScore = score;
          targetCableId = cable.id;
        }
      }
    }

    if (targetCableId) {
      utility += weights.bitcoinGain * 3; // Will immediately score
    } else if (aiNetwork.availableCableSlots === 0) {
      utility *= 0.3; // Will be floating, less valuable
    }

    actions.push({
      type: 'play_computer',
      card: computerCard,
      targetId: targetCableId,
      utility,
      reasoning: targetCableId ? 'Computer will score immediately' : 'Placing floating computer',
      risk: 0.1,
    });
  }

  return actions;
}

// =============================================================================
// REROUTE & RECOVERY STRATEGY
// =============================================================================

export function findRerouteOpportunities(context: AIDecisionContext): RerouteOpportunity[] {
  const opportunities: RerouteOpportunity[] = [];
  const { aiPlayer } = context;
  const network = aiPlayer.network;

  // Find disabled switches with cables that could be moved
  for (let si = 0; si < network.switches.length; si++) {
    const disabledSwitch = network.switches[si];
    if (!disabledSwitch.isDisabled) continue;
    
    // Find enabled switches that could receive cables
    for (let ti = 0; ti < network.switches.length; ti++) {
      if (ti === si) continue;
      const targetSwitch = network.switches[ti];
      if (targetSwitch.isDisabled) continue;
      
      // Each cable on the disabled switch is a reroute opportunity
      for (const cable of disabledSwitch.cables) {
        const computersAffected = cable.computers.length;
        if (computersAffected === 0) continue;
        
        opportunities.push({
          sourceSwitchId: disabledSwitch.id,
          targetSwitchId: targetSwitch.id,
          cableId: cable.id,
          computersAffected,
          bitcoinRecovery: cable.computers.filter(c => !c.attachedIssues.length).length,
        });
      }
    }
  }

  // Sort by bitcoin recovery (highest first)
  opportunities.sort((a, b) => b.bitcoinRecovery - a.bitcoinRecovery);
  
  return opportunities;
}

export function evaluateRecoveryActions(context: AIDecisionContext): EvaluatedAction[] {
  const actions: EvaluatedAction[] = [];
  const { aiHand, aiNetwork, aiPlayer, weights } = context;

  // Priority: Resolve issues on equipment
  for (const resCard of aiHand.resolutions) {
    const targets = findResolutionTargets(aiPlayer.network, resCard.subtype);
    
    for (const target of targets) {
      let utility = weights.boardStability * 2;
      
      // Higher utility for resolving issues on switches (cascading effect)
      if (target.type === 'switch') {
        utility += weights.bitcoinGain * 4; // Re-enables entire branch
      } else if (target.type === 'cable') {
        utility += weights.bitcoinGain * 2;
      } else {
        utility += weights.bitcoinGain * 1;
      }
      
      // Helpdesk is more valuable if multiple issues
      if (resCard.subtype === 'helpdesk' && target.issueCount > 1) {
        utility += weights.futureAdvantage * target.issueCount;
      }

      actions.push({
        type: 'play_resolution',
        card: resCard,
        targetId: target.equipmentId,
        utility,
        reasoning: `Resolving ${target.issueType} on ${target.type}`,
        risk: 0,
      });
    }
  }

  // Connect floating cables to enabled switches
  for (const floatingCable of aiPlayer.network.floatingCables) {
    for (const sw of aiPlayer.network.switches) {
      if (sw.isDisabled) continue;
      
      const computersOnCable = floatingCable.computers.length;
      const utility = weights.bitcoinGain * (computersOnCable + 1);

      actions.push({
        type: 'connect_cable_to_switch',
        targetId: sw.id,
        utility,
        reasoning: `Connecting floating cable with ${computersOnCable} computers to switch`,
        risk: 0,
      });
    }
  }

  return actions;
}

// Helper to find resolution targets
function findResolutionTargets(
  network: PlayerNetwork, 
  resolutionSubtype: string
): { type: string; equipmentId: string; issueType: string; issueCount: number }[] {
  const targets: { type: string; equipmentId: string; issueType: string; issueCount: number }[] = [];
  
  const issueMap: Record<string, string> = {
    'secured': 'hacked',
    'powered': 'power-outage',
    'trained': 'new-hire',
  };
  const targetIssue = issueMap[resolutionSubtype];
  const isHelpdesk = resolutionSubtype === 'helpdesk';

  // Check all equipment
  for (const sw of network.switches) {
    const matchingIssues = isHelpdesk 
      ? sw.attachedIssues.length 
      : sw.attachedIssues.filter(i => i.subtype === targetIssue).length;
    
    if (matchingIssues > 0) {
      targets.push({
        type: 'switch',
        equipmentId: sw.id,
        issueType: isHelpdesk ? 'all issues' : targetIssue,
        issueCount: matchingIssues,
      });
    }

    for (const cable of sw.cables) {
      const cableIssues = isHelpdesk
        ? cable.attachedIssues.length
        : cable.attachedIssues.filter(i => i.subtype === targetIssue).length;
      
      if (cableIssues > 0) {
        targets.push({
          type: 'cable',
          equipmentId: cable.id,
          issueType: isHelpdesk ? 'all issues' : targetIssue,
          issueCount: cableIssues,
        });
      }

      for (const comp of cable.computers) {
        const compIssues = isHelpdesk
          ? comp.attachedIssues.length
          : comp.attachedIssues.filter(i => i.subtype === targetIssue).length;
        
        if (compIssues > 0) {
          targets.push({
            type: 'computer',
            equipmentId: comp.id,
            issueType: isHelpdesk ? 'all issues' : targetIssue,
            issueCount: compIssues,
          });
        }
      }
    }
  }

  // Check floating equipment too
  for (const cable of network.floatingCables) {
    const cableIssues = isHelpdesk
      ? cable.attachedIssues.length
      : cable.attachedIssues.filter(i => i.subtype === targetIssue).length;
    
    if (cableIssues > 0) {
      targets.push({
        type: 'floating_cable',
        equipmentId: cable.id,
        issueType: isHelpdesk ? 'all issues' : targetIssue,
        issueCount: cableIssues,
      });
    }
  }

  // Sort by impact (switches first, then cables, then computers)
  const priority: Record<string, number> = { switch: 0, cable: 1, floating_cable: 2, computer: 3 };
  targets.sort((a, b) => priority[a.type] - priority[b.type]);

  return targets;
}

// =============================================================================
// ATTACK TIMING STRATEGY
// =============================================================================

export function evaluateAttacks(context: AIDecisionContext): EvaluatedAction[] {
  const actions: EvaluatedAction[] = [];
  const { aiHand, humanNetwork, humanPlayer, config, weights, memory } = context;

  // Don't attack if opponent has weak network (waste of attacks)
  if (humanNetwork.connectedComputers < 2 && config.difficulty !== 'easy') {
    // Hold attacks for later unless we have many
    if (aiHand.attacks.length < 3) {
      return actions;
    }
  }

  // Find attack targets
  const targets = findAttackTargets(humanPlayer.network);
  
  for (const attackCard of aiHand.attacks) {
    // Check if attack would be blocked by classification
    const blockingClass = getBlockingClassification(attackCard.subtype);
    const isBlocked = humanPlayer.classificationCards.some(
      c => c.card.subtype === blockingClass
    );

    if (isBlocked) {
      // Still consider if we want to waste their classification protection
      const utility = -weights.riskPenalty * 2;
      actions.push({
        type: 'play_attack',
        card: attackCard,
        utility,
        reasoning: `Attack would be blocked by ${blockingClass}`,
        risk: 1,
      });
      continue;
    }

    for (const target of targets) {
      let utility = weights.bitcoinDenial;
      
      // Prioritize switches (cascading effect)
      if (target.type === 'switch') {
        utility += weights.bitcoinDenial * target.computersAffected * 1.5;
      } else if (target.type === 'cable') {
        utility += weights.bitcoinDenial * target.computersAffected;
      } else {
        utility += weights.bitcoinDenial * 0.5;
      }

      // Risk assessment based on opponent's likely counters
      const risk = memory.opponentBehavior.likelyCounters > 0.5 
        ? 0.4 
        : 0.1;

      // Easy AI doesn't hold attacks
      if (config.difficulty === 'easy') {
        utility *= 1.2;
      }

      // Hard AI considers timing
      if (config.difficulty === 'hard' && humanNetwork.connectedComputers < 3) {
        utility *= 0.5; // Wait for bigger impact
      }

      actions.push({
        type: 'play_attack',
        card: attackCard,
        targetId: target.equipmentId,
        targetPlayerIndex: context.humanPlayerIndex,
        utility,
        reasoning: `Attack ${target.type} affecting ${target.computersAffected} computer(s)`,
        risk,
      });
    }
  }

  return actions;
}

// Find valid attack targets
function findAttackTargets(
  network: PlayerNetwork
): { type: string; equipmentId: string; computersAffected: number }[] {
  const targets: { type: string; equipmentId: string; computersAffected: number }[] = [];

  // Connected equipment
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

  // Floating equipment can also be attacked
  for (const cable of network.floatingCables) {
    if (!cable.isDisabled) {
      targets.push({ 
        type: 'floating_cable', 
        equipmentId: cable.id, 
        computersAffected: cable.computers.length 
      });
    }
  }

  for (const comp of network.floatingComputers) {
    if (!comp.isDisabled) {
      targets.push({ type: 'floating_computer', equipmentId: comp.id, computersAffected: 0 });
    }
  }

  // Sort by impact (highest computers affected first)
  targets.sort((a, b) => b.computersAffected - a.computersAffected);

  return targets;
}

function getBlockingClassification(attackSubtype: string): string {
  const map: Record<string, string> = {
    'hacked': 'security-specialist',
    'power-outage': 'facilities',
    'new-hire': 'supervisor',
  };
  return map[attackSubtype] || '';
}

// =============================================================================
// AUDIT STRATEGY
// =============================================================================

export function evaluateAudit(context: AIDecisionContext): EvaluatedAction[] {
  const actions: EvaluatedAction[] = [];
  const { aiHand, humanNetwork, humanPlayer, aiPlayer, config, weights, memory, scoreDifference } = context;

  for (const auditCard of aiHand.auditCards) {
    // Count opponent's computers
    const totalComputers = humanNetwork.totalComputers;
    const computersToReturn = Math.ceil(totalComputers / 2);

    if (computersToReturn === 0) {
      actions.push({
        type: 'start_audit',
        card: auditCard,
        utility: -10, // No point
        reasoning: 'Opponent has no computers to audit',
        risk: 0,
      });
      continue;
    }

    let utility = weights.bitcoinDenial * computersToReturn * 2;

    // Assess risk of counter battle
    const aiSecuredCount = aiPlayer.hand.filter(c => c.subtype === 'secured').length;
    const estimatedOpponentHacked = memory.opponentBehavior.likelyAttacks;
    
    const counterRisk = estimatedOpponentHacked > aiSecuredCount ? 0.7 : 0.3;

    // Adjust based on game state
    if (scoreDifference < -5) {
      utility *= 1.5; // Desperate - need to disrupt
    } else if (scoreDifference > 5) {
      utility *= 0.7; // Ahead - don't risk
    }

    // Hard AI uses audit more strategically
    if (config.difficulty === 'hard') {
      // Only use if we have counter advantage
      if (aiSecuredCount < 1 && estimatedOpponentHacked > 0.5) {
        utility *= 0.3;
      }
      // Use when opponent is close to winning
      if (context.humanTurnsToWin <= 3) {
        utility *= 2;
      }
    }

    // Easy AI uses audit immediately
    if (config.difficulty === 'easy') {
      utility *= 1.3;
    }

    actions.push({
      type: 'start_audit',
      card: auditCard,
      targetPlayerIndex: context.humanPlayerIndex,
      utility: utility - weights.riskPenalty * counterRisk * 10,
      reasoning: `Audit would return ${computersToReturn} computer(s)`,
      risk: counterRisk,
    });
  }

  return actions;
}

// =============================================================================
// STEAL STRATEGY
// =============================================================================

export function evaluateSteals(context: AIDecisionContext): EvaluatedAction[] {
  const actions: EvaluatedAction[] = [];
  const { aiHand, humanPlayer, aiPlayer, weights, config } = context;

  // Check if opponent has classifications to steal
  if (humanPlayer.classificationCards.length === 0) {
    return actions;
  }

  // Check if opponent is steal-protected
  const classTypes = humanPlayer.classificationCards.map(c => c.card.subtype);
  const isProtected = classTypes.length === 2 && classTypes[0] === classTypes[1];

  if (isProtected) {
    // Only Seal the Deal can steal from protected opponent
    for (const stealCard of aiHand.stealCards) {
      if (stealCard.subtype !== 'seal-the-deal') continue;
      
      // Value of stealing
      const targetClass = humanPlayer.classificationCards[0];
      const utility = getClassificationValue(targetClass.card.subtype, context) * 0.8;

      actions.push({
        type: 'steal_classification',
        card: stealCard,
        targetId: targetClass.id,
        utility,
        reasoning: `Seal the Deal bypasses protection to steal ${targetClass.card.name}`,
        risk: 0,
      });
    }
    return actions;
  }

  for (const stealCard of aiHand.stealCards) {
    // Check if AI already has 2 classifications
    if (aiPlayer.classificationCards.length >= 2) {
      // Would need to discard one
      const utility = weights.classificationValue * 0.3;
      actions.push({
        type: 'steal_classification',
        card: stealCard,
        utility,
        reasoning: 'Would need to discard a classification',
        risk: 0.2,
      });
      continue;
    }

    // Evaluate each target
    for (const targetClass of humanPlayer.classificationCards) {
      // Don't steal if we already have that type
      if (aiPlayer.classificationCards.some(c => c.card.subtype === targetClass.card.subtype)) {
        continue;
      }

      const classValue = getClassificationValue(targetClass.card.subtype, context);
      let utility = classValue;

      // Head Hunter can be countered
      if (stealCard.subtype === 'head-hunter') {
        const opponentHasHeadHunter = humanPlayer.hand.some(c => c.subtype === 'head-hunter');
        // Rough estimate - 20% chance they have one
        const counterRisk = opponentHasHeadHunter ? 1 : 0.2;
        utility -= weights.riskPenalty * counterRisk * 3;
      }

      // Seal the Deal is unblockable
      if (stealCard.subtype === 'seal-the-deal') {
        utility *= 1.3; // Premium for guaranteed steal
        
        // Hard AI saves Seal the Deal for high-value targets
        if (config.difficulty === 'hard' && classValue < 5) {
          utility *= 0.5;
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

  return actions;
}

// Get value of a classification card
function getClassificationValue(subtype: string, context: AIDecisionContext): number {
  const base = context.weights.classificationValue;
  
  switch (subtype) {
    case 'field-tech':
      return base * 1.5; // +1 move is very valuable
    case 'security-specialist':
      // Value based on how many hacked attacks might come
      return base * 1.2;
    case 'facilities':
      return base * 1.0;
    case 'supervisor':
      return base * 1.0;
    default:
      return base * 0.5;
  }
}

// =============================================================================
// CLASSIFICATION PLAY STRATEGY
// =============================================================================

export function evaluateClassifications(context: AIDecisionContext): EvaluatedAction[] {
  const actions: EvaluatedAction[] = [];
  const { aiHand, aiPlayer, aiNetwork, weights, config } = context;

  // Already at max classifications?
  if (aiPlayer.classificationCards.length >= 2) {
    return actions;
  }

  for (const classCard of aiHand.classifications) {
    // Don't play duplicate unless for steal protection
    const hasSameType = aiPlayer.classificationCards.some(
      c => c.card.subtype === classCard.subtype
    );

    let utility = getClassificationValue(classCard.subtype, context);

    // Check if this classification would auto-resolve existing attacks
    const resolveType = getAutoResolveType(classCard.subtype);
    if (resolveType) {
      const wouldResolve = countMatchingIssues(aiPlayer.network, resolveType);
      utility += weights.boardStability * wouldResolve * 2;
    }

    if (hasSameType) {
      utility *= 0.3; // Duplicate is less valuable unless for protection
    }

    // Hard AI considers classification timing
    if (config.difficulty === 'hard') {
      // Play defensive classifications when we have equipment under attack
      if (aiNetwork.vulnerabilityScore > 0.3 && 
          ['security-specialist', 'facilities', 'supervisor'].includes(classCard.subtype)) {
        utility *= 1.5;
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

  return actions;
}

function getAutoResolveType(classSubtype: string): string | null {
  const map: Record<string, string> = {
    'security-specialist': 'hacked',
    'facilities': 'power-outage',
    'supervisor': 'new-hire',
  };
  return map[classSubtype] || null;
}

function countMatchingIssues(network: PlayerNetwork, issueType: string): number {
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

// =============================================================================
// DISCARD STRATEGY
// =============================================================================

export function evaluateDiscards(context: AIDecisionContext): EvaluatedAction[] {
  const actions: EvaluatedAction[] = [];
  const { aiHand, aiPlayer, humanPlayer, config, weights } = context;

  // Calculate card values
  const cardValues: { card: Card; value: number }[] = [];

  for (const card of aiPlayer.hand) {
    let value = 50; // Base value

    switch (card.type) {
      case 'equipment':
        if (card.subtype === 'switch') value = 100;
        else if (card.subtype === 'computer') value = 90;
        else if (card.subtype === 'cable-3') value = 80;
        else if (card.subtype === 'cable-2') value = 70;
        break;
      
      case 'attack':
        // Value based on whether opponent has targets
        const hasTargets = humanPlayer.network.switches.length > 0;
        value = hasTargets ? 60 : 25;
        break;
      
      case 'resolution':
        // Value based on whether we have matching issues
        const hasIssue = aiHand.resolutions.some(r => !aiHand.deadCards.includes(r));
        value = hasIssue ? 70 : 15;
        break;
      
      case 'classification':
        if (aiPlayer.classificationCards.length >= 2) value = 10;
        else if (card.subtype === 'head-hunter' || card.subtype === 'seal-the-deal') {
          value = humanPlayer.classificationCards.length > 0 ? 55 : 10;
        } else {
          value = 50;
        }
        break;
    }

    cardValues.push({ card, value });
  }

  // Sort by value (lowest first for discarding)
  cardValues.sort((a, b) => a.value - b.value);

  // Only suggest discarding low-value cards
  for (const { card, value } of cardValues) {
    if (value > 40) break; // Don't discard valuable cards

    const utility = -value * 0.1; // Negative utility (discarding is a last resort)
    
    // Bluff behavior for hard AI
    if (config.difficulty === 'hard' && Math.random() < config.bluffProbability) {
      // Occasionally discard medium-value cards to disguise hand
      if (value > 30 && value < 60) {
        actions.push({
          type: 'discard',
          card,
          utility: utility + 5, // Slight boost for bluff
          reasoning: 'Bluffing - discarding to disguise hand strength',
          risk: 0.1,
        });
      }
    }

    actions.push({
      type: 'discard',
      card,
      utility,
      reasoning: `Low value card (${value})`,
      risk: 0,
    });
  }

  return actions;
}
