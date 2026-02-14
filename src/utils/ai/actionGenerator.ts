// =============================================================================
// ACTION GENERATOR - Generates ALL legal actions by category
// =============================================================================

import { GameState, Player, Card, PlayerNetwork } from '@/types/game';
import { EvaluatedAction } from './types';
import { BoardState } from './boardState';

// Action categories
export type ActionCategory = 'build' | 'reroute' | 'repair' | 'disrupt' | 'setup' | 'cycle';

// Generate all legal actions for a category
export function generateActionsForCategory(
  category: ActionCategory,
  boardState: BoardState,
  gameState: GameState,
  aiPlayerIndex: number
): EvaluatedAction[] {
  const aiPlayer = gameState.players[aiPlayerIndex];
  const oppPlayer = gameState.players[aiPlayerIndex === 0 ? 1 : 0];
  const oppPlayerIndex = aiPlayerIndex === 0 ? 1 : 0;
  
  switch (category) {
    case 'build':
      return generateBuildActions(boardState, aiPlayer);
    case 'reroute':
      return generateRerouteActions(boardState, aiPlayer);
    case 'repair':
      return generateRepairActions(boardState, aiPlayer);
    case 'disrupt':
      return generateDisruptActions(boardState, aiPlayer, oppPlayer, oppPlayerIndex);
    case 'setup':
      return generateSetupActions(boardState, aiPlayer, oppPlayer, oppPlayerIndex);
    case 'cycle':
      return generateCycleActions(boardState, aiPlayer);
    default:
      return [];
  }
}

