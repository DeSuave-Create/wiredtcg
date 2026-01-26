// =============================================================================
// AUTO-CONNECT ENGINE - Priority handling for floating equipment connections
// =============================================================================

import { GameState, Player, PlayerNetwork, PlacedCard, CableNode } from '@/types/game';
import { EvaluatedAction } from './types';
import { BoardState } from './boardState';

// Auto-connect action with detailed move info
export interface AutoConnectMove {
  type: 'connect_floating_computer' | 'connect_cable_to_switch' | 'move_computer_to_cable' | 'move_cable_to_switch';
  pieceId: string;
  targetId: string;
  deltaBitcoinThisTurn: number;
  activatesSomethingNow: boolean;
  reducesStepsToActivationNextTurn: number;
  increasesPortOptions: boolean;
  createsNewBranchPoint: boolean;
  breaksActivePath: boolean;
  netGain: number;
  blocksBestKnownLine: boolean;
  usesRareConnectorOrResource: boolean;
}

export interface AutoConnectAction extends EvaluatedAction {
  move: AutoConnectMove;
}

// =============================================================================
// FIND ALL AUTO-CONNECT ACTIONS
// =============================================================================
export function findAutoConnectActions(
  boardState: BoardState,
  gameState: GameState,
  aiPlayerIndex: number
): AutoConnectAction[] {
  const actions: AutoConnectAction[] = [];
  const aiPlayer = gameState.players[aiPlayerIndex];
  const network = aiPlayer.network;
  
  // Process floating computers
  for (const floatingComp of network.floatingComputers) {
    const moves = enumerateComputerConnectMoves(floatingComp, network, boardState);
    for (const move of moves) {
      actions.push(createAutoConnectAction(move, floatingComp.card));
    }
  }
  
  // Process floating cables
  for (const floatingCable of network.floatingCables) {
    const moves = enumerateCableConnectMoves(floatingCable, network, boardState);
    for (const move of moves) {
      actions.push(createAutoConnectAction(move, floatingCable.card));
    }
  }
  
  // Process computers on disabled paths (stranded)
  for (const sw of network.switches) {
    for (const cable of sw.cables) {
      const pathDisabled = cable.isDisabled || sw.isDisabled;
      if (!pathDisabled) continue;
      
      for (const comp of cable.computers) {
        if (comp.attachedIssues.length > 0) continue; // Has direct issues
        const moves = enumerateStrandedComputerMoves(comp, network, boardState);
        for (const move of moves) {
          actions.push(createAutoConnectAction(move, comp.card));
        }
      }
    }
  }
  
  // Process cables on disabled switches (stranded)
  for (const sw of network.switches) {
    if (!sw.isDisabled) continue;
    
    for (const cable of sw.cables) {
      if (cable.attachedIssues.length > 0) continue; // Has direct issues
      const moves = enumerateStrandedCableMoves(cable, network, boardState);
      for (const move of moves) {
        actions.push(createAutoConnectAction(move, cable.card));
      }
    }
  }
  
  return actions;
}

// =============================================================================
// ENUMERATE LEGAL CONNECT MOVES
// =============================================================================

function enumerateComputerConnectMoves(
  floatingComp: PlacedCard,
  network: PlayerNetwork,
  boardState: BoardState
): AutoConnectMove[] {
  const moves: AutoConnectMove[] = [];
  
  // Find all enabled cables with available slots
  for (const sw of network.switches) {
    if (sw.isDisabled) continue;
    
    for (const cable of sw.cables) {
      if (cable.isDisabled) continue;
      if (cable.computers.length >= cable.maxComputers) continue;
      
      moves.push({
        type: 'connect_floating_computer',
        pieceId: floatingComp.id,
        targetId: cable.id,
        deltaBitcoinThisTurn: 1, // Connecting computer = +1 bitcoin
        activatesSomethingNow: true,
        reducesStepsToActivationNextTurn: 0, // Already activating now
        increasesPortOptions: false,
        createsNewBranchPoint: false,
        breaksActivePath: false,
        netGain: 1,
        blocksBestKnownLine: false,
        usesRareConnectorOrResource: false,
      });
    }
  }
  
  // Also check floating cables with slots (doesn't score but gets closer)
  for (const cable of network.floatingCables) {
    if (cable.isDisabled) continue;
    if (cable.computers.length >= cable.maxComputers) continue;
    
    moves.push({
      type: 'connect_floating_computer',
      pieceId: floatingComp.id,
      targetId: cable.id,
      deltaBitcoinThisTurn: 0,
      activatesSomethingNow: false,
      reducesStepsToActivationNextTurn: 1, // Now only needs switch
      increasesPortOptions: false,
      createsNewBranchPoint: false,
      breaksActivePath: false,
      netGain: 0,
      blocksBestKnownLine: false,
      usesRareConnectorOrResource: false,
    });
  }
  
  return moves;
}

function enumerateCableConnectMoves(
  floatingCable: CableNode,
  network: PlayerNetwork,
  boardState: BoardState
): AutoConnectMove[] {
  const moves: AutoConnectMove[] = [];
  
  // Count computers on this cable
  const computersOnCable = floatingCable.computers.filter(c => !c.isDisabled).length;
  
  // Find all enabled switches
  for (const sw of network.switches) {
    if (sw.isDisabled) continue;
    
    moves.push({
      type: 'connect_cable_to_switch',
      pieceId: floatingCable.id,
      targetId: sw.id,
      deltaBitcoinThisTurn: computersOnCable,
      activatesSomethingNow: computersOnCable > 0,
      reducesStepsToActivationNextTurn: computersOnCable === 0 ? 1 : 0,
      increasesPortOptions: floatingCable.computers.length < floatingCable.maxComputers,
      createsNewBranchPoint: true, // Cable creates new branch
      breaksActivePath: false,
      netGain: computersOnCable,
      blocksBestKnownLine: false,
      usesRareConnectorOrResource: false,
    });
  }
  
  return moves;
}