// =============================================================================
// BUILD ACTIONS - CRITICAL: Includes all floating equipment placements
// =============================================================================
function generateBuildActions(boardState: BoardState, aiPlayer: Player): EvaluatedAction[] {
  const actions: EvaluatedAction[] = [];
  const network = aiPlayer.network;
  
  // 1) BUILD_FROM_HAND - Play equipment from hand
  
  // Switches from hand
  for (const switchCard of boardState.switchesInHand) {
    actions.push({
      type: 'play_switch',
      card: switchCard,
      utility: 0, // Will be calculated by evaluator
      reasoning: 'Play switch from hand',
      risk: 0,
    });
  }
  
  // Cables from hand - find all valid placements
  for (const cableCard of boardState.cablesInHand) {
    const cableCapacity = cableCard.subtype === 'cable-3' ? 3 : 2;
    
    // Can attach to any enabled switch
    for (const sw of network.switches) {
      if (!sw.isDisabled) {
        actions.push({
          type: 'play_cable',
          card: cableCard,
          targetId: sw.id,
          utility: 0,
          reasoning: `Play ${cableCapacity}-cable to enabled switch`,
          risk: 0,
        });
      }
    }
    
    // Can play as floating cable (up to 5)
    if (network.floatingCables.length < 5) {
      actions.push({
        type: 'play_cable',
        card: cableCard,
        utility: 0,
        reasoning: `Play ${cableCapacity}-cable as floating`,
        risk: 0,
      });
    }
  }
  
  // Computers from hand - find all valid placements
  for (const computerCard of boardState.computersInHand) {
    // PRIORITY: Cables on enabled switches with slots
    for (const sw of network.switches) {
      if (sw.isDisabled) continue;
      
      for (const cable of sw.cables) {
        if (!cable.isDisabled && cable.computers.length < cable.maxComputers) {
          actions.push({
            type: 'play_computer',
            card: computerCard,
            targetId: cable.id,
            utility: 0,
            reasoning: 'Play computer to enabled cable (SCORES IMMEDIATELY)',
            risk: 0,
          });
        }
      }
    }
    
    // Floating cables with slots
    for (const cable of network.floatingCables) {
      if (!cable.isDisabled && cable.computers.length < cable.maxComputers) {
        actions.push({
          type: 'play_computer',
          card: computerCard,
          targetId: cable.id,
          utility: 0,
          reasoning: 'Play computer to floating cable',
          risk: 0,
        });
      }
    }
    
    // Play as floating computer
    actions.push({
      type: 'play_computer',
      card: computerCard,
      utility: 0,
      reasoning: 'Play computer as floating',
      risk: 0,
    });
  }
  
  // Audited computers - same placements as hand computers, with utility bonus
  for (let auditIdx = 0; auditIdx < aiPlayer.auditedComputers.length; auditIdx++) {
    const computerCard = aiPlayer.auditedComputers[auditIdx];
    
    // PRIORITY: Cables on enabled switches with slots
    for (const sw of network.switches) {
      if (sw.isDisabled) continue;
      
      for (const cable of sw.cables) {
        if (!cable.isDisabled && cable.computers.length < cable.maxComputers) {
          actions.push({
            type: 'play_computer',
            card: computerCard,
            targetId: cable.id,
            utility: 8, // Bonus: audited computers don't cost a draw
            reasoning: 'Play AUDITED computer to enabled cable (SCORES IMMEDIATELY, FREE)',
            risk: 0,
          });
        }
      }
    }
    
    // Floating cables with slots
    for (const cable of network.floatingCables) {
      if (!cable.isDisabled && cable.computers.length < cable.maxComputers) {
        actions.push({
          type: 'play_computer',
          card: computerCard,
          targetId: cable.id,
          utility: 5, // Bonus for audited
          reasoning: 'Play AUDITED computer to floating cable (FREE)',
          risk: 0,
        });
      }
    }
    
    // Play as floating computer
    actions.push({
      type: 'play_computer',
      card: computerCard,
      utility: 3, // Small bonus for audited
      reasoning: 'Play AUDITED computer as floating (FREE)',
      risk: 0,
    });
  }
  
  // 2) BUILD_FROM_FLOATING_POOL - Already floating equipment
  // (These are handled in REROUTE as connecting floating items)
  
  // 3) BUILD_ATTACH_FLOATING_TO_EXISTING_NETWORK - CRITICAL FIX
  // These are FREE moves, generated here for visibility in BUILD category
  
  // Connect floating computers to enabled cables (FREE)
  for (const floatingComp of network.floatingComputers) {
    for (const sw of network.switches) {
      if (sw.isDisabled) continue;
      
      for (const cable of sw.cables) {
        if (!cable.isDisabled && cable.computers.length < cable.maxComputers) {
          actions.push({
            type: 'connect_floating_computer',
            sourceId: floatingComp.id,
            targetId: cable.id,
            utility: 0,
            reasoning: 'FREE: Connect floating computer (SCORES IMMEDIATELY)',
            risk: 0,
          });
        }
      }
    }
  }
  
  // Connect floating cables to enabled switches (FREE)
  for (const floatingCable of network.floatingCables) {
    for (const sw of network.switches) {
      if (!sw.isDisabled) {
        const computersOnCable = floatingCable.computers.filter(c => !c.isDisabled).length;
        actions.push({
          type: 'connect_cable_to_switch',
          sourceId: floatingCable.id,
          targetId: sw.id,
          utility: 0,
          reasoning: computersOnCable > 0 
            ? `FREE: Connect cable with ${computersOnCable} computers (SCORES IMMEDIATELY)`
            : 'FREE: Connect empty floating cable',
          risk: 0,
        });
      }
    }
  }
  
  return actions;
}

// =============================================================================
// REROUTE ACTIONS - Move equipment to better positions
// =============================================================================
function generateRerouteActions(boardState: BoardState, aiPlayer: Player): EvaluatedAction[] {
  const actions: EvaluatedAction[] = [];
  const network = aiPlayer.network;
  
  // Move cables from disabled switches to enabled switches
  for (const sw of network.switches) {
    if (!sw.isDisabled) continue; // Only from disabled switches
    
    for (const cable of sw.cables) {
      for (const targetSw of network.switches) {
        if (targetSw.isDisabled || targetSw.id === sw.id) continue;
        
        actions.push({
          type: 'move_cable_to_switch',
          sourceId: cable.id,
          targetId: targetSw.id,
          utility: 0,
          reasoning: `Move cable from disabled switch to enabled switch`,
          risk: 0,
        });
      }
    }
  }
  
  // Move computers from disabled cables to enabled cables
  for (const sw of network.switches) {
    for (const cable of sw.cables) {
      const needsRescue = cable.isDisabled || sw.isDisabled;
      if (!needsRescue) continue;
      
      for (const comp of cable.computers) {
        if (comp.attachedIssues.length > 0) continue; // Has direct issues
        
        // Find target cables on enabled switches
        for (const targetSw of network.switches) {
          if (targetSw.isDisabled) continue;
          
          for (const targetCable of targetSw.cables) {
            if (targetCable.isDisabled || targetCable.id === cable.id) continue;
            if (targetCable.computers.length >= targetCable.maxComputers) continue;
            
            actions.push({
              type: 'move_computer_to_cable',
              sourceId: comp.id,
              targetId: targetCable.id,
              utility: 0,
              reasoning: 'Move computer from disabled path to enabled cable',
              risk: 0,
            });
          }
        }
      }
    }
  }
  
  // Reroute cables between switches for optimization (costs 1 move)
  for (const sw of network.switches) {
    if (sw.isDisabled) continue;
    
    for (const cable of sw.cables) {
      // Check if moving to different switch would help
      for (const targetSw of network.switches) {
        if (targetSw.id === sw.id || targetSw.isDisabled) continue;
        
        // Only suggest if target switch has fewer cables (balancing)
        if (targetSw.cables.length < sw.cables.length) {
          actions.push({
            type: 'reroute_cable',
            sourceId: cable.id,
            targetId: targetSw.id,
            utility: 0,
            reasoning: 'Balance network by moving cable',
            risk: 0,
          });
        }
      }
    }
  }
  
  return actions;
}

// =============================================================================
// REPAIR ACTIONS - Fix disabled equipment
// =============================================================================
function generateRepairActions(boardState: BoardState, aiPlayer: Player): EvaluatedAction[] {
  const actions: EvaluatedAction[] = [];
  const network = aiPlayer.network;
  
  const issueMap: Record<string, string> = {
    'secured': 'hacked',
    'powered': 'power-outage',
    'trained': 'new-hire',
    'helpdesk': 'any',
  };
  
  for (const resCard of boardState.resolutionsInHand) {
    const targetIssue = issueMap[resCard.subtype];
    const isHelpdesk = resCard.subtype === 'helpdesk';
    
    // Find all equipment with matching issues
    
    // Switches
    for (const sw of network.switches) {
      const hasIssue = isHelpdesk 
        ? sw.attachedIssues.length > 0
        : sw.attachedIssues.some(i => i.subtype === targetIssue);
      
      if (hasIssue) {
        actions.push({
          type: 'play_resolution',
          card: resCard,
          targetId: sw.id,
          utility: 0,
          reasoning: `Repair switch (${resCard.subtype} resolves ${targetIssue})`,
          risk: 0,
        });
      }
      
      // Cables
      for (const cable of sw.cables) {
        const cableHasIssue = isHelpdesk
          ? cable.attachedIssues.length > 0
          : cable.attachedIssues.some(i => i.subtype === targetIssue);
        
        if (cableHasIssue) {
          actions.push({
            type: 'play_resolution',
            card: resCard,
            targetId: cable.id,
            utility: 0,
            reasoning: `Repair cable (${resCard.subtype} resolves ${targetIssue})`,
            risk: 0,
          });
        }
        
        // Computers
        for (const comp of cable.computers) {
          const compHasIssue = isHelpdesk
            ? comp.attachedIssues.length > 0
            : comp.attachedIssues.some(i => i.subtype === targetIssue);
          
          if (compHasIssue) {
            actions.push({
              type: 'play_resolution',
              card: resCard,
              targetId: comp.id,
              utility: 0,
              reasoning: `Repair computer (${resCard.subtype} resolves ${targetIssue})`,
              risk: 0,
            });
          }
        }
      }
    }
    
    // Floating equipment
    for (const cable of network.floatingCables) {
      const hasIssue = isHelpdesk
        ? cable.attachedIssues.length > 0
        : cable.attachedIssues.some(i => i.subtype === targetIssue);
      
      if (hasIssue) {
        actions.push({
          type: 'play_resolution',
          card: resCard,
          targetId: cable.id,
          utility: 0,
          reasoning: `Repair floating cable`,
          risk: 0,
        });
      }
      
      for (const comp of cable.computers) {
        const compHasIssue = isHelpdesk
          ? comp.attachedIssues.length > 0
          : comp.attachedIssues.some(i => i.subtype === targetIssue);
        
        if (compHasIssue) {
          actions.push({
            type: 'play_resolution',
            card: resCard,
            targetId: comp.id,
            utility: 0,
            reasoning: `Repair computer on floating cable`,
            risk: 0,
          });
        }
      }
    }
    
    for (const comp of network.floatingComputers) {
      const hasIssue = isHelpdesk
        ? comp.attachedIssues.length > 0
        : comp.attachedIssues.some(i => i.subtype === targetIssue);
      
      if (hasIssue) {
        actions.push({
          type: 'play_resolution',
          card: resCard,
          targetId: comp.id,
          utility: 0,
          reasoning: `Repair floating computer`,
          risk: 0,
        });
      }
    }
  }
  
  return actions;
}