function enumerateStrandedComputerMoves(
  comp: PlacedCard,
  network: PlayerNetwork,
  boardState: BoardState
): AutoConnectMove[] {
  const moves: AutoConnectMove[] = [];
  
  // Find enabled cables with slots
  for (const sw of network.switches) {
    if (sw.isDisabled) continue;
    
    for (const cable of sw.cables) {
      if (cable.isDisabled) continue;
      if (cable.computers.length >= cable.maxComputers) continue;
      
      moves.push({
        type: 'move_computer_to_cable',
        pieceId: comp.id,
        targetId: cable.id,
        deltaBitcoinThisTurn: 1,
        activatesSomethingNow: true,
        reducesStepsToActivationNextTurn: 0,
        increasesPortOptions: false,
        createsNewBranchPoint: false,
        breaksActivePath: false, // Was already on disabled path
        netGain: 1,
        blocksBestKnownLine: false,
        usesRareConnectorOrResource: false,
      });
    }
  }
  
  return moves;
}

function enumerateStrandedCableMoves(
  cable: CableNode,
  network: PlayerNetwork,
  boardState: BoardState
): AutoConnectMove[] {
  const moves: AutoConnectMove[] = [];
  
  const computersOnCable = cable.computers.filter(c => !c.isDisabled).length;
  
  // Find enabled switches to move to
  for (const sw of network.switches) {
    if (sw.isDisabled) continue;
    
    moves.push({
      type: 'move_cable_to_switch',
      pieceId: cable.id,
      targetId: sw.id,
      deltaBitcoinThisTurn: computersOnCable,
      activatesSomethingNow: computersOnCable > 0,
      reducesStepsToActivationNextTurn: computersOnCable === 0 ? 1 : 0,
      increasesPortOptions: cable.computers.length < cable.maxComputers,
      createsNewBranchPoint: false, // Just moving, not creating
      breaksActivePath: false, // Was already on disabled switch
      netGain: computersOnCable,
      blocksBestKnownLine: false,
      usesRareConnectorOrResource: false,
    });
  }
  
  return moves;
}

// =============================================================================
// ACCEPTABILITY CHECK
// =============================================================================
export function isAcceptableAutoConnect(move: AutoConnectMove): boolean {
  // A) Must improve something measurable (now OR soon)
  const improvesNow = move.deltaBitcoinThisTurn > 0 || move.activatesSomethingNow;
  const improvesSoon = move.reducesStepsToActivationNextTurn >= 1;
  const addsFlex = move.increasesPortOptions || move.createsNewBranchPoint;
  
  if (!improvesNow && !improvesSoon && !addsFlex) {
    return false;
  }
  
  // B) Must not break existing active networks unless it is a net gain
  if (move.breaksActivePath && move.netGain < 0) {
    return false;
  }
  
  // C) Must not consume a "critical" cable/port needed for a guaranteed better line
  if (move.blocksBestKnownLine) {
    return false;
  }
  
  return true;
}

// =============================================================================
// SCORING
// =============================================================================
export function scoreAutoConnect(action: AutoConnectAction): number {
  const move = action.move;
  let utility = 0;
  
  // Core scoring - treat like a BUILD+REROUTE hybrid
  utility += 50 * move.deltaBitcoinThisTurn;
  utility += 25 * (move.activatesSomethingNow ? 1 : 0);
  utility += 20 * move.reducesStepsToActivationNextTurn;
  utility += 10 * (move.increasesPortOptions ? 1 : 0);
  
  // Penalties
  if (move.breaksActivePath) {
    utility -= 30;
  }
  
  if (move.usesRareConnectorOrResource) {
    utility -= 10;
  }
  
  return utility;
}

// =============================================================================
// HELPERS
// =============================================================================
function createAutoConnectAction(move: AutoConnectMove, card: any): AutoConnectAction {
  return {
    type: move.type as any,
    sourceId: move.pieceId,
    targetId: move.targetId,
    card,
    utility: 0, // Will be calculated by scoreAutoConnect
    reasoning: `Auto-connect: ${move.type} (${move.deltaBitcoinThisTurn > 0 ? 'SCORES NOW' : 'improves position'})`,
    risk: 0,
    move,
  };
}

// Check if any acceptable auto-connect exists (for equipment discard prohibition)
export function hasAcceptableAutoConnect(
  boardState: BoardState,
  gameState: GameState,
  aiPlayerIndex: number
): boolean {
  const actions = findAutoConnectActions(boardState, gameState, aiPlayerIndex);
  return actions.some(a => isAcceptableAutoConnect(a.move));
}

// Get the best auto-connect action if any exist
export function getBestAutoConnectAction(
  boardState: BoardState,
  gameState: GameState,
  aiPlayerIndex: number
): AutoConnectAction | null {
  const actions = findAutoConnectActions(boardState, gameState, aiPlayerIndex);
  const acceptable = actions.filter(a => isAcceptableAutoConnect(a.move));
  
  if (acceptable.length === 0) {
    return null;
  }
  
  // Score all acceptable actions
  for (const action of acceptable) {
    action.utility = scoreAutoConnect(action);
  }
  
  // Sort by utility and return best
  acceptable.sort((a, b) => b.utility - a.utility);
  return acceptable[0];
}