// =============================================================================
// DISRUPT ACTIONS - Attack opponent
// =============================================================================
function generateDisruptActions(
  boardState: BoardState, 
  aiPlayer: Player, 
  oppPlayer: Player,
  oppPlayerIndex: number
): EvaluatedAction[] {
  const actions: EvaluatedAction[] = [];
  
  // Attack cards
  for (const attackCard of boardState.attacksInHand) {
    // Find all valid targets
    const targets = findAttackTargets(oppPlayer.network);
    
    for (const target of targets) {
      actions.push({
        type: 'play_attack',
        card: attackCard,
        targetId: target.id,
        targetPlayerIndex: oppPlayerIndex,
        utility: 0,
        reasoning: `Attack ${target.type} (${attackCard.subtype})`,
        risk: 0,
      });
    }
  }
  
  // Audit cards
  for (const auditCard of boardState.auditCardsInHand) {
    if (boardState.oppTotalComputers > 0) {
      actions.push({
        type: 'start_audit',
        card: auditCard,
        targetPlayerIndex: oppPlayerIndex,
        utility: 0,
        reasoning: `Audit opponent (returns ${Math.ceil(boardState.oppTotalComputers / 2)} computers)`,
        risk: 0,
      });
    }
  }
  
  return actions;
}

// =============================================================================
// SETUP ACTIONS - Classifications and steals
// =============================================================================
function generateSetupActions(
  boardState: BoardState,
  aiPlayer: Player,
  oppPlayer: Player,
  oppPlayerIndex: number
): EvaluatedAction[] {
  const actions: EvaluatedAction[] = [];
  
  // Classification cards (excluding steals)
  const currentClassCount = aiPlayer.classificationCards.length;
  
  for (const classCard of boardState.classificationsInHand) {
    if (classCard.subtype === 'head-hunter' || classCard.subtype === 'seal-the-deal') {
      continue; // Handle steals separately
    }
    
    actions.push({
      type: 'play_classification',
      card: classCard,
      utility: 0,
      reasoning: `Play ${classCard.name}`,
      risk: 0,
    });
  }
  
  // Steal cards - if opponent has classifications
  if (oppPlayer.classificationCards.length > 0 && !boardState.oppIsStealProtected) {
    for (const stealCard of boardState.stealCardsInHand) {
      for (const targetClass of oppPlayer.classificationCards) {
        // Don't steal if we already have that type
        const alreadyHave = aiPlayer.classificationCards.some(
          c => c.card.subtype === targetClass.card.subtype
        );
        
        if (!alreadyHave) {
          actions.push({
            type: 'steal_classification',
            card: stealCard,
            targetId: targetClass.id,
            targetPlayerIndex: oppPlayerIndex,
            utility: 0,
            reasoning: `Steal ${targetClass.card.name}`,
            risk: stealCard.subtype === 'seal-the-deal' ? 0 : 0.3,
          });
        }
      }
    }
  }
  
  return actions;
}

// =============================================================================
// CYCLE ACTIONS - Discard management with equipment discard prohibition
// =============================================================================
function generateCycleActions(boardState: BoardState, aiPlayer: Player): EvaluatedAction[] {
  const actions: EvaluatedAction[] = [];
  
  // Check if any legal equipment play exists - if so, equipment discards are forbidden
  const equipmentPlayExists = existsLegalEquipmentPlay(boardState, aiPlayer);
  
  // ALSO check for acceptable auto-connects (imported check happens at move selector level)
  // For cycle actions, we use a simpler check here
  const hasFloatingEquipment = 
    aiPlayer.network.floatingCables.length > 0 || 
    aiPlayer.network.floatingComputers.length > 0;
  
  for (const card of aiPlayer.hand) {
    const isEquipment = card.type === 'equipment';
    
    // RULE: NoDiscardIfAutoConnectExists + EquipmentDiscardForbidden
    // If any legal equipment play OR floating equipment exists, discarding equipment is NOT allowed
    if (isEquipment && (equipmentPlayExists || hasFloatingEquipment)) {
      continue; // Skip this discard action entirely
    }
    
    actions.push({
      type: 'discard',
      card,
      utility: 0,
      reasoning: `Discard ${card.name}`,
      risk: 0,
      // Mark equipment discards for penalty in evaluator (fallback)
      isEquipmentDiscard: isEquipment,
    } as EvaluatedAction);
  }
  
  return actions;
}

// =============================================================================
// EQUIPMENT PLAY CHECK - Determines if any legal equipment action exists
// =============================================================================
export function existsLegalEquipmentPlay(boardState: BoardState, aiPlayer: Player): boolean {
  const network = aiPlayer.network;
  
  // 1) Check if any equipment can be played from hand
  if (existsPlayableEquipmentFromHand(boardState, network)) {
    return true;
  }
  
  // 2) Check if any floating equipment can be placed
  if (existsFloatingEquipmentPlacement(network)) {
    return true;
  }
  
  // 3) Check if any reroute would improve activation
  if (existsRerouteThatImprovesFutureActivation(network)) {
    return true;
  }
  
  // 4) Check if any repair restores equipment functionality
  if (existsRepairThatRestoresEquipment(boardState, network)) {
    return true;
  }
  
  return false;
}

// Check if equipment in hand can be legally played
function existsPlayableEquipmentFromHand(boardState: BoardState, network: PlayerNetwork): boolean {
  // Switches can always be played
  if (boardState.switchesInHand.length > 0) {
    return true;
  }
  
  // Cables can be played to switches or as floating (up to 5)
  if (boardState.cablesInHand.length > 0) {
    // Can attach to any enabled switch
    const hasEnabledSwitch = network.switches.some(sw => !sw.isDisabled);
    if (hasEnabledSwitch) return true;
    
    // Can play as floating (up to 5)
    if (network.floatingCables.length < 5) return true;
  }
  
  // Computers can be played to cables or as floating
  if (boardState.computersInHand.length > 0) {
    // Check cables on enabled switches
    for (const sw of network.switches) {
      if (sw.isDisabled) continue;
      for (const cable of sw.cables) {
        if (!cable.isDisabled && cable.computers.length < cable.maxComputers) {
          return true;
        }
      }
    }
    
    // Check floating cables with slots
    for (const cable of network.floatingCables) {
      if (!cable.isDisabled && cable.computers.length < cable.maxComputers) {
        return true;
      }
    }
    
    // Computers can always be played as floating
    return true;
  }
  
  return false;
}

// Check if floating equipment can be attached
function existsFloatingEquipmentPlacement(network: PlayerNetwork): boolean {
  // Floating computers can attach to cables with slots
  if (network.floatingComputers.length > 0) {
    for (const sw of network.switches) {
      if (sw.isDisabled) continue;
      for (const cable of sw.cables) {
        if (!cable.isDisabled && cable.computers.length < cable.maxComputers) {
          return true;
        }
      }
    }
    
    // Check floating cables for slots too
    for (const cable of network.floatingCables) {
      if (!cable.isDisabled && cable.computers.length < cable.maxComputers) {
        return true;
      }
    }
  }
  
  // Floating cables can attach to enabled switches
  if (network.floatingCables.length > 0) {
    const hasEnabledSwitch = network.switches.some(sw => !sw.isDisabled);
    if (hasEnabledSwitch) return true;
  }
  
  return false;
}

// Check if any reroute would improve future activation
function existsRerouteThatImprovesFutureActivation(network: PlayerNetwork): boolean {
  // Check if cables on disabled switches can move to enabled switches
  for (const sw of network.switches) {
    if (!sw.isDisabled) continue; // Only from disabled switches
    
    for (const cable of sw.cables) {
      // This cable is stuck on a disabled switch - can it move?
      for (const targetSw of network.switches) {
        if (!targetSw.isDisabled && targetSw.id !== sw.id) {
          return true; // Found a reroute opportunity
        }
      }
    }
  }
  
  // Check if computers on disabled paths can move to enabled paths
  for (const sw of network.switches) {
    for (const cable of sw.cables) {
      const pathDisabled = cable.isDisabled || sw.isDisabled;
      if (!pathDisabled) continue;
      
      for (const comp of cable.computers) {
        if (comp.attachedIssues.length > 0) continue;
        
        // Can this computer move to an enabled path?
        for (const targetSw of network.switches) {
          if (targetSw.isDisabled) continue;
          
          for (const targetCable of targetSw.cables) {
            if (!targetCable.isDisabled && targetCable.computers.length < targetCable.maxComputers) {
              return true;
            }
          }
        }
      }
    }
  }
  
  return false;
}

// Check if any repair would restore equipment functionality
function existsRepairThatRestoresEquipment(boardState: BoardState, network: PlayerNetwork): boolean {
  if (boardState.resolutionsInHand.length === 0) return false;
  
  const issueMap: Record<string, string> = {
    'secured': 'hacked',
    'powered': 'power-outage',
    'trained': 'new-hire',
    'helpdesk': 'any',
  };
  
  for (const resCard of boardState.resolutionsInHand) {
    const targetIssue = issueMap[resCard.subtype];
    const isHelpdesk = resCard.subtype === 'helpdesk';
    
    // Check switches
    for (const sw of network.switches) {
      const hasMatchingIssue = isHelpdesk
        ? sw.attachedIssues.length > 0
        : sw.attachedIssues.some(i => i.subtype === targetIssue);
      if (hasMatchingIssue) return true;
      
      // Check cables
      for (const cable of sw.cables) {
        const cableHasIssue = isHelpdesk
          ? cable.attachedIssues.length > 0
          : cable.attachedIssues.some(i => i.subtype === targetIssue);
        if (cableHasIssue) return true;
        
        // Check computers
        for (const comp of cable.computers) {
          const compHasIssue = isHelpdesk
            ? comp.attachedIssues.length > 0
            : comp.attachedIssues.some(i => i.subtype === targetIssue);
          if (compHasIssue) return true;
        }
      }
    }
    
    // Check floating equipment
    for (const cable of network.floatingCables) {
      const hasIssue = isHelpdesk
        ? cable.attachedIssues.length > 0
        : cable.attachedIssues.some(i => i.subtype === targetIssue);
      if (hasIssue) return true;
    }
    
    for (const comp of network.floatingComputers) {
      const hasIssue = isHelpdesk
        ? comp.attachedIssues.length > 0
        : comp.attachedIssues.some(i => i.subtype === targetIssue);
      if (hasIssue) return true;
    }
  }
  
  return false;
}

// =============================================================================
// HELPER: Find attack targets
// =============================================================================
function findAttackTargets(network: PlayerNetwork): { id: string; type: string; computersAffected: number }[] {
  const targets: { id: string; type: string; computersAffected: number }[] = [];
  
  for (const sw of network.switches) {
    if (!sw.isDisabled) {
      const computers = sw.cables.reduce((sum, c) => 
        sum + c.computers.filter(comp => !comp.isDisabled).length, 0);
      targets.push({ id: sw.id, type: 'switch', computersAffected: computers });
    }
    
    for (const cable of sw.cables) {
      if (!cable.isDisabled && !sw.isDisabled) {
        const computers = cable.computers.filter(c => !c.isDisabled).length;
        targets.push({ id: cable.id, type: 'cable', computersAffected: computers });
      }
      
      for (const comp of cable.computers) {
        if (!comp.isDisabled && !cable.isDisabled && !sw.isDisabled) {
          targets.push({ id: comp.id, type: 'computer', computersAffected: 1 });
        }
      }
    }
  }
  
  // Floating equipment
  for (const cable of network.floatingCables) {
    if (!cable.isDisabled) {
      targets.push({ id: cable.id, type: 'floating_cable', computersAffected: cable.computers.length });
    }
  }
  
  for (const comp of network.floatingComputers) {
    if (!comp.isDisabled) {
      targets.push({ id: comp.id, type: 'floating_computer', computersAffected: 0 });
    }
  }
  
  return targets;
}
