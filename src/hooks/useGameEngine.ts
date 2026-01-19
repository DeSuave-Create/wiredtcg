import { useState, useCallback, useRef } from 'react';
import { GameState, Player, Card, GamePhase, PlayerNetwork, SwitchNode, CableNode, PlacedCard, FloatingCable, AIAction, AuditBattle, HeadHunterBattle } from '@/types/game';
import { buildDeck, shuffleDeck, dealCards } from '@/utils/deckBuilder';
import { 
  AIDifficulty, 
  makeAIDecision, 
  resetAIMemory, 
  decideAuditResponse, 
  selectAuditTargets,
  EvaluatedAction,
  getAIDecisionDebug,
} from '@/utils/ai';

const STARTING_HAND_SIZE = 6;
const MAX_HAND_SIZE = 6;
const BASE_MOVES_PER_TURN = 3;
const WINNING_SCORE = 25;

// Helper: Calculate base moves per turn (not including Field Tech equipment bonus)
function getBaseMovesForPlayer(): number {
  return BASE_MOVES_PER_TURN;
}

// Helper: Check if player has Field Tech (grants +1 equipment move per turn)
function hasFieldTech(player: Player): boolean {
  return player.classificationCards.some(c => c.card.subtype === 'field-tech');
}

// Helper: Count Head Hunter cards in player's classification area
function countHeadHuntersInPlay(player: Player): number {
  return player.classificationCards.filter(c => c.card.subtype === 'head-hunter').length;
}

// Helper: Count Head Hunter cards in player's hand
function countHeadHuntersInHand(player: Player): number {
  return player.hand.filter(c => c.subtype === 'head-hunter').length;
}

// Helper: Check if player has Seal the Deal (unblockable Head Hunter)
function hasSealTheDeal(player: Player): boolean {
  return player.classificationCards.some(c => c.card.subtype === 'seal-the-deal');
}

// Helper: Get the attack type that a classification auto-resolves
function getAutoResolveType(classificationType: string): string | null {
  const map: Record<string, string> = {
    'security-specialist': 'hacked',
    'facilities': 'power-outage',
    'supervisor': 'new-hire',
  };
  return map[classificationType] || null;
}

let placementIdCounter = 0;
function generatePlacementId(): string {
  placementIdCounter++;
  return `placement-${placementIdCounter}`;
}

function createEmptyNetwork(): PlayerNetwork {
  return {
    switches: [],
    floatingCables: [],
    floatingComputers: [],
  };
}

function createPlayer(id: string, name: string, isHuman: boolean): Player {
  return {
    id,
    name,
    hand: [],
    auditedComputers: [],
    network: createEmptyNetwork(),
    classificationCards: [],
    score: 0,
    isHuman,
  };
}

export function useGameEngine() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [aiDifficulty, setAIDifficulty] = useState<AIDifficulty>('normal');
  const [aiDebugInfo, setAIDebugInfo] = useState<{ topActions: EvaluatedAction[]; reasoning: string[] } | null>(null);

  const initializeGame = useCallback((playerName: string = 'Player', difficulty: AIDifficulty = 'normal') => {
    // Reset AI memory for new game
    resetAIMemory();
    setAIDifficulty(difficulty);
    
    // Build and shuffle deck
    const deck = shuffleDeck(buildDeck());
    
    // Create players
    const human = createPlayer('player-1', playerName, true);
    const computerName = difficulty === 'easy' ? 'Bot (Easy)' : difficulty === 'hard' ? 'Bot (Hard)' : 'Bot (Normal)';
    const computer = createPlayer('player-2', computerName, false);
    
    // Deal cards
    const { dealt: humanCards, remaining: afterHuman } = dealCards(deck, STARTING_HAND_SIZE);
    const { dealt: computerCards, remaining: drawPile } = dealCards(afterHuman, STARTING_HAND_SIZE);
    
    human.hand = humanCards;
    computer.hand = computerCards;
    
    const initialState: GameState = {
      players: [human, computer],
      currentPlayerIndex: 0,
      phase: 'moves',
      movesRemaining: BASE_MOVES_PER_TURN, // Human starts without classification cards
      equipmentMovesRemaining: 0, // No Field Tech at start
      drawPile,
      discardPile: [],
      turnNumber: 1,
      winner: null,
      gameLog: [`Game started vs ${computerName}! You go first.`, 'Build your network: Switch → Cable → Computer'],
      aiLastTurnActions: [],
    };
    
    setGameState(initialState);
    setSelectedCard(null);
    setSelectedTarget(null);
    setAIDebugInfo(null);
  }, []);

  const getCurrentPlayer = useCallback((): Player | null => {
    if (!gameState) return null;
    return gameState.players[gameState.currentPlayerIndex];
  }, [gameState]);

  const addLog = useCallback((message: string) => {
    setGameState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        gameLog: [...prev.gameLog.slice(-19), message], // Keep last 20 messages
      };
    });
  }, []);

  // Count connected computers for scoring
  const countConnectedComputers = useCallback((network: PlayerNetwork): number => {
    let count = 0;
    for (const switchNode of network.switches) {
      if (switchNode.isDisabled) continue;
      for (const cable of switchNode.cables) {
        if (cable.isDisabled) continue;
        for (const computer of cable.computers) {
          if (!computer.isDisabled) {
            count++;
          }
        }
      }
    }
    return count;
  }, []);

  // Helper: Find equipment by ID across network (including floating equipment)
  const findEquipmentById = useCallback((network: PlayerNetwork, equipmentId: string): { type: 'switch' | 'cable' | 'computer'; node: PlacedCard; switchIndex?: number; cableIndex?: number; computerIndex?: number; floatingCableIndex?: number; floatingComputerIndex?: number; isFloating?: boolean } | null => {
    // Check connected switches and their cables/computers
    for (let si = 0; si < network.switches.length; si++) {
      const sw = network.switches[si];
      if (sw.id === equipmentId) {
        return { type: 'switch', node: sw, switchIndex: si };
      }
      for (let ci = 0; ci < sw.cables.length; ci++) {
        const cable = sw.cables[ci];
        if (cable.id === equipmentId) {
          return { type: 'cable', node: cable, switchIndex: si, cableIndex: ci };
        }
        for (let coi = 0; coi < cable.computers.length; coi++) {
          const comp = cable.computers[coi];
          if (comp.id === equipmentId) {
            return { type: 'computer', node: comp, switchIndex: si, cableIndex: ci, computerIndex: coi };
          }
        }
      }
    }
    
    // Check floating cables and computers on them
    for (let fci = 0; fci < network.floatingCables.length; fci++) {
      const floatingCable = network.floatingCables[fci];
      if (floatingCable.id === equipmentId) {
        return { type: 'cable', node: floatingCable, floatingCableIndex: fci, isFloating: true };
      }
      for (let coi = 0; coi < floatingCable.computers.length; coi++) {
        const comp = floatingCable.computers[coi];
        if (comp.id === equipmentId) {
          return { type: 'computer', node: comp, floatingCableIndex: fci, computerIndex: coi, isFloating: true };
        }
      }
    }
    
    // Check floating computers
    for (let fcoi = 0; fcoi < network.floatingComputers.length; fcoi++) {
      const floatingComp = network.floatingComputers[fcoi];
      if (floatingComp.id === equipmentId) {
        return { type: 'computer', node: floatingComp, floatingComputerIndex: fcoi, isFloating: true };
      }
    }
    
    return null;
  }, []);

  // Check if attack is auto-resolved by classification (not blocked, but resolved instantly)
  // Returns the classification type that resolves it, or null if not auto-resolved
  const getAutoResolveClassification = useCallback((targetPlayer: Player, attackType: string): string | null => {
    const resolveMap: Record<string, string> = {
      'hacked': 'security-specialist',
      'power-outage': 'facilities',
      'new-hire': 'supervisor',
    };
    const resolvingClass = resolveMap[attackType];
    if (!resolvingClass) return null;
    const hasClass = targetPlayer.classificationCards.some(c => c.card.subtype === resolvingClass);
    return hasClass ? resolvingClass : null;
  }, []);

  // Update equipment disabled state based on issues
  const updateDisabledState = useCallback((node: PlacedCard): boolean => {
    return node.attachedIssues.length > 0;
  }, []);

  // Play a Switch card - NO auto-connect, requires manual proximity drop
  // Returns { success, switchId } for follow-up actions
  const playSwitch = useCallback((cardId?: string): { success: boolean; switchId?: string } => {
    if (!gameState) return { success: false };
    
    const player = gameState.players[gameState.currentPlayerIndex];
    const switchCard = cardId 
      ? player.hand.find(c => c.id === cardId)
      : player.hand.find(c => c.subtype === 'switch');
    
    if (!switchCard || switchCard.subtype !== 'switch') {
      addLog('No Switch card!');
      return { success: false };
    }
    
    // Check if we have moves available (either equipment bonus or regular)
    const hasEquipmentBonus = gameState.equipmentMovesRemaining > 0;
    const hasRegularMoves = gameState.movesRemaining > 0;
    
    if (!hasEquipmentBonus && !hasRegularMoves) {
      addLog('No moves remaining!');
      return { success: false };
    }
    
    const newSwitchId = generatePlacementId();
    
    setGameState(prev => {
      if (!prev) return prev;
      
      const newPlayers = [...prev.players];
      const currentPlayer = { ...newPlayers[prev.currentPlayerIndex] };
      
      // Remove card from hand
      currentPlayer.hand = currentPlayer.hand.filter(c => c.id !== switchCard.id);
      
      // Create new switch - no auto-connect
      const newSwitch: SwitchNode = {
        card: switchCard,
        id: newSwitchId,
        attachedIssues: [],
        isDisabled: false,
        cables: [],
      };
      
      currentPlayer.network = {
        ...currentPlayer.network,
        switches: [...currentPlayer.network.switches, newSwitch],
      };
      
      newPlayers[prev.currentPlayerIndex] = currentPlayer;
      
      // Use equipment bonus move first if available, otherwise use regular move
      const useEquipmentBonus = prev.equipmentMovesRemaining > 0;
      const newEquipmentMoves = useEquipmentBonus ? prev.equipmentMovesRemaining - 1 : prev.equipmentMovesRemaining;
      const newRegularMoves = useEquipmentBonus ? prev.movesRemaining : prev.movesRemaining - 1;
      const totalMovesLeft = newRegularMoves + newEquipmentMoves;
      
      return {
        ...prev,
        players: newPlayers,
        movesRemaining: newRegularMoves,
        equipmentMovesRemaining: newEquipmentMoves,
        gameLog: [...prev.gameLog.slice(-19), `Played Switch (${totalMovesLeft} moves left${useEquipmentBonus ? ' - used Field Tech bonus' : ''})`],
      };
    });
    
    return { success: true, switchId: newSwitchId };
  }, [gameState, addLog]);

  // Play a Cable card - NO auto-connect, requires proximity drop
  // Returns { success, cableId, maxComputers } for follow-up actions
  const playCable = useCallback((cardId?: string, targetSwitchId?: string): { success: boolean; cableId?: string; maxComputers?: number } => {
    if (!gameState) return { success: false };
    
    const player = gameState.players[gameState.currentPlayerIndex];
    const cableCard = cardId
      ? player.hand.find(c => c.id === cardId)
      : player.hand.find(c => c.subtype === 'cable-2' || c.subtype === 'cable-3');
    
    if (!cableCard || (cableCard.subtype !== 'cable-2' && cableCard.subtype !== 'cable-3')) {
      addLog('No Cable card!');
      return { success: false };
    }
    
    // Check if we have moves available (either equipment bonus or regular)
    const hasEquipmentBonus = gameState.equipmentMovesRemaining > 0;
    const hasRegularMoves = gameState.movesRemaining > 0;
    
    if (!hasEquipmentBonus && !hasRegularMoves) {
      addLog('No moves remaining!');
      return { success: false };
    }
    
    const maxComputers = cableCard.subtype === 'cable-2' ? 2 : 3;
    const newCableId = generatePlacementId();
    
    setGameState(prev => {
      if (!prev) return prev;
      
      const newPlayers = [...prev.players];
      const currentPlayer = { ...newPlayers[prev.currentPlayerIndex] };
      
      // Remove card from hand
      currentPlayer.hand = currentPlayer.hand.filter(c => c.id !== cableCard.id);
      
      // Create cable node - no auto-connect
      const newCable: CableNode = {
        card: cableCard,
        id: newCableId,
        attachedIssues: [],
        isDisabled: false,
        maxComputers: maxComputers as 2 | 3,
        computers: [],
      };
      
      // If a switch is specified and exists, connect to it
      const switchIndex = targetSwitchId 
        ? currentPlayer.network.switches.findIndex(s => s.id === targetSwitchId)
        : -1;
      
      if (switchIndex !== -1) {
        // Connect cable to switch
        const newSwitches = [...currentPlayer.network.switches];
        newSwitches[switchIndex] = {
          ...newSwitches[switchIndex],
          cables: [...newSwitches[switchIndex].cables, newCable],
        };
        
        currentPlayer.network = {
          ...currentPlayer.network,
          switches: newSwitches,
        };
      } else {
        // Add as floating cable
        currentPlayer.network = {
          ...currentPlayer.network,
          floatingCables: [...currentPlayer.network.floatingCables, newCable as FloatingCable],
        };
      }
      
      newPlayers[prev.currentPlayerIndex] = currentPlayer;
      
      const floatingMsg = switchIndex === -1 ? ' [floating]' : '';
      
      // Use equipment bonus move first if available, otherwise use regular move
      const useEquipmentBonus = prev.equipmentMovesRemaining > 0;
      const newEquipmentMoves = useEquipmentBonus ? prev.equipmentMovesRemaining - 1 : prev.equipmentMovesRemaining;
      const newRegularMoves = useEquipmentBonus ? prev.movesRemaining : prev.movesRemaining - 1;
      const totalMovesLeft = newRegularMoves + newEquipmentMoves;
      
      return {
        ...prev,
        players: newPlayers,
        movesRemaining: newRegularMoves,
        equipmentMovesRemaining: newEquipmentMoves,
        gameLog: [...prev.gameLog.slice(-19), `Played ${maxComputers}-Cable${floatingMsg} (${totalMovesLeft} moves left${useEquipmentBonus ? ' - used Field Tech bonus' : ''})`],
      };
    });
    
    return { success: true, cableId: newCableId, maxComputers };
  }, [gameState, addLog]);

  // Connect floating computers to a cable (FREE - no move cost)
  // Works for HUMAN player specifically (player index 0)
  const connectFloatingComputersToCable = useCallback((cableId: string, computerIds: string[]) => {
    if (!gameState || computerIds.length === 0) return false;
    
    setGameState(prev => {
      if (!prev) return prev;
      
      const newPlayers = [...prev.players];
      // Always use human player (index 0) for this action since it's triggered by dialog
      const humanPlayerIndex = 0;
      const currentPlayer = { ...newPlayers[humanPlayerIndex] };
      
      // Find the computers to connect from human player's floating computers
      const computersToConnect = currentPlayer.network.floatingComputers.filter(
        c => computerIds.includes(c.id)
      );
      
      if (computersToConnect.length === 0) {
        console.log('No computers found to connect');
        return prev;
      }
      
      // Remove connected computers from floating
      const remainingFloating = currentPlayer.network.floatingComputers.filter(
        c => !computerIds.includes(c.id)
      );
      
      // Try to find the cable in connected switches first
      let found = false;
      let connectedToSwitch = false;
      const newSwitches = currentPlayer.network.switches.map(sw => ({
        ...sw,
        cables: sw.cables.map(cable => {
          if (cable.id === cableId) {
            const spaceLeft = cable.maxComputers - cable.computers.length;
            const toAdd = computersToConnect.slice(0, spaceLeft);
            found = true;
            connectedToSwitch = true;
            return {
              ...cable,
              computers: [...cable.computers, ...toAdd],
            };
          }
          return cable;
        }),
      }));
      
      // Try floating cables if not found in switches
      let newFloatingCables = [...currentPlayer.network.floatingCables];
      if (!found) {
        newFloatingCables = currentPlayer.network.floatingCables.map(cable => {
          if (cable.id === cableId) {
            const spaceLeft = cable.maxComputers - cable.computers.length;
            const toAdd = computersToConnect.slice(0, spaceLeft);
            found = true;
            return {
              ...cable,
              computers: [...cable.computers, ...toAdd],
            };
          }
          return cable;
        });
      }
      
      if (!found) {
        console.log('Cable not found:', cableId);
        return prev;
      }
      
      currentPlayer.network = {
        ...currentPlayer.network,
        switches: newSwitches,
        floatingCables: newFloatingCables,
        floatingComputers: remainingFloating,
      };
      
      newPlayers[humanPlayerIndex] = currentPlayer;
      
      const locationMsg = connectedToSwitch ? ' (connected to internet!)' : ' (floating cable)';
      
      return {
        ...prev,
        players: newPlayers,
        gameLog: [...prev.gameLog.slice(-19), `Connected ${computersToConnect.length} computer(s)${locationMsg} (FREE)`],
      };
    });
    
    return true;
  }, [gameState]);

  // Connect floating cables to a switch (FREE - no move cost)
  // Works for HUMAN player specifically (player index 0)
  const connectFloatingCablesToSwitch = useCallback((switchId: string, cableIds: string[]) => {
    if (!gameState || cableIds.length === 0) return false;
    
    setGameState(prev => {
      if (!prev) return prev;
      
      const newPlayers = [...prev.players];
      // Always use human player (index 0) for this action since it's triggered by dialog
      const humanPlayerIndex = 0;
      const currentPlayer = { ...newPlayers[humanPlayerIndex] };
      
      // Find the cables to connect from human player's floating cables
      const cablesToConnect = currentPlayer.network.floatingCables.filter(
        c => cableIds.includes(c.id)
      );
      
      if (cablesToConnect.length === 0) {
        console.log('No cables found to connect');
        return prev;
      }
      
      // Find the target switch
      const switchIndex = currentPlayer.network.switches.findIndex(s => s.id === switchId);
      if (switchIndex === -1) {
        console.log('Switch not found:', switchId);
        return prev;
      }
      
      // Remove connected cables from floating
      const remainingFloating = currentPlayer.network.floatingCables.filter(
        c => !cableIds.includes(c.id)
      );
      
      // Add cables to the switch
      const newSwitches = [...currentPlayer.network.switches];
      newSwitches[switchIndex] = {
        ...newSwitches[switchIndex],
        cables: [...newSwitches[switchIndex].cables, ...cablesToConnect],
      };
      
      currentPlayer.network = {
        ...currentPlayer.network,
        switches: newSwitches,
        floatingCables: remainingFloating,
      };
      
      newPlayers[humanPlayerIndex] = currentPlayer;
      
      // Count total computers connected
      const totalComputers = cablesToConnect.reduce((sum, c) => sum + c.computers.length, 0);
      const computerMsg = totalComputers > 0 ? ` with ${totalComputers} computer(s)` : '';
      
      return {
        ...prev,
        players: newPlayers,
        gameLog: [...prev.gameLog.slice(-19), `Connected ${cablesToConnect.length} cable(s)${computerMsg} to switch! (FREE)`],
      };
    });
    
    return true;
  }, [gameState]);

  // Move placed equipment to a new location (costs 1 move - equipment move first if available)
  const moveEquipment = useCallback((
    sourceType: 'switch' | 'cable' | 'computer' | 'floating-cable' | 'floating-computer',
    sourceId: string,
    targetType: 'switch' | 'cable' | 'floating' | 'board',
    targetId?: string
  ) => {
    if (!gameState) return false;
    
    // Check if player has moves remaining (regular or equipment)
    const hasEquipmentMoves = gameState.equipmentMovesRemaining > 0;
    const hasRegularMoves = gameState.movesRemaining > 0;
    
    if (!hasEquipmentMoves && !hasRegularMoves) {
      console.log('No moves remaining to move equipment');
      return false;
    }
    
    // Only human player can rearrange
    const humanPlayerIndex = 0;
    
    setGameState(prev => {
      if (!prev) return prev;
      
      const newPlayers = [...prev.players];
      const player = { ...newPlayers[humanPlayerIndex] };
      let network = { ...player.network };
      
      let movedItem: any = null;
      let logMessage = '';
      
      // === EXTRACT the item from its source ===
      
      // Extract floating computer
      if (sourceType === 'floating-computer') {
        const idx = network.floatingComputers.findIndex(c => c.id === sourceId);
        if (idx !== -1) {
          movedItem = network.floatingComputers[idx];
          network.floatingComputers = network.floatingComputers.filter(c => c.id !== sourceId);
        }
      }
      
      // Extract floating cable (with its computers)
      else if (sourceType === 'floating-cable') {
        const idx = network.floatingCables.findIndex(c => c.id === sourceId);
        if (idx !== -1) {
          movedItem = network.floatingCables[idx];
          network.floatingCables = network.floatingCables.filter(c => c.id !== sourceId);
        }
      }
      
      // Extract computer from a cable (connected or floating)
      else if (sourceType === 'computer') {
        // Check connected cables
        let found = false;
        network.switches = network.switches.map(sw => ({
          ...sw,
          cables: sw.cables.map(cable => {
            const compIdx = cable.computers.findIndex(c => c.id === sourceId);
            if (compIdx !== -1) {
              movedItem = cable.computers[compIdx];
              found = true;
              return {
                ...cable,
                computers: cable.computers.filter(c => c.id !== sourceId),
              };
            }
            return cable;
          }),
        }));
        
        // Check floating cables if not found
        if (!found) {
          network.floatingCables = network.floatingCables.map(cable => {
            const compIdx = cable.computers.findIndex(c => c.id === sourceId);
            if (compIdx !== -1) {
              movedItem = cable.computers[compIdx];
              return {
                ...cable,
                computers: cable.computers.filter(c => c.id !== sourceId),
              };
            }
            return cable;
          });
        }
      }
      
      // Extract cable from a switch
      else if (sourceType === 'cable') {
        network.switches = network.switches.map(sw => {
          const cableIdx = sw.cables.findIndex(c => c.id === sourceId);
          if (cableIdx !== -1) {
            movedItem = sw.cables[cableIdx];
            return {
              ...sw,
              cables: sw.cables.filter(c => c.id !== sourceId),
            };
          }
          return sw;
        });
      }
      
      if (!movedItem) {
        console.log('Could not find item to move:', sourceType, sourceId);
        return prev;
      }
      
      // === PLACE the item at the target ===
      
      // Helper to recalculate disabled state based on new parent
      const recalculateDisabledState = (item: PlacedCard, parentDisabled: boolean): PlacedCard => {
        // Equipment is disabled if it has its own issues OR its parent is disabled
        const hasOwnIssues = item.attachedIssues.length > 0;
        return {
          ...item,
          isDisabled: hasOwnIssues || parentDisabled,
        };
      };
      
      const recalculateCableState = (cable: CableNode, switchDisabled: boolean): CableNode => {
        const cableHasIssues = cable.attachedIssues.length > 0;
        const cableDisabled = cableHasIssues || switchDisabled;
        return {
          ...cable,
          isDisabled: cableDisabled,
          computers: cable.computers.map(comp => recalculateDisabledState(comp, cableDisabled)),
        };
      };
      
      // Computer -> Cable or Floating
      if (sourceType === 'computer' || sourceType === 'floating-computer') {
        if (targetType === 'cable' && targetId) {
          // Try connected cables
          let placed = false;
          network.switches = network.switches.map(sw => ({
            ...sw,
            cables: sw.cables.map(cable => {
              if (cable.id === targetId && cable.computers.length < cable.maxComputers) {
                placed = true;
                logMessage = 'Moved computer to connected cable';
                // Recalculate disabled state based on new parent cable and switch
                const parentDisabled = sw.isDisabled || cable.isDisabled;
                const updatedComp = recalculateDisabledState(movedItem, parentDisabled);
                return { ...cable, computers: [...cable.computers, updatedComp] };
              }
              return cable;
            }),
          }));
          
          // Try floating cables if not placed
          if (!placed) {
            network.floatingCables = network.floatingCables.map(cable => {
              if (cable.id === targetId && cable.computers.length < cable.maxComputers) {
                placed = true;
                logMessage = 'Moved computer to floating cable';
                // Floating cables are always "disabled" in terms of scoring
                const updatedComp = recalculateDisabledState(movedItem, true);
                return { ...cable, computers: [...cable.computers, updatedComp] };
              }
              return cable;
            });
          }
          
          if (!placed) {
            // Put back as floating
            network.floatingComputers = [...network.floatingComputers, movedItem];
            logMessage = 'No space on target cable, computer is now floating';
          }
        } else {
          // Make it floating
          network.floatingComputers = [...network.floatingComputers, movedItem];
          logMessage = 'Computer disconnected (now floating)';
        }
      }
      
      // Cable -> Switch or Floating
      else if (sourceType === 'cable' || sourceType === 'floating-cable') {
        if (targetType === 'switch' && targetId) {
          let placed = false;
          network.switches = network.switches.map(sw => {
            if (sw.id === targetId) {
              placed = true;
              // Recalculate cable and computer states based on new parent switch
              const updatedCable = recalculateCableState(movedItem as CableNode, sw.isDisabled);
              logMessage = sw.isDisabled 
                ? 'Moved cable to disabled switch' 
                : 'Moved cable to switch - equipment re-enabled!';
              return { ...sw, cables: [...sw.cables, updatedCable] };
            }
            return sw;
          });
          
          if (!placed) {
            network.floatingCables = [...network.floatingCables, movedItem];
            logMessage = 'Cable is now floating';
          }
        } else {
          // Make it floating
          network.floatingCables = [...network.floatingCables, movedItem];
          logMessage = 'Cable disconnected (now floating)';
        }
      }
      
      player.network = network;
      newPlayers[humanPlayerIndex] = player;
      
      // Consume a move (equipment move first if available)
      let newEquipmentMoves = prev.equipmentMovesRemaining;
      let newMoves = prev.movesRemaining;
      if (newEquipmentMoves > 0) {
        newEquipmentMoves--;
      } else {
        newMoves--;
      }
      
      return {
        ...prev,
        players: newPlayers,
        movesRemaining: newMoves,
        equipmentMovesRemaining: newEquipmentMoves,
        gameLog: logMessage ? [...prev.gameLog.slice(-19), logMessage] : prev.gameLog,
      };
    });
    
    return true;
  }, [gameState]);

  // Play a Computer card - can be floating or connected to a cable
  const playComputer = useCallback((cardId?: string, targetCableId?: string) => {
    if (!gameState) return false;
    
    const player = gameState.players[gameState.currentPlayerIndex];
    const computerCard = cardId
      ? player.hand.find(c => c.id === cardId)
      : player.hand.find(c => c.subtype === 'computer');
    
    if (!computerCard || computerCard.subtype !== 'computer') {
      addLog('No Computer card!');
      return false;
    }
    
    // Check if we have moves available (either equipment bonus or regular)
    const hasEquipmentBonus = gameState.equipmentMovesRemaining > 0;
    const hasRegularMoves = gameState.movesRemaining > 0;
    
    if (!hasEquipmentBonus && !hasRegularMoves) {
      addLog('No moves remaining!');
      return false;
    }
    
    setGameState(prev => {
      if (!prev) return prev;
      
      const newPlayers = [...prev.players];
      const currentPlayer = { ...newPlayers[prev.currentPlayerIndex] };
      
      // Remove card from hand
      currentPlayer.hand = currentPlayer.hand.filter(c => c.id !== computerCard.id);
      
      const newComputer: PlacedCard = {
        card: computerCard,
        id: generatePlacementId(),
        attachedIssues: [],
        isDisabled: false,
      };
      
      // Try to find target cable (in switches or floating)
      let cableFound = false;
      
      if (targetCableId) {
        // Check connected cables in switches
        const newSwitches = currentPlayer.network.switches.map(sw => {
          const cableIndex = sw.cables.findIndex(c => c.id === targetCableId);
          if (cableIndex === -1) return sw;
          
          const cable = sw.cables[cableIndex];
          if (cable.computers.length >= cable.maxComputers) {
            return sw; // Cable is full
          }
          
          cableFound = true;
          
          const newCables = [...sw.cables];
          newCables[cableIndex] = {
            ...cable,
            computers: [...cable.computers, newComputer],
          };
          
          return { ...sw, cables: newCables };
        });
        
        if (cableFound) {
          currentPlayer.network = { ...currentPlayer.network, switches: newSwitches };
        } else {
          // Check floating cables
          const floatingCableIndex = currentPlayer.network.floatingCables.findIndex(c => c.id === targetCableId);
          if (floatingCableIndex !== -1) {
            const cable = currentPlayer.network.floatingCables[floatingCableIndex];
            if (cable.computers.length < cable.maxComputers) {
              cableFound = true;
              const newFloatingCables = [...currentPlayer.network.floatingCables];
              newFloatingCables[floatingCableIndex] = {
                ...cable,
                computers: [...cable.computers, newComputer],
              };
              currentPlayer.network = { ...currentPlayer.network, floatingCables: newFloatingCables };
            }
          }
        }
      }
      
      // If no cable found or specified, add as floating
      if (!cableFound) {
        currentPlayer.network = {
          ...currentPlayer.network,
          floatingComputers: [...currentPlayer.network.floatingComputers, newComputer],
        };
      }
      
      newPlayers[prev.currentPlayerIndex] = currentPlayer;
      
      const floatingMsg = !cableFound ? ' [floating]' : '';
      
      // Use equipment bonus move first if available, otherwise use regular move
      const useEquipmentBonus = prev.equipmentMovesRemaining > 0;
      const newEquipmentMoves = useEquipmentBonus ? prev.equipmentMovesRemaining - 1 : prev.equipmentMovesRemaining;
      const newRegularMoves = useEquipmentBonus ? prev.movesRemaining : prev.movesRemaining - 1;
      const totalMovesLeft = newRegularMoves + newEquipmentMoves;
      
      return {
        ...prev,
        players: newPlayers,
        movesRemaining: newRegularMoves,
        equipmentMovesRemaining: newEquipmentMoves,
        gameLog: [...prev.gameLog.slice(-19), `Played Computer${floatingMsg} (${totalMovesLeft} moves left${useEquipmentBonus ? ' - used Field Tech bonus' : ''})`],
      };
    });
    
    return true;
  }, [gameState, addLog]);

  // Play a computer from the audited computers pile (returned from audit)
  const playAuditedComputer = useCallback((cardId: string, auditedIndex: number, targetCableId?: string) => {
    if (!gameState) return false;
    
    const player = gameState.players[gameState.currentPlayerIndex];
    
    // Find the card in audited computers
    if (auditedIndex >= player.auditedComputers.length) {
      addLog('Invalid audited computer!');
      return false;
    }
    
    const computerCard = player.auditedComputers[auditedIndex];
    if (!computerCard || computerCard.subtype !== 'computer') {
      addLog('Not a computer card!');
      return false;
    }
    
    // Check if we have moves available (either equipment bonus or regular)
    const hasEquipmentBonus = gameState.equipmentMovesRemaining > 0;
    const hasRegularMoves = gameState.movesRemaining > 0;
    
    if (!hasEquipmentBonus && !hasRegularMoves) {
      addLog('No moves remaining!');
      return false;
    }
    
    setGameState(prev => {
      if (!prev) return prev;
      
      const newPlayers = [...prev.players];
      const currentPlayer = { ...newPlayers[prev.currentPlayerIndex] };
      
      // Remove card from audited computers
      currentPlayer.auditedComputers = [
        ...currentPlayer.auditedComputers.slice(0, auditedIndex),
        ...currentPlayer.auditedComputers.slice(auditedIndex + 1),
      ];
      
      const newComputer: PlacedCard = {
        card: computerCard,
        id: generatePlacementId(),
        attachedIssues: [],
        isDisabled: false,
      };
      
      // Try to find target cable (in switches or floating)
      let cableFound = false;
      
      if (targetCableId) {
        // Check connected cables in switches
        const newSwitches = currentPlayer.network.switches.map(sw => {
          const cableIndex = sw.cables.findIndex(c => c.id === targetCableId);
          if (cableIndex === -1) return sw;
          
          const cable = sw.cables[cableIndex];
          if (cable.computers.length >= cable.maxComputers) {
            return sw; // Cable is full
          }
          
          cableFound = true;
          
          const newCables = [...sw.cables];
          newCables[cableIndex] = {
            ...cable,
            computers: [...cable.computers, newComputer],
          };
          
          return { ...sw, cables: newCables };
        });
        
        if (cableFound) {
          currentPlayer.network = { ...currentPlayer.network, switches: newSwitches };
        } else {
          // Check floating cables
          const floatingCableIndex = currentPlayer.network.floatingCables.findIndex(c => c.id === targetCableId);
          if (floatingCableIndex !== -1) {
            const cable = currentPlayer.network.floatingCables[floatingCableIndex];
            if (cable.computers.length < cable.maxComputers) {
              cableFound = true;
              const newFloatingCables = [...currentPlayer.network.floatingCables];
              newFloatingCables[floatingCableIndex] = {
                ...cable,
                computers: [...cable.computers, newComputer],
              };
              currentPlayer.network = { ...currentPlayer.network, floatingCables: newFloatingCables };
            }
          }
        }
      }
      
      // If no cable found or specified, add as floating
      if (!cableFound) {
        currentPlayer.network = {
          ...currentPlayer.network,
          floatingComputers: [...currentPlayer.network.floatingComputers, newComputer],
        };
      }
      
      newPlayers[prev.currentPlayerIndex] = currentPlayer;
      
      const floatingMsg = !cableFound ? ' [floating]' : '';
      
      // Use equipment bonus move first if available, otherwise use regular move
      const useEquipmentBonus = prev.equipmentMovesRemaining > 0;
      const newEquipmentMoves = useEquipmentBonus ? prev.equipmentMovesRemaining - 1 : prev.equipmentMovesRemaining;
      const newRegularMoves = useEquipmentBonus ? prev.movesRemaining : prev.movesRemaining - 1;
      const totalMovesLeft = newRegularMoves + newEquipmentMoves;
      
      return {
        ...prev,
        players: newPlayers,
        movesRemaining: newRegularMoves,
        equipmentMovesRemaining: newEquipmentMoves,
        gameLog: [...prev.gameLog.slice(-19), `🔄 Played audited Computer${floatingMsg} (${totalMovesLeft} moves left${useEquipmentBonus ? ' - used Field Tech bonus' : ''})`],
      };
    });
    
    return true;
  }, [gameState, addLog]);

  // Discard a card from hand
  const discardCard = useCallback((cardId: string) => {
    if (!gameState) return false;
    
    setGameState(prev => {
      if (!prev) return prev;
      
      const newPlayers = [...prev.players];
      const currentPlayer = { ...newPlayers[prev.currentPlayerIndex] };
      
      const cardToDiscard = currentPlayer.hand.find(c => c.id === cardId);
      if (!cardToDiscard) return prev;
      
      currentPlayer.hand = currentPlayer.hand.filter(c => c.id !== cardId);
      newPlayers[prev.currentPlayerIndex] = currentPlayer;
      
      return {
        ...prev,
        players: newPlayers,
        discardPile: [...prev.discardPile, cardToDiscard],
        gameLog: [...prev.gameLog.slice(-19), `Discarded ${cardToDiscard.name}`],
      };
    });
    
    return true;
  }, [gameState]);

  // Discard a classification from the board
  const discardClassification = useCallback((classificationId: string) => {
    if (!gameState) return false;
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const classCard = currentPlayer.classificationCards.find(c => c.id === classificationId);
    
    if (!classCard) {
      addLog('Classification not found!');
      return false;
    }
    
    if (gameState.movesRemaining <= 0) {
      addLog('No moves remaining!');
      return false;
    }
    
    setGameState(prev => {
      if (!prev) return prev;
      
      const newPlayers = [...prev.players];
      const player = { ...newPlayers[prev.currentPlayerIndex] };
      
      // Remove from classification cards
      player.classificationCards = player.classificationCards.filter(c => c.id !== classificationId);
      newPlayers[prev.currentPlayerIndex] = player;
      
      return {
        ...prev,
        players: newPlayers,
        discardPile: [...prev.discardPile, classCard.card],
        movesRemaining: prev.movesRemaining - 1,
        gameLog: [...prev.gameLog.slice(-19), `🗑️ Discarded ${classCard.card.name} from board`],
      };
    });
    
    return true;
  }, [gameState]);

  // Play an Attack card on opponent's equipment
  const playAttack = useCallback((attackCardId: string, targetEquipmentId: string, targetPlayerIndex: number) => {
    if (!gameState) return false;
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const attackCard = currentPlayer.hand.find(c => c.id === attackCardId);
    
    if (!attackCard || attackCard.type !== 'attack') {
      addLog('Invalid attack card!');
      return false;
    }
    
    if (gameState.movesRemaining <= 0) {
      addLog('No moves remaining!');
      return false;
    }
    
    // Can't attack yourself
    if (targetPlayerIndex === gameState.currentPlayerIndex) {
      addLog("Can't attack your own equipment!");
      return false;
    }
    
    const targetPlayer = gameState.players[targetPlayerIndex];
    
    // Check if attack is auto-resolved by classification
    // The attack still "hits" but is instantly resolved - attacker loses their card and move
    const autoResolveClass = getAutoResolveClassification(targetPlayer, attackCard.subtype);
    if (autoResolveClass) {
      // Remove card from hand and discard it - attack is wasted
      setGameState(prev => {
        if (!prev) return prev;
        
        const newPlayers = [...prev.players];
        const attacker = { ...newPlayers[prev.currentPlayerIndex] };
        attacker.hand = attacker.hand.filter(c => c.id !== attackCard.id);
        newPlayers[prev.currentPlayerIndex] = attacker;
        
        const classNames: Record<string, string> = {
          'security-specialist': 'Security Specialist',
          'facilities': 'Facilities',
          'supervisor': 'Supervisor',
        };
        
        return {
          ...prev,
          players: newPlayers,
          discardPile: [...prev.discardPile, attackCard],
          movesRemaining: prev.movesRemaining - 1,
          gameLog: [...prev.gameLog.slice(-19), `⚡ ${attackCard.name} instantly resolved by ${classNames[autoResolveClass]}! Card wasted.`],
        };
      });
      return true; // Attack was "played" but auto-resolved
    }
    
    setGameState(prev => {
      if (!prev) return prev;
      
      const newPlayers = [...prev.players];
      const attacker = { ...newPlayers[prev.currentPlayerIndex] };
      const target = { ...newPlayers[targetPlayerIndex] };
      
      // Find target equipment
      const equipmentInfo = findEquipmentById(target.network, targetEquipmentId);
      if (!equipmentInfo) {
        return {
          ...prev,
          gameLog: [...prev.gameLog.slice(-19), 'Target equipment not found!'],
        };
      }
      
      // Remove attack card from attacker's hand
      attacker.hand = attacker.hand.filter(c => c.id !== attackCard.id);
      
      // Apply attack to target equipment - CASCADING DISABLE
      // Switch attack → disables switch + all cables + all computers
      // Cable attack → disables cable + all computers on it
      // Computer attack → disables only that computer
      
      let newNetwork = { ...target.network };
      
      // Handle floating equipment attacks
      if (equipmentInfo.isFloating) {
        if (equipmentInfo.type === 'cable' && equipmentInfo.floatingCableIndex !== undefined) {
          // Attack on floating cable - cascade to computers on it
          const newFloatingCables = [...newNetwork.floatingCables];
          const cable = newFloatingCables[equipmentInfo.floatingCableIndex];
          newFloatingCables[equipmentInfo.floatingCableIndex] = {
            ...cable,
            attachedIssues: [...cable.attachedIssues, attackCard],
            isDisabled: true,
            computers: cable.computers.map(comp => ({
              ...comp,
              isDisabled: true,
            })),
          };
          newNetwork = { ...newNetwork, floatingCables: newFloatingCables };
        } else if (equipmentInfo.type === 'computer' && equipmentInfo.floatingCableIndex !== undefined && equipmentInfo.computerIndex !== undefined) {
          // Attack on computer attached to floating cable
          const newFloatingCables = [...newNetwork.floatingCables];
          const cable = newFloatingCables[equipmentInfo.floatingCableIndex];
          const newComputers = [...cable.computers];
          newComputers[equipmentInfo.computerIndex] = {
            ...newComputers[equipmentInfo.computerIndex],
            attachedIssues: [...newComputers[equipmentInfo.computerIndex].attachedIssues, attackCard],
            isDisabled: true,
          };
          newFloatingCables[equipmentInfo.floatingCableIndex] = {
            ...cable,
            computers: newComputers,
          };
          newNetwork = { ...newNetwork, floatingCables: newFloatingCables };
        } else if (equipmentInfo.type === 'computer' && equipmentInfo.floatingComputerIndex !== undefined) {
          // Attack on floating computer (not attached to any cable)
          const newFloatingComputers = [...newNetwork.floatingComputers];
          newFloatingComputers[equipmentInfo.floatingComputerIndex] = {
            ...newFloatingComputers[equipmentInfo.floatingComputerIndex],
            attachedIssues: [...newFloatingComputers[equipmentInfo.floatingComputerIndex].attachedIssues, attackCard],
            isDisabled: true,
          };
          newNetwork = { ...newNetwork, floatingComputers: newFloatingComputers };
        }
      } else {
        // Handle connected equipment attacks (original logic)
        const newSwitches = target.network.switches.map((sw, si) => {
          // Attack on SWITCH - cascade to all cables and computers
          if (equipmentInfo.type === 'switch' && si === equipmentInfo.switchIndex) {
            return {
              ...sw,
              attachedIssues: [...sw.attachedIssues, attackCard],
              isDisabled: true,
              // Disable all cables and their computers
              cables: sw.cables.map(cable => ({
                ...cable,
                isDisabled: true,
                computers: cable.computers.map(comp => ({
                  ...comp,
                  isDisabled: true,
                })),
              })),
            };
          }
          
          return {
            ...sw,
            cables: sw.cables.map((cable, ci) => {
              // Attack on CABLE - cascade to all computers on it
              if (equipmentInfo.type === 'cable' && si === equipmentInfo.switchIndex && ci === equipmentInfo.cableIndex) {
                return {
                  ...cable,
                  attachedIssues: [...cable.attachedIssues, attackCard],
                  isDisabled: true,
                  // Disable all computers on this cable
                  computers: cable.computers.map(comp => ({
                    ...comp,
                    isDisabled: true,
                  })),
                };
              }
              
              return {
                ...cable,
                computers: cable.computers.map((comp, coi) => {
                  // Attack on COMPUTER - only disable that computer
                  if (equipmentInfo.type === 'computer' && si === equipmentInfo.switchIndex && ci === equipmentInfo.cableIndex && coi === equipmentInfo.computerIndex) {
                    return { ...comp, attachedIssues: [...comp.attachedIssues, attackCard], isDisabled: true };
                  }
                  return comp;
                }),
              };
            }),
          };
        });
        
        newNetwork = { ...newNetwork, switches: newSwitches };
      }
      
      target.network = newNetwork;
      
      newPlayers[prev.currentPlayerIndex] = attacker;
      newPlayers[targetPlayerIndex] = target;
      
      return {
        ...prev,
        players: newPlayers,
        discardPile: [...prev.discardPile, attackCard],
        movesRemaining: prev.movesRemaining - 1,
        gameLog: [...prev.gameLog.slice(-19), `⚡ ${attackCard.name} played on ${target.name}'s ${equipmentInfo.type}!`],
      };
    });
    
    return true;
  }, [gameState, addLog, findEquipmentById, getAutoResolveClassification]);

  // Play a Resolution card on your own equipment
  const playResolution = useCallback((resolutionCardId: string, targetEquipmentId: string) => {
    if (!gameState) return false;
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    
    // Only the current player can play resolution cards
    if (!currentPlayer.isHuman) {
      addLog('Not your turn!');
      return false;
    }
    
    const resolutionCard = currentPlayer.hand.find(c => c.id === resolutionCardId);
    
    if (!resolutionCard || resolutionCard.type !== 'resolution') {
      addLog('Invalid resolution card!');
      return false;
    }
    
    if (gameState.movesRemaining <= 0) {
      addLog('No moves remaining!');
      return false;
    }
    
    // Find target equipment in your own network
    const equipmentInfo = findEquipmentById(currentPlayer.network, targetEquipmentId);
    if (!equipmentInfo) {
      addLog('Target equipment not found!');
      return false;
    }
    
    // Check if equipment has matching issues
    const targetNode = equipmentInfo.node;
    const resolutionMap: Record<string, string> = {
      'secured': 'hacked',
      'powered': 'power-outage',
      'trained': 'new-hire',
    };
    
    const targetIssueType = resolutionMap[resolutionCard.subtype];
    const isHelpdesk = resolutionCard.subtype === 'helpdesk';
    
    if (!isHelpdesk && targetIssueType) {
      const hasMatchingIssue = targetNode.attachedIssues.some(i => i.subtype === targetIssueType);
      if (!hasMatchingIssue) {
        addLog(`No ${targetIssueType} issue to resolve!`);
        return false;
      }
    } else if (!isHelpdesk) {
      addLog('Unknown resolution card type!');
      return false;
    }
    
    if (targetNode.attachedIssues.length === 0) {
      addLog('No issues to resolve on this equipment!');
      return false;
    }
    
    setGameState(prev => {
      if (!prev) return prev;
      
      const newPlayers = [...prev.players];
      const player = { ...newPlayers[prev.currentPlayerIndex] };
      
      // Remove resolution card from hand
      player.hand = player.hand.filter(c => c.id !== resolutionCard.id);
      
      // Helper to remove matching issue
      const removeIssue = (issues: Card[]): Card[] => {
        if (isHelpdesk) return []; // Helpdesk removes ALL issues
        // Remove only ONE matching issue
        let removed = false;
        return issues.filter(i => {
          if (!removed && i.subtype === targetIssueType) {
            removed = true;
            return false;
          }
          return true;
        });
      };
      
      let newNetwork = { ...player.network };
      
      // Handle floating equipment resolutions
      if (equipmentInfo.isFloating) {
        if (equipmentInfo.type === 'cable' && equipmentInfo.floatingCableIndex !== undefined) {
          // Resolution on floating cable - cascade enable to computers on it
          const newFloatingCables = [...newNetwork.floatingCables];
          const cable = newFloatingCables[equipmentInfo.floatingCableIndex];
          const newCableIssues = removeIssue(cable.attachedIssues);
          const cableEnabled = newCableIssues.length === 0;
          
          newFloatingCables[equipmentInfo.floatingCableIndex] = {
            ...cable,
            attachedIssues: newCableIssues,
            isDisabled: !cableEnabled,
            computers: cable.computers.map(comp => ({
              ...comp,
              isDisabled: !cableEnabled || comp.attachedIssues.length > 0,
            })),
          };
          newNetwork = { ...newNetwork, floatingCables: newFloatingCables };
        } else if (equipmentInfo.type === 'computer' && equipmentInfo.floatingCableIndex !== undefined && equipmentInfo.computerIndex !== undefined) {
          // Resolution on computer attached to floating cable
          const newFloatingCables = [...newNetwork.floatingCables];
          const cable = newFloatingCables[equipmentInfo.floatingCableIndex];
          const newComputers = [...cable.computers];
          const newCompIssues = removeIssue(newComputers[equipmentInfo.computerIndex].attachedIssues);
          const canBeEnabled = newCompIssues.length === 0 && !cable.isDisabled;
          newComputers[equipmentInfo.computerIndex] = {
            ...newComputers[equipmentInfo.computerIndex],
            attachedIssues: newCompIssues,
            isDisabled: !canBeEnabled,
          };
          newFloatingCables[equipmentInfo.floatingCableIndex] = {
            ...cable,
            computers: newComputers,
          };
          newNetwork = { ...newNetwork, floatingCables: newFloatingCables };
        } else if (equipmentInfo.type === 'computer' && equipmentInfo.floatingComputerIndex !== undefined) {
          // Resolution on floating computer
          const newFloatingComputers = [...newNetwork.floatingComputers];
          const newCompIssues = removeIssue(newFloatingComputers[equipmentInfo.floatingComputerIndex].attachedIssues);
          newFloatingComputers[equipmentInfo.floatingComputerIndex] = {
            ...newFloatingComputers[equipmentInfo.floatingComputerIndex],
            attachedIssues: newCompIssues,
            isDisabled: newCompIssues.length > 0,
          };
          newNetwork = { ...newNetwork, floatingComputers: newFloatingComputers };
        }
      } else {
        // Handle connected equipment resolutions (original logic)
        // Apply resolution - CASCADING ENABLE
        // Resolving switch → enables switch + all cables + all computers (if they have no other issues)
        // Resolving cable → enables cable + all computers on it (if they have no other issues)
        // Resolving computer → enables only that computer
        const newSwitches = player.network.switches.map((sw, si) => {
          // Resolution on SWITCH - cascade enable to all cables and computers
          if (equipmentInfo.type === 'switch' && si === equipmentInfo.switchIndex) {
            const newSwitchIssues = removeIssue(sw.attachedIssues);
            const switchEnabled = newSwitchIssues.length === 0;
            
            return {
              ...sw,
              attachedIssues: newSwitchIssues,
              isDisabled: !switchEnabled,
              // Re-enable cables and computers if switch is now enabled
              cables: sw.cables.map(cable => ({
                ...cable,
                isDisabled: !switchEnabled || cable.attachedIssues.length > 0,
                computers: cable.computers.map(comp => ({
                  ...comp,
                  isDisabled: !switchEnabled || cable.attachedIssues.length > 0 || comp.attachedIssues.length > 0,
                })),
              })),
            };
          }
          
          return {
            ...sw,
            cables: sw.cables.map((cable, ci) => {
              // Resolution on CABLE - cascade enable to all computers on it
              if (equipmentInfo.type === 'cable' && si === equipmentInfo.switchIndex && ci === equipmentInfo.cableIndex) {
                const newCableIssues = removeIssue(cable.attachedIssues);
                const cableEnabled = newCableIssues.length === 0 && !sw.isDisabled;
                
                return {
                  ...cable,
                  attachedIssues: newCableIssues,
                  isDisabled: !cableEnabled,
                  // Re-enable computers if cable is now enabled
                  computers: cable.computers.map(comp => ({
                    ...comp,
                    isDisabled: !cableEnabled || comp.attachedIssues.length > 0,
                  })),
                };
              }
              
              return {
                ...cable,
                computers: cable.computers.map((comp, coi) => {
                  // Resolution on COMPUTER - only enable that computer
                  if (equipmentInfo.type === 'computer' && si === equipmentInfo.switchIndex && ci === equipmentInfo.cableIndex && coi === equipmentInfo.computerIndex) {
                    const newCompIssues = removeIssue(comp.attachedIssues);
                    // Computer can only be enabled if cable and switch are also enabled
                    const canBeEnabled = newCompIssues.length === 0 && !cable.isDisabled && !sw.isDisabled;
                    return { ...comp, attachedIssues: newCompIssues, isDisabled: !canBeEnabled };
                  }
                  return comp;
                }),
              };
            }),
          };
        });
        
        newNetwork = { ...newNetwork, switches: newSwitches };
      }
      
      player.network = newNetwork;
      newPlayers[prev.currentPlayerIndex] = player;
      
      const issueCount = isHelpdesk ? 'all issues' : 'issue';
      
      return {
        ...prev,
        players: newPlayers,
        discardPile: [...prev.discardPile, resolutionCard],
        movesRemaining: prev.movesRemaining - 1,
        gameLog: [...prev.gameLog.slice(-19), `🔧 ${resolutionCard.name} resolved ${issueCount} on ${equipmentInfo.type}!`],
      };
    });
    
    return true;
  }, [gameState, addLog, findEquipmentById]);

  // Play a Classification card (max 2 in play)
  // Head Hunter: Steals opponent's classification (can be blocked by opponent's Head Hunter)
  // Seal the Deal: Unblockable Head Hunter
  // Supervisor/Security Specialist/Facilities: Auto-resolves matching attacks on your network when played
  // discardClassificationId: If player has 2 classifications, they can optionally discard one to play the stolen card
  const playClassification = useCallback((cardId: string, targetClassificationId?: string, discardClassificationId?: string) => {
    if (!gameState) return false;
    
    const currentPlayerIndex = gameState.currentPlayerIndex;
    const opponentPlayerIndex = currentPlayerIndex === 0 ? 1 : 0;
    const currentPlayer = gameState.players[currentPlayerIndex];
    const opponent = gameState.players[opponentPlayerIndex];
    const classCard = currentPlayer.hand.find(c => c.id === cardId);
    
    if (!classCard || classCard.type !== 'classification') {
      addLog('Invalid classification card!');
      return false;
    }
    
    if (gameState.movesRemaining <= 0) {
      addLog('No moves remaining!');
      return false;
    }
    
    const isHeadHunter = classCard.subtype === 'head-hunter';
    const isSealTheDeal = classCard.subtype === 'seal-the-deal';
    
    // Head Hunter and Seal the Deal MUST target opponent's classification
    if (isHeadHunter || isSealTheDeal) {
      if (opponent.classificationCards.length === 0) {
        addLog("Opponent has no classifications to steal!");
        return false;
      }
      
      // Check if opponent has 2 of the same classification type - protected from stealing
      const opponentClassTypes = opponent.classificationCards.map(c => c.card.subtype);
      const hasDuplicateType = opponentClassTypes.some((type, i) => 
        opponentClassTypes.indexOf(type) !== i
      );
      if (hasDuplicateType) {
        addLog("Opponent's duplicate classifications are protected from stealing!");
        return false;
      }
      
      // For Head Hunter: check if opponent can block (has their own Head Hunter in HAND)
      if (isHeadHunter) {
        const opponentHeadHuntersInHand = countHeadHuntersInHand(opponent);
        
        // If opponent has Head Hunters in hand, start a Head Hunter battle
        if (opponentHeadHuntersInHand > 0) {
          // Get target classification (first one if not specified)
          const targetIndex = targetClassificationId 
            ? opponent.classificationCards.findIndex(c => c.id === targetClassificationId)
            : 0;
          
          if (targetIndex === -1 || opponent.classificationCards.length === 0) {
            addLog('No classification to steal!');
            return false;
          }
          
          const targetClassId = opponent.classificationCards[targetIndex].id;
          
          // Start Head Hunter battle
          setGameState(prev => {
            if (!prev) return prev;
            
            const newPlayers = [...prev.players];
            const player = { ...newPlayers[currentPlayerIndex] };
            
            // Remove the Head Hunter card from attacker's hand
            player.hand = player.hand.filter(c => c.id !== classCard.id);
            newPlayers[currentPlayerIndex] = player;
            
            const headHunterBattle: HeadHunterBattle = {
              attackerIndex: currentPlayerIndex,
              defenderIndex: opponentPlayerIndex,
              initialHeadHunterCardId: classCard.id,
              targetClassificationId: targetClassId,
              chain: [],
              previousPhase: prev.phase,
              previousMovesRemaining: prev.movesRemaining,
            };
            
            return {
              ...prev,
              players: newPlayers,
              phase: 'headhunter-battle',
              headHunterBattle,
              discardPile: [...prev.discardPile, classCard],
              gameLog: [...prev.gameLog.slice(-19), `🎯 ${currentPlayer.name} plays Head Hunter! ${opponent.name} can block...`],
            };
          });
          return true;
        }
      }
      
      // Steal a classification from opponent (Seal the Deal is unblockable)
      setGameState(prev => {
        if (!prev) return prev;
        
        const newPlayers = [...prev.players];
        const player = { ...newPlayers[currentPlayerIndex] };
        const opp = { ...newPlayers[opponentPlayerIndex] };
        
        // Remove the steal card from player's hand
        player.hand = player.hand.filter(c => c.id !== classCard.id);
        
        // Choose which classification to steal (first one if not specified)
        const targetIndex = targetClassificationId 
          ? opp.classificationCards.findIndex(c => c.id === targetClassificationId)
          : 0;
        
        if (targetIndex === -1 || opp.classificationCards.length === 0) {
          return {
            ...prev,
            gameLog: [...prev.gameLog.slice(-19), 'No classification to steal!'],
          };
        }
        
        const stolenCard = opp.classificationCards[targetIndex];
        
        // Remove the stolen classification from opponent
        opp.classificationCards = opp.classificationCards.filter((_, i) => i !== targetIndex);
        
        // Check if player already has 2 classifications
        if (player.classificationCards.length >= 2) {
          // Check if player wants to swap (discard one of their own)
          if (discardClassificationId) {
            // Find and remove the classification to discard
            const discardIndex = player.classificationCards.findIndex(c => c.id === discardClassificationId);
            if (discardIndex !== -1) {
              const discardedCard = player.classificationCards[discardIndex];
              player.classificationCards = player.classificationCards.filter((_, i) => i !== discardIndex);
              
              // Now add the stolen card
              player.classificationCards = [...player.classificationCards, stolenCard];
              
              // Check if this stolen classification auto-resolves any existing attacks
              const autoResolveType = getAutoResolveType(stolenCard.card.subtype);
              let resolvedCount = 0;
              let resolvedIssues: Card[] = [];
              
              if (autoResolveType) {
                // Resolve all matching attacks on player's network
                player.network = {
                  ...player.network,
                  switches: player.network.switches.map(sw => {
                    const swMatchingIssues = sw.attachedIssues.filter(i => i.subtype === autoResolveType);
                    resolvedCount += swMatchingIssues.length;
                    resolvedIssues.push(...swMatchingIssues);
                    const newSwIssues = sw.attachedIssues.filter(i => i.subtype !== autoResolveType);
                    const swEnabled = newSwIssues.length === 0;
                    
                    return {
                      ...sw,
                      attachedIssues: newSwIssues,
                      isDisabled: !swEnabled,
                      cables: sw.cables.map(cable => {
                        const cableMatchingIssues = cable.attachedIssues.filter(i => i.subtype === autoResolveType);
                        resolvedCount += cableMatchingIssues.length;
                        resolvedIssues.push(...cableMatchingIssues);
                        const newCableIssues = cable.attachedIssues.filter(i => i.subtype !== autoResolveType);
                        const cableEnabled = newCableIssues.length === 0 && swEnabled;
                        
                        return {
                          ...cable,
                          attachedIssues: newCableIssues,
                          isDisabled: !cableEnabled,
                          computers: cable.computers.map(comp => {
                            const compMatchingIssues = comp.attachedIssues.filter(i => i.subtype === autoResolveType);
                            resolvedCount += compMatchingIssues.length;
                            resolvedIssues.push(...compMatchingIssues);
                            const newCompIssues = comp.attachedIssues.filter(i => i.subtype !== autoResolveType);
                            const compEnabled = newCompIssues.length === 0 && cableEnabled;
                            
                            return {
                              ...comp,
                              attachedIssues: newCompIssues,
                              isDisabled: !compEnabled,
                            };
                          }),
                        };
                      }),
                    };
                  }),
                  floatingCables: player.network.floatingCables.map(cable => {
                    const cableMatchingIssues = cable.attachedIssues.filter(i => i.subtype === autoResolveType);
                    resolvedCount += cableMatchingIssues.length;
                    resolvedIssues.push(...cableMatchingIssues);
                    const newCableIssues = cable.attachedIssues.filter(i => i.subtype !== autoResolveType);
                    const cableEnabled = newCableIssues.length === 0;
                    
                    return {
                      ...cable,
                      attachedIssues: newCableIssues,
                      isDisabled: !cableEnabled,
                      computers: cable.computers.map(comp => {
                        const compMatchingIssues = comp.attachedIssues.filter(i => i.subtype === autoResolveType);
                        resolvedCount += compMatchingIssues.length;
                        resolvedIssues.push(...compMatchingIssues);
                        const newCompIssues = comp.attachedIssues.filter(i => i.subtype !== autoResolveType);
                        const compEnabled = newCompIssues.length === 0 && cableEnabled;
                        
                        return {
                          ...comp,
                          attachedIssues: newCompIssues,
                          isDisabled: !compEnabled,
                        };
                      }),
                    };
                  }),
                  floatingComputers: player.network.floatingComputers.map(comp => {
                    const compMatchingIssues = comp.attachedIssues.filter(i => i.subtype === autoResolveType);
                    resolvedCount += compMatchingIssues.length;
                    resolvedIssues.push(...compMatchingIssues);
                    const newCompIssues = comp.attachedIssues.filter(i => i.subtype !== autoResolveType);
                    
                    return {
                      ...comp,
                      attachedIssues: newCompIssues,
                      isDisabled: newCompIssues.length > 0,
                    };
                  }),
                };
              }
              
              newPlayers[currentPlayerIndex] = player;
              newPlayers[opponentPlayerIndex] = opp;
              
              const resolveMsg = resolvedCount > 0 ? ` Resolved ${resolvedCount} attack(s)!` : '';
              
              return {
                ...prev,
                players: newPlayers,
                discardPile: [...prev.discardPile, classCard, discardedCard.card, ...resolvedIssues],
                movesRemaining: prev.movesRemaining - 1,
                gameLog: [...prev.gameLog.slice(-19), `🎖️ ${isSealTheDeal ? 'Seal the Deal' : 'Head Hunter'}! Stole ${stolenCard.card.name}, discarded ${discardedCard.card.name}!${resolveMsg}`],
              };
            }
          }
          
          // No swap requested - stolen card goes to discard
          newPlayers[currentPlayerIndex] = player;
          newPlayers[opponentPlayerIndex] = opp;
          
          return {
            ...prev,
            players: newPlayers,
            discardPile: [...prev.discardPile, classCard, stolenCard.card],
            movesRemaining: prev.movesRemaining - 1,
            gameLog: [...prev.gameLog.slice(-19), `🎖️ ${isSealTheDeal ? 'Seal the Deal' : 'Head Hunter'}! Stole ${stolenCard.card.name} (discarded - already at max)`],
          };
        }
        
        // Add stolen classification to player
        player.classificationCards = [...player.classificationCards, stolenCard];
        
        // Check if this stolen classification auto-resolves any existing attacks
        const autoResolveType = getAutoResolveType(stolenCard.card.subtype);
        let resolvedCount = 0;
        let resolvedIssues: Card[] = [];
        
        if (autoResolveType) {
          // Resolve all matching attacks on player's network (connected equipment)
          player.network = {
            ...player.network,
            switches: player.network.switches.map(sw => {
              const swMatchingIssues = sw.attachedIssues.filter(i => i.subtype === autoResolveType);
              resolvedCount += swMatchingIssues.length;
              resolvedIssues.push(...swMatchingIssues);
              const newSwIssues = sw.attachedIssues.filter(i => i.subtype !== autoResolveType);
              const swEnabled = newSwIssues.length === 0;
              
              return {
                ...sw,
                attachedIssues: newSwIssues,
                isDisabled: !swEnabled,
                cables: sw.cables.map(cable => {
                  const cableMatchingIssues = cable.attachedIssues.filter(i => i.subtype === autoResolveType);
                  resolvedCount += cableMatchingIssues.length;
                  resolvedIssues.push(...cableMatchingIssues);
                  const newCableIssues = cable.attachedIssues.filter(i => i.subtype !== autoResolveType);
                  const cableEnabled = newCableIssues.length === 0 && swEnabled;
                  
                  return {
                    ...cable,
                    attachedIssues: newCableIssues,
                    isDisabled: !cableEnabled,
                    computers: cable.computers.map(comp => {
                      const compMatchingIssues = comp.attachedIssues.filter(i => i.subtype === autoResolveType);
                      resolvedCount += compMatchingIssues.length;
                      resolvedIssues.push(...compMatchingIssues);
                      const newCompIssues = comp.attachedIssues.filter(i => i.subtype !== autoResolveType);
                      const compEnabled = newCompIssues.length === 0 && cableEnabled;
                      
                      return {
                        ...comp,
                        attachedIssues: newCompIssues,
                        isDisabled: !compEnabled,
                      };
                    }),
                  };
                }),
              };
            }),
            // Also resolve on floating cables and their computers
            floatingCables: player.network.floatingCables.map(cable => {
              const cableMatchingIssues = cable.attachedIssues.filter(i => i.subtype === autoResolveType);
              resolvedCount += cableMatchingIssues.length;
              resolvedIssues.push(...cableMatchingIssues);
              const newCableIssues = cable.attachedIssues.filter(i => i.subtype !== autoResolveType);
              const cableEnabled = newCableIssues.length === 0;
              
              return {
                ...cable,
                attachedIssues: newCableIssues,
                isDisabled: !cableEnabled,
                computers: cable.computers.map(comp => {
                  const compMatchingIssues = comp.attachedIssues.filter(i => i.subtype === autoResolveType);
                  resolvedCount += compMatchingIssues.length;
                  resolvedIssues.push(...compMatchingIssues);
                  const newCompIssues = comp.attachedIssues.filter(i => i.subtype !== autoResolveType);
                  const compEnabled = newCompIssues.length === 0 && cableEnabled;
                  
                  return {
                    ...comp,
                    attachedIssues: newCompIssues,
                    isDisabled: !compEnabled,
                  };
                }),
              };
            }),
            // Also resolve on floating computers
            floatingComputers: player.network.floatingComputers.map(comp => {
              const compMatchingIssues = comp.attachedIssues.filter(i => i.subtype === autoResolveType);
              resolvedCount += compMatchingIssues.length;
              resolvedIssues.push(...compMatchingIssues);
              const newCompIssues = comp.attachedIssues.filter(i => i.subtype !== autoResolveType);
              
              return {
                ...comp,
                attachedIssues: newCompIssues,
                isDisabled: newCompIssues.length > 0,
              };
            }),
          };
        }
        
        newPlayers[currentPlayerIndex] = player;
        newPlayers[opponentPlayerIndex] = opp;
        
        const resolveMsg = resolvedCount > 0 ? ` Resolved ${resolvedCount} existing attack(s)!` : '';
        
        return {
          ...prev,
          players: newPlayers,
          discardPile: [...prev.discardPile, classCard, ...resolvedIssues],
          movesRemaining: prev.movesRemaining - 1,
          gameLog: [...prev.gameLog.slice(-19), `${isSealTheDeal ? '💎 Seal the Deal! UNBLOCKABLE -' : '🎖️ Head Hunter!'} Stole ${stolenCard.card.name}!${resolveMsg}`],
        };
      });
      
      return true;
    }
    
    // Regular classification cards (Field Tech, Supervisor, Security Specialist, Facilities)
    // Check if player already has 2 classification cards
    if (currentPlayer.classificationCards.length >= 2) {
      // If discardClassificationId is provided, we can replace
      if (!discardClassificationId) {
        addLog('Maximum 2 classification cards in play!');
        return false;
      }
    }
    
    // Duplicates ARE allowed - having 2 of the same type provides steal protection
    
    setGameState(prev => {
      if (!prev) return prev;
      
      const newPlayers = [...prev.players];
      const player = { ...newPlayers[prev.currentPlayerIndex] };
      
      // Remove card from hand
      player.hand = player.hand.filter(c => c.id !== classCard.id);
      
      // If replacing an existing classification, discard it first
      let discardedCard: PlacedCard | null = null;
      if (discardClassificationId && player.classificationCards.length >= 2) {
        const discardIndex = player.classificationCards.findIndex(c => c.id === discardClassificationId);
        if (discardIndex !== -1) {
          discardedCard = player.classificationCards[discardIndex];
          player.classificationCards = player.classificationCards.filter((_, i) => i !== discardIndex);
        }
      }
      
      // Add to classification cards
      const newClassCard: PlacedCard = {
        card: classCard,
        id: generatePlacementId(),
        attachedIssues: [],
        isDisabled: false,
      };
      player.classificationCards = [...player.classificationCards, newClassCard];
      
      // Check if this classification auto-resolves any existing attacks
      const autoResolveType = getAutoResolveType(classCard.subtype);
      let resolvedCount = 0;
      let resolvedIssues: Card[] = [];
      
      if (autoResolveType) {
        // Resolve all matching attacks on player's network (connected and floating)
        player.network = {
          ...player.network,
          switches: player.network.switches.map(sw => {
            // Check switch issues
            const swMatchingIssues = sw.attachedIssues.filter(i => i.subtype === autoResolveType);
            resolvedCount += swMatchingIssues.length;
            resolvedIssues.push(...swMatchingIssues);
            const newSwIssues = sw.attachedIssues.filter(i => i.subtype !== autoResolveType);
            const swEnabled = newSwIssues.length === 0;
            
            return {
              ...sw,
              attachedIssues: newSwIssues,
              isDisabled: !swEnabled,
              cables: sw.cables.map(cable => {
                const cableMatchingIssues = cable.attachedIssues.filter(i => i.subtype === autoResolveType);
                resolvedCount += cableMatchingIssues.length;
                resolvedIssues.push(...cableMatchingIssues);
                const newCableIssues = cable.attachedIssues.filter(i => i.subtype !== autoResolveType);
                const cableEnabled = newCableIssues.length === 0 && swEnabled;
                
                return {
                  ...cable,
                  attachedIssues: newCableIssues,
                  isDisabled: !cableEnabled,
                  computers: cable.computers.map(comp => {
                    const compMatchingIssues = comp.attachedIssues.filter(i => i.subtype === autoResolveType);
                    resolvedCount += compMatchingIssues.length;
                    resolvedIssues.push(...compMatchingIssues);
                    const newCompIssues = comp.attachedIssues.filter(i => i.subtype !== autoResolveType);
                    const compEnabled = newCompIssues.length === 0 && cableEnabled;
                    
                    return {
                      ...comp,
                      attachedIssues: newCompIssues,
                      isDisabled: !compEnabled,
                    };
                  }),
                };
              }),
            };
          }),
          // Also resolve on floating cables and their computers
          floatingCables: player.network.floatingCables.map(cable => {
            const cableMatchingIssues = cable.attachedIssues.filter(i => i.subtype === autoResolveType);
            resolvedCount += cableMatchingIssues.length;
            resolvedIssues.push(...cableMatchingIssues);
            const newCableIssues = cable.attachedIssues.filter(i => i.subtype !== autoResolveType);
            const cableEnabled = newCableIssues.length === 0;
            
            return {
              ...cable,
              attachedIssues: newCableIssues,
              isDisabled: !cableEnabled,
              computers: cable.computers.map(comp => {
                const compMatchingIssues = comp.attachedIssues.filter(i => i.subtype === autoResolveType);
                resolvedCount += compMatchingIssues.length;
                resolvedIssues.push(...compMatchingIssues);
                const newCompIssues = comp.attachedIssues.filter(i => i.subtype !== autoResolveType);
                const compEnabled = newCompIssues.length === 0 && cableEnabled;
                
                return {
                  ...comp,
                  attachedIssues: newCompIssues,
                  isDisabled: !compEnabled,
                };
              }),
            };
          }),
          // Also resolve on floating computers
          floatingComputers: player.network.floatingComputers.map(comp => {
            const compMatchingIssues = comp.attachedIssues.filter(i => i.subtype === autoResolveType);
            resolvedCount += compMatchingIssues.length;
            resolvedIssues.push(...compMatchingIssues);
            const newCompIssues = comp.attachedIssues.filter(i => i.subtype !== autoResolveType);
            
            return {
              ...comp,
              attachedIssues: newCompIssues,
              isDisabled: newCompIssues.length > 0,
            };
          }),
        };
      }
      
      newPlayers[prev.currentPlayerIndex] = player;
      
      // Describe the ability
      const abilities: Record<string, string> = {
        'security-specialist': 'Auto-resolves Hacked attacks',
        'facilities': 'Auto-resolves Power Outage attacks',
        'supervisor': 'Auto-resolves New Hire attacks',
        'field-tech': '+1 move per turn',
      };
      
      const resolveMsg = resolvedCount > 0 ? ` Resolved ${resolvedCount} existing attack(s)!` : '';
      const replaceMsg = discardedCard ? ` (replaced ${discardedCard.card.name})` : '';
      
      return {
        ...prev,
        players: newPlayers,
        discardPile: [...prev.discardPile, ...resolvedIssues, ...(discardedCard ? [discardedCard.card] : [])],
        movesRemaining: prev.movesRemaining - 1,
        gameLog: [...prev.gameLog.slice(-19), `🎖️ ${classCard.name} played!${replaceMsg} ${abilities[classCard.subtype] || ''}${resolveMsg}`],
      };
    });
    
    return true;
  }, [gameState, addLog]);

  // Draw cards up to max hand size
  const drawCards = useCallback(() => {
    if (!gameState) return;
    
    setGameState(prev => {
      if (!prev) return prev;
      
      const newPlayers = [...prev.players];
      const currentPlayer = { ...newPlayers[prev.currentPlayerIndex] };
      
      const cardsToDraw = Math.max(0, MAX_HAND_SIZE - currentPlayer.hand.length);
      if (cardsToDraw === 0) {
        return {
          ...prev,
          gameLog: [...prev.gameLog.slice(-19), 'Hand is already full!'],
        };
      }
      
      let newDrawPile = [...prev.drawPile];
      let newDiscardPile = [...prev.discardPile];
      
      // Reshuffle if needed
      if (newDrawPile.length < cardsToDraw) {
        newDrawPile = [...newDrawPile, ...shuffleDeck(newDiscardPile)];
        newDiscardPile = [];
      }
      
      const drawnCards = newDrawPile.slice(0, cardsToDraw);
      newDrawPile = newDrawPile.slice(cardsToDraw);
      
      currentPlayer.hand = [...currentPlayer.hand, ...drawnCards];
      newPlayers[prev.currentPlayerIndex] = currentPlayer;
      
      return {
        ...prev,
        players: newPlayers,
        drawPile: newDrawPile,
        discardPile: newDiscardPile,
        gameLog: [...prev.gameLog.slice(-19), `Drew ${drawnCards.length} card(s)`],
      };
    });
  }, [gameState]);

  // End current phase and move to next
  const endPhase = useCallback(() => {
    if (!gameState) return;
    
    setGameState(prev => {
      if (!prev) return prev;
      
      // If in moves phase, go straight to end of turn (draw, score, next player)
      if (prev.phase === 'moves') {
        const currentPlayer = prev.players[prev.currentPlayerIndex];
        
        // 1. Draw cards to refill hand
        let baseDraw = Math.max(0, MAX_HAND_SIZE - currentPlayer.hand.length);
        const cardsToDraw = baseDraw;
        
        let newDrawPile = [...prev.drawPile];
        let newDiscardPile = [...prev.discardPile];
        
        if (newDrawPile.length < cardsToDraw) {
          newDrawPile = [...newDrawPile, ...shuffleDeck(newDiscardPile)];
          newDiscardPile = [];
        }
        
        const drawnCards = newDrawPile.slice(0, cardsToDraw);
        newDrawPile = newDrawPile.slice(cardsToDraw);
        
        // 2. Score connected computers
        const connectedComputers = countConnectedComputers(currentPlayer.network);
        const scoreGained = connectedComputers;
        const newScore = currentPlayer.score + scoreGained;
        
        // Build score log message
        const scoreLog = `Scored ${scoreGained} bitcoin (Total: ${newScore})`;
        
        // Build draw log message
        const drawLog = cardsToDraw > 0 ? `Drew ${cardsToDraw} card(s)` : '';
        
        // Update player with drawn cards and new score
        const newPlayers = [...prev.players];
        newPlayers[prev.currentPlayerIndex] = {
          ...currentPlayer,
          hand: [...currentPlayer.hand, ...drawnCards],
          score: newScore,
        };
        
        // 3. Check for winner
        if (newScore >= WINNING_SCORE) {
          return {
            ...prev,
            players: newPlayers,
            drawPile: newDrawPile,
            discardPile: newDiscardPile,
            phase: 'game-over',
            winner: newPlayers[prev.currentPlayerIndex],
            gameLog: [
              ...prev.gameLog.slice(-19),
              drawLog,
              scoreLog,
              `🎉 ${currentPlayer.name} wins with ${newScore} bitcoin!`,
            ].filter(Boolean),
          };
        }
        
        // 4. Move to next player's turn
        const nextPlayerIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
        const nextPlayer = prev.players[nextPlayerIndex];
        
        return {
          ...prev,
          players: newPlayers,
          drawPile: newDrawPile,
          discardPile: newDiscardPile,
          currentPlayerIndex: nextPlayerIndex,
          phase: 'moves',
          movesRemaining: getBaseMovesForPlayer(),
          equipmentMovesRemaining: hasFieldTech(nextPlayer) ? 1 : 0,
          turnNumber: prev.turnNumber + 1,
          gameLog: [
            ...prev.gameLog.slice(-19),
            drawLog,
            scoreLog,
            `--- ${nextPlayer.name}'s Turn ---`,
          ].filter(Boolean),
        };
      }
      
      // Handle discard phase (if manually entered)
      if (prev.phase === 'discard') {
        return {
          ...prev,
          phase: 'moves',
          gameLog: [...prev.gameLog.slice(-19), 'Discard phase ended'],
        };
      }
      
      return prev;
    });
  }, [gameState, countConnectedComputers]);

  // AI turn with modular decision engine
  const executeAITurn = useCallback(async () => {
    if (!gameState) return;
    
    const aiPlayerIndex = gameState.currentPlayerIndex;
    const humanPlayerIndex = aiPlayerIndex === 0 ? 1 : 0;
    const player = gameState.players[aiPlayerIndex];
    if (player.isHuman) return;
    
    // Get AI decisions using the decision engine
    const { action: bestAction, allActions } = makeAIDecision(gameState, aiDifficulty);
    
    // Store debug info
    setAIDebugInfo({
      topActions: allActions.slice(0, 5),
      reasoning: allActions.slice(0, 3).map(a => `${a.type}: ${a.reasoning} (${a.utility.toFixed(1)})`),
    });
    
    setGameState(prev => {
      if (!prev) return prev;
      
      // Deep clone the state to work with
      let newPlayers = prev.players.map(p => ({
        ...p,
        hand: [...p.hand],
        classificationCards: p.classificationCards.map(c => ({ ...c })),
        network: {
          ...p.network,
          switches: p.network.switches.map(sw => ({
            ...sw,
            attachedIssues: [...sw.attachedIssues],
            cables: sw.cables.map(c => ({
              ...c,
              attachedIssues: [...c.attachedIssues],
              computers: c.computers.map(comp => ({
                ...comp,
                attachedIssues: [...comp.attachedIssues],
              })),
            })),
          })),
          floatingCables: p.network.floatingCables.map(fc => ({
            ...fc,
            attachedIssues: [...fc.attachedIssues],
            computers: fc.computers.map(c => ({ ...c, attachedIssues: [...c.attachedIssues] })),
          })),
          floatingComputers: p.network.floatingComputers.map(c => ({ ...c, attachedIssues: [...c.attachedIssues] })),
        },
      }));
      
      let gameLog = [...prev.gameLog];
      let newDiscardPile = [...prev.discardPile];
      let newDrawPile = [...prev.drawPile];
      const maxMoves = getBaseMovesForPlayer() + (hasFieldTech(newPlayers[aiPlayerIndex]) ? 1 : 0);
      let movesRemaining = maxMoves;
      let equipmentMovesRemaining = hasFieldTech(newPlayers[aiPlayerIndex]) ? 1 : 0;
      let movesUsed = 0;
      const aiActions: AIAction[] = [];
      
      // Helper functions for AI actions (same as before)
      const findAttackTarget = (humanNetwork: PlayerNetwork): { type: 'switch' | 'cable' | 'computer', switchIndex: number, cableIndex?: number, computerIndex?: number, equipmentId: string } | null => {
        for (let si = 0; si < humanNetwork.switches.length; si++) {
          if (!humanNetwork.switches[si].isDisabled) {
            return { type: 'switch', switchIndex: si, equipmentId: humanNetwork.switches[si].id };
          }
        }
        for (let si = 0; si < humanNetwork.switches.length; si++) {
          for (let ci = 0; ci < humanNetwork.switches[si].cables.length; ci++) {
            if (!humanNetwork.switches[si].cables[ci].isDisabled) {
              return { type: 'cable', switchIndex: si, cableIndex: ci, equipmentId: humanNetwork.switches[si].cables[ci].id };
            }
          }
        }
        for (let si = 0; si < humanNetwork.switches.length; si++) {
          for (let ci = 0; ci < humanNetwork.switches[si].cables.length; ci++) {
            for (let coi = 0; coi < humanNetwork.switches[si].cables[ci].computers.length; coi++) {
              if (!humanNetwork.switches[si].cables[ci].computers[coi].isDisabled) {
                return { type: 'computer', switchIndex: si, cableIndex: ci, computerIndex: coi, equipmentId: humanNetwork.switches[si].cables[ci].computers[coi].id };
              }
            }
          }
        }
        return null;
      };
      
      const findResolutionTarget = (aiNetwork: PlayerNetwork, resolutionSubtype: string): { type: 'switch' | 'cable' | 'computer', switchIndex: number, cableIndex?: number, computerIndex?: number, equipmentId: string } | null => {
        const resolutionMap: Record<string, string> = {
          'secured': 'hacked',
          'powered': 'power-outage',
          'trained': 'new-hire',
          'helpdesk': 'any',
        };
        const targetIssueType = resolutionMap[resolutionSubtype];
        
        for (let si = 0; si < aiNetwork.switches.length; si++) {
          const sw = aiNetwork.switches[si];
          if (sw.attachedIssues.length > 0) {
            if (targetIssueType === 'any' || sw.attachedIssues.some(i => i.subtype === targetIssueType)) {
              return { type: 'switch', switchIndex: si, equipmentId: sw.id };
            }
          }
          for (let ci = 0; ci < sw.cables.length; ci++) {
            const cable = sw.cables[ci];
            if (cable.attachedIssues.length > 0) {
              if (targetIssueType === 'any' || cable.attachedIssues.some(i => i.subtype === targetIssueType)) {
                return { type: 'cable', switchIndex: si, cableIndex: ci, equipmentId: cable.id };
              }
            }
            for (let coi = 0; coi < cable.computers.length; coi++) {
              const comp = cable.computers[coi];
              if (comp.attachedIssues.length > 0) {
                if (targetIssueType === 'any' || comp.attachedIssues.some(i => i.subtype === targetIssueType)) {
                  return { type: 'computer', switchIndex: si, cableIndex: ci, computerIndex: coi, equipmentId: comp.id };
                }
              }
            }
          }
        }
        return null;
      };
      
      const applyAttack = (targetNetwork: PlayerNetwork, target: { type: string, switchIndex: number, cableIndex?: number, computerIndex?: number }, attackCard: Card) => {
        if (target.type === 'switch') {
          const sw = targetNetwork.switches[target.switchIndex];
          sw.attachedIssues.push(attackCard);
          sw.isDisabled = true;
          sw.cables.forEach(cable => {
            cable.isDisabled = true;
            cable.computers.forEach(comp => comp.isDisabled = true);
          });
        } else if (target.type === 'cable' && target.cableIndex !== undefined) {
          const cable = targetNetwork.switches[target.switchIndex].cables[target.cableIndex];
          cable.attachedIssues.push(attackCard);
          cable.isDisabled = true;
          cable.computers.forEach(comp => comp.isDisabled = true);
        } else if (target.type === 'computer' && target.cableIndex !== undefined && target.computerIndex !== undefined) {
          const comp = targetNetwork.switches[target.switchIndex].cables[target.cableIndex].computers[target.computerIndex];
          comp.attachedIssues.push(attackCard);
          comp.isDisabled = true;
        }
      };
      
      const applyResolution = (aiNetwork: PlayerNetwork, target: { type: string, switchIndex: number, cableIndex?: number, computerIndex?: number }, resolutionCard: Card, isHelpdesk: boolean) => {
        const targetIssueType = isHelpdesk ? null : ({
          'secured': 'hacked',
          'powered': 'power-outage',
          'trained': 'new-hire',
        } as Record<string, string>)[resolutionCard.subtype];
        
        const removeIssue = (issues: Card[]): Card[] => {
          if (isHelpdesk) return [];
          let removed = false;
          return issues.filter(i => {
            if (!removed && i.subtype === targetIssueType) {
              removed = true;
              return false;
            }
            return true;
          });
        };
        
        if (target.type === 'switch') {
          const sw = aiNetwork.switches[target.switchIndex];
          sw.attachedIssues = removeIssue(sw.attachedIssues);
          sw.isDisabled = sw.attachedIssues.length > 0;
          if (!sw.isDisabled) {
            sw.cables.forEach(cable => {
              cable.isDisabled = cable.attachedIssues.length > 0;
              if (!cable.isDisabled) {
                cable.computers.forEach(comp => {
                  comp.isDisabled = comp.attachedIssues.length > 0;
                });
              }
            });
          }
        } else if (target.type === 'cable' && target.cableIndex !== undefined) {
          const sw = aiNetwork.switches[target.switchIndex];
          const cable = sw.cables[target.cableIndex];
          cable.attachedIssues = removeIssue(cable.attachedIssues);
          cable.isDisabled = cable.attachedIssues.length > 0 || sw.isDisabled;
          if (!cable.isDisabled) {
            cable.computers.forEach(comp => {
              comp.isDisabled = comp.attachedIssues.length > 0;
            });
          }
        } else if (target.type === 'computer' && target.cableIndex !== undefined && target.computerIndex !== undefined) {
          const sw = aiNetwork.switches[target.switchIndex];
          const cable = sw.cables[target.cableIndex];
          const comp = cable.computers[target.computerIndex];
          comp.attachedIssues = removeIssue(comp.attachedIssues);
          comp.isDisabled = comp.attachedIssues.length > 0 || cable.isDisabled || sw.isDisabled;
        }
      };
      
      // Execute AI moves based on decision engine recommendations
      // Track failed actions to avoid infinite loops and enable fallback
      const failedActionTypes = new Set<string>();
      let consecutiveFailures = 0;
      const MAX_CONSECUTIVE_FAILURES = 10;
      const MAX_FAILED_ACTION_TYPES = 5;
      
      while (movesUsed < maxMoves && movesRemaining > 0) {
        const currentPlayer = newPlayers[aiPlayerIndex];
        const humanPlayer = newPlayers[humanPlayerIndex];
        const hand = currentPlayer.hand;
        const network = currentPlayer.network;
        
        // Safety check: too many consecutive failures = end turn
        if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
          console.log('[AI] Too many consecutive failures, forcing end of turn');
          break;
        }
        
        // Get next best action from decision engine
        const tempState: GameState = {
          ...prev,
          players: newPlayers,
          movesRemaining,
          discardPile: newDiscardPile,
          drawPile: newDrawPile,
        };
        
        const { action } = makeAIDecision(tempState, aiDifficulty);
        
        // If decision engine returns nothing, try fallback discard
        if (!action) {
          console.log('[AI] No action returned. Hand:', currentPlayer.hand.map(c => c.name));
          console.log('[AI] Network - Switches:', network.switches.length, 'Floating cables:', network.floatingCables.length, 'Floating computers:', network.floatingComputers.length);
          
          // Force discard if we have cards
          if (currentPlayer.hand.length > 0) {
            const discardCard = currentPlayer.hand[0];
            currentPlayer.hand = currentPlayer.hand.filter(c => c.id !== discardCard.id);
            newDiscardPile.push(discardCard);
            aiActions.push({ type: 'discard', card: discardCard });
            gameLog = [...gameLog.slice(-19), `🗑️ ${currentPlayer.name} discarded ${discardCard.name} (no valid actions)`];
            movesUsed++;
            movesRemaining--;
            continue;
          }
          break;
        }
        
        // Allow discards even when utility is very low (discard is the fallback to avoid AI freezing).
        if (action.utility <= -10 && action.type !== 'discard') {
          // Check if we should force a fallback discard instead of ending
          if (failedActionTypes.size >= MAX_FAILED_ACTION_TYPES && currentPlayer.hand.length > 0) {
            const discardCard = currentPlayer.hand[0];
            currentPlayer.hand = currentPlayer.hand.filter(c => c.id !== discardCard.id);
            newDiscardPile.push(discardCard);
            aiActions.push({ type: 'discard', card: discardCard });
            gameLog = [...gameLog.slice(-19), `🗑️ ${currentPlayer.name} discarded ${discardCard.name} (fallback action)`];
            movesUsed++;
            movesRemaining--;
            failedActionTypes.clear();
            consecutiveFailures = 0;
            continue;
          }
          break; // No valuable non-discard actions
        }
        
        let playedCard = false;
        const card = action.card;
        
        // Execute the action based on type
        switch (action.type) {
          case 'play_resolution':
            if (card && card.type === 'resolution') {
              const target = findResolutionTarget(network, card.subtype);
              if (target) {
                const isHelpdesk = card.subtype === 'helpdesk';
                let issueBeingFixed = '';
                if (target.type === 'switch') {
                  issueBeingFixed = network.switches[target.switchIndex].attachedIssues[0]?.name || 'issue';
                } else if (target.type === 'cable' && target.cableIndex !== undefined) {
                  issueBeingFixed = network.switches[target.switchIndex].cables[target.cableIndex].attachedIssues[0]?.name || 'issue';
                } else if (target.type === 'computer' && target.cableIndex !== undefined && target.computerIndex !== undefined) {
                  issueBeingFixed = network.switches[target.switchIndex].cables[target.cableIndex].computers[target.computerIndex].attachedIssues[0]?.name || 'issue';
                }
                
                applyResolution(network, target, card, isHelpdesk);
                currentPlayer.hand = hand.filter(c => c.id !== card.id);
                playedCard = true;
                aiActions.push({ type: 'resolve', card, target: `${issueBeingFixed} on ${target.type}` });
                gameLog = [...gameLog.slice(-19), `🔧 ${currentPlayer.name} used ${card.name} to fix ${issueBeingFixed} on ${target.type}!`];
              }
            }
            break;
          
          case 'play_classification':
            if (card && card.type === 'classification' && currentPlayer.classificationCards.length < 2) {
              const hasSameType = currentPlayer.classificationCards.some(c => c.card.subtype === card.subtype);
              if (!hasSameType) {
                const newClassification: PlacedCard = {
                  card,
                  id: generatePlacementId(),
                  attachedIssues: [],
                  isDisabled: false,
                };
                
                currentPlayer.hand = hand.filter(c => c.id !== card.id);
                currentPlayer.classificationCards.push(newClassification);
                
                // Auto-resolve matching attacks
                const autoResolveType = getAutoResolveType(card.subtype);
                let resolvedCount = 0;
                
                if (autoResolveType) {
                  currentPlayer.network.switches.forEach(sw => {
                    const swMatchingIssues = sw.attachedIssues.filter(i => i.subtype === autoResolveType);
                    resolvedCount += swMatchingIssues.length;
                    newDiscardPile.push(...swMatchingIssues);
                    sw.attachedIssues = sw.attachedIssues.filter(i => i.subtype !== autoResolveType);
                    sw.isDisabled = sw.attachedIssues.length > 0;
                    
                    sw.cables.forEach(cable => {
                      const cableMatchingIssues = cable.attachedIssues.filter(i => i.subtype === autoResolveType);
                      resolvedCount += cableMatchingIssues.length;
                      newDiscardPile.push(...cableMatchingIssues);
                      cable.attachedIssues = cable.attachedIssues.filter(i => i.subtype !== autoResolveType);
                      cable.isDisabled = cable.attachedIssues.length > 0 || sw.isDisabled;
                      
                      cable.computers.forEach(comp => {
                        const compMatchingIssues = comp.attachedIssues.filter(i => i.subtype === autoResolveType);
                        resolvedCount += compMatchingIssues.length;
                        newDiscardPile.push(...compMatchingIssues);
                        comp.attachedIssues = comp.attachedIssues.filter(i => i.subtype !== autoResolveType);
                        comp.isDisabled = comp.attachedIssues.length > 0 || cable.isDisabled;
                      });
                    });
                  });
                }
                
                playedCard = true;
                aiActions.push({ type: 'classification', card });
                if (resolvedCount > 0) {
                  gameLog = [...gameLog.slice(-19), `🎖️ ${currentPlayer.name} activated ${card.name} - resolved ${resolvedCount} issue(s)!`];
                } else {
                  gameLog = [...gameLog.slice(-19), `🎖️ ${currentPlayer.name} activated ${card.name}!`];
                }
              }
            }
            break;
          
          case 'steal_classification':
            if (card && (card.subtype === 'head-hunter' || card.subtype === 'seal-the-deal')) {
              const isSealTheDealCard = card.subtype === 'seal-the-deal';
              
              // Check if opponent has duplicate protection
              const opponentClassTypes = humanPlayer.classificationCards.map(c => c.card.subtype);
              const hasDuplicateType = opponentClassTypes.some((type, i) => 
                opponentClassTypes.indexOf(type) !== i
              );
              
              if (hasDuplicateType) {
                // Can't steal - opponent is protected
                gameLog = [...gameLog.slice(-19), `❌ ${currentPlayer.name} tried to steal but opponent's duplicate classifications are protected!`];
                break;
              }
              
              if (humanPlayer.classificationCards.length > 0) {
                const targetClass = humanPlayer.classificationCards.find(c => 
                  !currentPlayer.classificationCards.some(ours => ours.card.subtype === c.card.subtype)
                ) || humanPlayer.classificationCards[0];
                
                if (targetClass) {
                  currentPlayer.hand = hand.filter(c => c.id !== card.id);
                  humanPlayer.classificationCards = humanPlayer.classificationCards.filter(c => c.id !== targetClass.id);
                  
                  if (currentPlayer.classificationCards.length < 2) {
                    currentPlayer.classificationCards.push(targetClass);
                    aiActions.push({ type: 'steal', card, target: targetClass.card.name });
                    gameLog = [...gameLog.slice(-19), isSealTheDealCard 
                      ? `💎 Seal the Deal! UNBLOCKABLE - ${currentPlayer.name} steals ${targetClass.card.name}!`
                      : `🎖️ ${currentPlayer.name} used Head Hunter to steal ${targetClass.card.name}!`
                    ];
                  } else {
                    newDiscardPile.push(targetClass.card);
                    aiActions.push({ type: 'steal', card, target: `${targetClass.card.name} (discarded)` });
                    gameLog = [...gameLog.slice(-19), isSealTheDealCard
                      ? `💎 Seal the Deal! UNBLOCKABLE - ${targetClass.card.name} discarded!`
                      : `🎖️ ${currentPlayer.name} used Head Hunter - ${targetClass.card.name} discarded!`
                    ];
                  }
                  
                  newDiscardPile.push(card);
                  playedCard = true;
                }
              }
            }
            break;
          
          case 'play_switch':
            if (card && card.subtype === 'switch') {
              const newSwitch: SwitchNode = {
                card,
                id: generatePlacementId(),
                attachedIssues: [],
                isDisabled: false,
                cables: [],
              };
              
              currentPlayer.hand = hand.filter(c => c.id !== card.id);
              currentPlayer.network.switches.push(newSwitch);
              playedCard = true;
              aiActions.push({ type: 'play', card, target: 'network' });
              gameLog = [...gameLog.slice(-19), `🔌 ${currentPlayer.name} placed a Switch`];
            }
            break;
          
          case 'play_cable':
            if (card && (card.subtype === 'cable-2' || card.subtype === 'cable-3')) {
              const maxComputers = card.subtype === 'cable-3' ? 3 : 2;
              const newCable: CableNode = {
                card,
                id: generatePlacementId(),
                attachedIssues: [],
                isDisabled: false,
                maxComputers: maxComputers as 2 | 3,
                computers: [],
              };
              
              currentPlayer.hand = hand.filter(c => c.id !== card.id);
              
              // Find enabled switch to connect to
              const enabledSwitch = network.switches.find(sw => !sw.isDisabled);
              if (enabledSwitch) {
                const switchIndex = network.switches.findIndex(sw => sw.id === enabledSwitch.id);
                
                // AUTO-CONNECT floating computers to the new cable (FREE action)
                const floatingComputers = [...currentPlayer.network.floatingComputers];
                const computersToConnect = floatingComputers.slice(0, maxComputers);
                if (computersToConnect.length > 0) {
                  newCable.computers = computersToConnect;
                  currentPlayer.network.floatingComputers = floatingComputers.slice(maxComputers);
                  gameLog = [...gameLog.slice(-19), `🔗 ${currentPlayer.name} connected ${maxComputers}-Cable to Switch + auto-connected ${computersToConnect.length} computer(s) (FREE)`];
                } else {
                  gameLog = [...gameLog.slice(-19), `🔗 ${currentPlayer.name} connected ${maxComputers}-Cable to Switch`];
                }
                
                network.switches[switchIndex].cables.push(newCable);
                aiActions.push({ type: 'play', card, target: 'switch' });
              } else {
                // Floating cable - also auto-connect computers for future use
                const floatingComputers = [...currentPlayer.network.floatingComputers];
                const computersToConnect = floatingComputers.slice(0, maxComputers);
                if (computersToConnect.length > 0) {
                  (newCable as FloatingCable).computers = computersToConnect;
                  currentPlayer.network.floatingComputers = floatingComputers.slice(maxComputers);
                  gameLog = [...gameLog.slice(-19), `🔗 ${currentPlayer.name} placed floating ${maxComputers}-Cable + auto-connected ${computersToConnect.length} computer(s) (FREE)`];
                } else {
                  gameLog = [...gameLog.slice(-19), `🔗 ${currentPlayer.name} placed a floating ${maxComputers}-Cable`];
                }
                currentPlayer.network.floatingCables.push(newCable as FloatingCable);
                aiActions.push({ type: 'play', card, target: 'floating' });
              }
              playedCard = true;
            }
            break;
          
          case 'play_computer':
            if (card && card.subtype === 'computer') {
              const newComputer: PlacedCard = {
                card,
                id: generatePlacementId(),
                attachedIssues: [],
                isDisabled: false,
              };
              
              currentPlayer.hand = hand.filter(c => c.id !== card.id);
              
              // Find cable with space on enabled switch
              let placed = false;
              for (const sw of network.switches) {
                if (sw.isDisabled) continue;
                for (const cable of sw.cables) {
                  if (!cable.isDisabled && cable.computers.length < cable.maxComputers) {
                    cable.computers.push(newComputer);
                    placed = true;
                    aiActions.push({ type: 'play', card, target: 'cable' });
                    gameLog = [...gameLog.slice(-19), `💻 ${currentPlayer.name} connected Computer to Cable`];
                    break;
                  }
                }
                if (placed) break;
              }
              
              // Try floating cables
              if (!placed) {
                for (const floatingCable of currentPlayer.network.floatingCables) {
                  if (floatingCable.computers.length < floatingCable.maxComputers) {
                    floatingCable.computers.push(newComputer);
                    placed = true;
                    aiActions.push({ type: 'play', card, target: 'floating cable' });
                    gameLog = [...gameLog.slice(-19), `💻 ${currentPlayer.name} added Computer to floating Cable`];
                    break;
                  }
                }
              }
              
              // Floating computer
              if (!placed) {
                currentPlayer.network.floatingComputers.push(newComputer);
                aiActions.push({ type: 'play', card, target: 'floating' });
                gameLog = [...gameLog.slice(-19), `💻 ${currentPlayer.name} placed a floating Computer`];
              }
              playedCard = true;
            }
            break;
          
          case 'connect_cable_to_switch':
            if (currentPlayer.network.floatingCables.length > 0) {
              // Use sourceId if provided, otherwise fallback to first floating cable
              const floatingCable = action.sourceId 
                ? currentPlayer.network.floatingCables.find(c => c.id === action.sourceId)
                : currentPlayer.network.floatingCables[0];
              
              // Use targetId if provided, otherwise find first enabled switch
              const targetSwitch = action.targetId
                ? network.switches.find(sw => sw.id === action.targetId && !sw.isDisabled)
                : network.switches.find(sw => !sw.isDisabled);
              
              if (floatingCable && targetSwitch) {
                const switchIndex = network.switches.findIndex(sw => sw.id === targetSwitch.id);
                currentPlayer.network.floatingCables = currentPlayer.network.floatingCables.filter(c => c.id !== floatingCable.id);
                
                // Re-enable the cable and its computers since now connected to working switch
                floatingCable.isDisabled = targetSwitch.isDisabled;
                for (const comp of floatingCable.computers) {
                  if (comp.attachedIssues.length === 0) {
                    comp.isDisabled = floatingCable.isDisabled;
                  }
                }
                
                network.switches[switchIndex].cables.push(floatingCable);
                playedCard = true;
                const computersOnCable = floatingCable.computers.length;
                aiActions.push({ type: 'play', card: floatingCable.card, target: `connected to switch (${computersOnCable} computers now scoring)` });
                gameLog = [...gameLog.slice(-19), `🔗 ${currentPlayer.name} connected floating Cable with ${computersOnCable} computers to Switch`];
              }
            }
            break;
          
          case 'play_attack':
            if (card && card.type === 'attack' && card.subtype !== 'audit') {
              const target = findAttackTarget(humanPlayer.network);
              if (target) {
                // Check if blocked by classification
                const blockingClass = {
                  'hacked': 'security-specialist',
                  'power-outage': 'facilities',
                  'new-hire': 'supervisor',
                }[card.subtype as string];
                
                const isBlocked = blockingClass && humanPlayer.classificationCards.some(c => c.card.subtype === blockingClass);
                
                currentPlayer.hand = hand.filter(c => c.id !== card.id);
                
                if (isBlocked) {
                  newDiscardPile.push(card);
                  const blockerName = blockingClass === 'security-specialist' ? 'Security Specialist' : blockingClass === 'facilities' ? 'Facilities' : 'Supervisor';
                  aiActions.push({ type: 'attack', card, target: `your ${target.type}`, blocked: true });
                  gameLog = [...gameLog.slice(-19), `⚡ ${currentPlayer.name}'s ${card.name} was blocked by your ${blockerName}!`];
                } else {
                  applyAttack(humanPlayer.network, target, card);
                  aiActions.push({ type: 'attack', card, target: `your ${target.type}` });
                  gameLog = [...gameLog.slice(-19), `⚡ ${currentPlayer.name} attacked your ${target.type} with ${card.name}!`];
                }
                playedCard = true;
              }
            }
            break;
          
          case 'discard':
            if (card) {
              currentPlayer.hand = hand.filter(c => c.id !== card.id);
              newDiscardPile.push(card);
              aiActions.push({ type: 'discard', card });
              gameLog = [...gameLog.slice(-19), `🗑️ ${currentPlayer.name} discarded ${card.name}`];
              playedCard = true;
            }
            break;
          
          case 'move_cable_to_switch':
            // Move a cable from a disabled switch to an enabled switch
            if (action.sourceId && action.targetId) {
              let cableToMove: CableNode | null = null;
              let sourceSwitchIndex = -1;
              
              // Find the cable and its source switch
              for (let si = 0; si < network.switches.length; si++) {
                const sw = network.switches[si];
                const cableIndex = sw.cables.findIndex(c => c.id === action.sourceId);
                if (cableIndex !== -1) {
                  cableToMove = sw.cables[cableIndex];
                  sourceSwitchIndex = si;
                  // Remove from source
                  network.switches[si].cables.splice(cableIndex, 1);
                  break;
                }
              }
              
              if (cableToMove) {
                // Find target switch and add cable
                const targetSwitchIndex = network.switches.findIndex(sw => sw.id === action.targetId);
                if (targetSwitchIndex !== -1) {
                  // Re-enable the cable and its computers since they're on a working switch now
                  cableToMove.isDisabled = cableToMove.attachedIssues.length > 0;
                  cableToMove.computers.forEach(comp => {
                    comp.isDisabled = comp.attachedIssues.length > 0 || cableToMove!.isDisabled;
                  });
                  
                  network.switches[targetSwitchIndex].cables.push(cableToMove);
                  
                  const computersRecovered = cableToMove.computers.filter(c => !c.isDisabled).length;
                  aiActions.push({ type: 'play', card: cableToMove.card, target: 'rerouted to working switch' });
                  gameLog = [...gameLog.slice(-19), `🔀 ${currentPlayer.name} rerouted Cable with ${cableToMove.computers.length} computer(s) to a working Switch! (+${computersRecovered} bitcoin)`];
                  playedCard = true;
                }
              }
            }
            break;
          
          case 'move_computer_to_cable':
            // Move a computer from a disabled cable to an enabled cable
            if (action.sourceId && action.targetId) {
              let computerToMove: PlacedCard | null = null;
              
              // Find and remove the computer from its current cable
              for (const sw of network.switches) {
                for (const cable of sw.cables) {
                  const compIndex = cable.computers.findIndex(c => c.id === action.sourceId);
                  if (compIndex !== -1) {
                    computerToMove = cable.computers[compIndex];
                    cable.computers.splice(compIndex, 1);
                    break;
                  }
                }
                if (computerToMove) break;
              }
              
              if (computerToMove) {
                // Find target cable and add computer
                for (const sw of network.switches) {
                  if (sw.isDisabled) continue;
                  for (const cable of sw.cables) {
                    if (cable.id === action.targetId && cable.computers.length < cable.maxComputers) {
                      // Re-enable computer if cable is working
                      computerToMove.isDisabled = computerToMove.attachedIssues.length > 0 || cable.isDisabled || sw.isDisabled;
                      cable.computers.push(computerToMove);
                      
                      aiActions.push({ type: 'play', card: computerToMove.card, target: 'rerouted to working cable' });
                      gameLog = [...gameLog.slice(-19), `🔀 ${currentPlayer.name} moved Computer to a working Cable! (+1 bitcoin)`];
                      playedCard = true;
                      break;
                    }
                  }
                  if (playedCard) break;
                }
              }
            }
            break;
          
          case 'connect_floating_computer':
            // Connect a floating computer to a working cable
            if (action.sourceId && action.targetId) {
              const floatingCompIndex = network.floatingComputers.findIndex(c => c.id === action.sourceId);
              
              if (floatingCompIndex !== -1) {
                const floatingComp = network.floatingComputers[floatingCompIndex];
                
                // Find target cable
                for (const sw of network.switches) {
                  if (sw.isDisabled) continue;
                  for (const cable of sw.cables) {
                    if (cable.id === action.targetId && cable.computers.length < cable.maxComputers) {
                      // Remove from floating
                      network.floatingComputers.splice(floatingCompIndex, 1);
                      
                      // Add to cable and set enabled state
                      floatingComp.isDisabled = floatingComp.attachedIssues.length > 0 || cable.isDisabled || sw.isDisabled;
                      cable.computers.push(floatingComp);
                      
                      aiActions.push({ type: 'play', card: floatingComp.card, target: 'connected floating to cable' });
                      gameLog = [...gameLog.slice(-19), `🔗 ${currentPlayer.name} connected floating Computer to Cable! (+1 bitcoin)`];
                      playedCard = true;
                      break;
                    }
                  }
                  if (playedCard) break;
                }
              }
            }
            break;
          
          default:
            // No action or pass
            break;
        }
        
        if (playedCard) {
          movesUsed++;
          movesRemaining--;
          failedActionTypes.clear();
          consecutiveFailures = 0;
        } else {
          // Track failed action type to avoid retrying same action
          failedActionTypes.add(action.type);
          consecutiveFailures++;
          
          // If we've failed too many different action types, force discard
          if (failedActionTypes.size >= MAX_FAILED_ACTION_TYPES && currentPlayer.hand.length > 0) {
            // Find least valuable card to discard
            const cardPriority: Record<string, number> = {
              'attack': 1,
              'resolution': 2,
              'classification': 3,
              'equipment': 4,
            };
            const sortedHand = [...currentPlayer.hand].sort((a, b) => {
              const priorityA = cardPriority[a.type] || 5;
              const priorityB = cardPriority[b.type] || 5;
              return priorityA - priorityB;
            });
            
            const discardCard = sortedHand[0];
            currentPlayer.hand = currentPlayer.hand.filter(c => c.id !== discardCard.id);
            newDiscardPile.push(discardCard);
            aiActions.push({ type: 'discard', card: discardCard });
            gameLog = [...gameLog.slice(-19), `🗑️ ${currentPlayer.name} discarded ${discardCard.name} (no valid actions)`];
            movesUsed++;
            movesRemaining--;
            failedActionTypes.clear();
            consecutiveFailures = 0;
          }
          // Continue to try next action (don't break yet)
        }
      }
      
      // Now score and end turn
      const scoringPlayer = newPlayers[aiPlayerIndex];
      const connectedComputers = countConnectedComputers(scoringPlayer.network);
      const scoreGained = connectedComputers;
      const newScore = scoringPlayer.score + scoreGained;
      
      // Check for win
      const isWinner = newScore >= WINNING_SCORE;
      
      // Draw cards to refill hand
      const baseDraw = Math.max(0, MAX_HAND_SIZE - scoringPlayer.hand.length);
      const cardsNeeded = baseDraw;
      const { dealt, remaining } = dealCards(newDrawPile, cardsNeeded);
      
      scoringPlayer.score = newScore;
      scoringPlayer.hand = [...scoringPlayer.hand, ...dealt];
      
      // Build score log message for AI
      const aiScoreLog = connectedComputers > 0 ? `${scoringPlayer.name} scored ${scoreGained} bitcoin (Total: ${newScore})` : `${scoringPlayer.name}'s turn ended`;
      
      const nextPlayer = prev.players[(aiPlayerIndex + 1) % 2];
      
      return {
        ...prev,
        players: newPlayers,
        drawPile: remaining,
        discardPile: newDiscardPile,
        currentPlayerIndex: isWinner ? aiPlayerIndex : (aiPlayerIndex + 1) % 2,
        phase: isWinner ? 'game-over' : 'moves',
        movesRemaining: getBaseMovesForPlayer(),
        equipmentMovesRemaining: hasFieldTech(nextPlayer) ? 1 : 0,
        winner: isWinner ? scoringPlayer : undefined,
        gameLog: [
          ...gameLog.slice(-19), 
          aiScoreLog,
        ],
        aiLastTurnActions: aiActions,
      };
    });
  }, [gameState, aiDifficulty, countConnectedComputers]);

  // Count all computers on a player's network (for audit)
  const countAllComputers = useCallback((network: PlayerNetwork): number => {
    let count = 0;
    // Connected computers
    network.switches.forEach(sw => {
      sw.cables.forEach(cable => {
        count += cable.computers.length;
      });
    });
    // Floating cables' computers
    network.floatingCables.forEach(cable => {
      count += cable.computers.length;
    });
    // Floating computers
    count += network.floatingComputers.length;
    return count;
  }, []);

  // Start an audit against opponent
  const startAudit = useCallback((auditCardId: string, targetPlayerIndex: number) => {
    if (!gameState) return false;
    
    const currentPlayerIndex = gameState.currentPlayerIndex;
    const currentPlayer = gameState.players[currentPlayerIndex];
    const targetPlayer = gameState.players[targetPlayerIndex];
    
    // Validate
    const auditCard = currentPlayer.hand.find(c => c.id === auditCardId && c.subtype === 'audit');
    if (!auditCard) return false;
    if (targetPlayerIndex === currentPlayerIndex) return false;
    if (gameState.movesRemaining <= 0) return false;
    
    // Count target's computers
    const totalComputers = countAllComputers(targetPlayer.network);
    const computersToReturn = Math.ceil(totalComputers / 2);
    
    if (computersToReturn === 0) {
      // No computers to audit - just discard the card
      setGameState(prev => {
        if (!prev) return prev;
        const newPlayers = [...prev.players];
        const player = { ...newPlayers[currentPlayerIndex] };
        player.hand = player.hand.filter(c => c.id !== auditCardId);
        newPlayers[currentPlayerIndex] = player;
        return {
          ...prev,
          players: newPlayers,
          discardPile: [...prev.discardPile, auditCard],
          movesRemaining: prev.movesRemaining - 1,
          gameLog: [...prev.gameLog.slice(-19), `📋 ${currentPlayer.name} tried to audit ${targetPlayer.name} but they have no computers!`],
        };
      });
      return true;
    }
    
    // Start audit battle
    setGameState(prev => {
      if (!prev) return prev;
      const newPlayers = [...prev.players];
      const player = { ...newPlayers[currentPlayerIndex] };
      player.hand = player.hand.filter(c => c.id !== auditCardId);
      newPlayers[currentPlayerIndex] = player;
      
      return {
        ...prev,
        players: newPlayers,
        phase: 'audit',
        movesRemaining: prev.movesRemaining - 1, // Consume move immediately when audit starts
        auditBattle: {
          auditorIndex: currentPlayerIndex,
          targetIndex: targetPlayerIndex,
          auditCardId,
          chain: [],
          currentTurn: 0,
          computersToReturn,
          phase: 'counter',
        },
        gameLog: [...prev.gameLog.slice(-19), `📋 ${currentPlayer.name} audits ${targetPlayer.name} for ${computersToReturn} computer(s)! (${prev.movesRemaining - 1} moves left)`],
      };
    });
    
    return true;
  }, [gameState, countAllComputers]);

  // Respond to audit with a card (Hacked to block, Secured to counter)
  const respondToAudit = useCallback((cardId: string) => {
    if (!gameState || !gameState.auditBattle || gameState.phase !== 'audit') return false;
    
    const battle = gameState.auditBattle;
    const isTargetTurn = battle.chain.length % 2 === 0;
    const respondingPlayerIndex = isTargetTurn ? battle.targetIndex : battle.auditorIndex;
    const respondingPlayer = gameState.players[respondingPlayerIndex];
    
    const neededType = isTargetTurn ? 'hacked' : 'secured';
    const card = respondingPlayer.hand.find(c => c.id === cardId && c.subtype === neededType);
    if (!card) return false;
    
    setGameState(prev => {
      if (!prev || !prev.auditBattle) return prev;
      
      const newPlayers = [...prev.players];
      const player = { ...newPlayers[respondingPlayerIndex] };
      player.hand = player.hand.filter(c => c.id !== cardId);
      newPlayers[respondingPlayerIndex] = player;
      
      return {
        ...prev,
        players: newPlayers,
        auditBattle: {
          ...prev.auditBattle,
          chain: [...prev.auditBattle.chain, { playerId: respondingPlayerIndex, card }],
        },
        gameLog: [...prev.gameLog.slice(-19), `${isTargetTurn ? '🛡️' : '⚔️'} ${player.name} plays ${card.name}!`],
      };
    });
    
    return true;
  }, [gameState]);

  // Helper: Get all computers from a network with location info
  const getAllComputersWithLocation = useCallback((network: PlayerNetwork): { id: string; card: Card; location: string; switchIndex?: number; cableIndex?: number; floatingCableIndex?: number }[] => {
    const computers: { id: string; card: Card; location: string; switchIndex?: number; cableIndex?: number; floatingCableIndex?: number }[] = [];
    
    // Connected computers
    network.switches.forEach((sw, si) => {
      sw.cables.forEach((cable, ci) => {
        cable.computers.forEach(comp => {
          computers.push({
            id: comp.id,
            card: comp.card,
            location: `Switch ${si + 1} → Cable ${ci + 1}`,
            switchIndex: si,
            cableIndex: ci,
          });
        });
      });
    });
    
    // Floating cable computers
    network.floatingCables.forEach((cable, fi) => {
      cable.computers.forEach(comp => {
        computers.push({
          id: comp.id,
          card: comp.card,
          location: `Floating Cable ${fi + 1}`,
          floatingCableIndex: fi,
        });
      });
    });
    
    // Floating computers
    network.floatingComputers.forEach(comp => {
      computers.push({
        id: comp.id,
        card: comp.card,
        location: 'Floating',
      });
    });
    
    return computers;
  }, []);

  // Pass/accept in audit battle (don't play a card)
  const passAudit = useCallback(() => {
    if (!gameState || !gameState.auditBattle || gameState.phase !== 'audit') return;
    
    const battle = gameState.auditBattle;
    const isTargetTurn = battle.chain.length % 2 === 0;
    
    setGameState(prev => {
      if (!prev || !prev.auditBattle) return prev;
      
      const newPlayers = prev.players.map(p => ({ 
        ...p, 
        hand: [...p.hand],
        auditedComputers: [...p.auditedComputers],
        network: {
          ...p.network,
          switches: p.network.switches.map(sw => ({
            ...sw,
            cables: sw.cables.map(c => ({
              ...c,
              computers: [...c.computers],
            })),
          })),
          floatingCables: p.network.floatingCables.map(fc => ({
            ...fc,
            computers: [...fc.computers],
          })),
          floatingComputers: [...p.network.floatingComputers],
        },
      }));
      
      const auditor = newPlayers[battle.auditorIndex];
      const target = newPlayers[battle.targetIndex];
      
      // Collect all cards used in the battle to discard
      const cardsToDiscard: Card[] = [];
      battle.chain.forEach(response => {
        cardsToDiscard.push(response.card);
      });
      
      if (isTargetTurn) {
        // Target passed - AUDIT SUCCEEDS
        // Transition to selection phase - attacker picks which computers
        const availableComputers = getAllComputersWithLocation(target.network);
        
        return {
          ...prev,
          players: newPlayers,
          auditBattle: {
            ...prev.auditBattle,
            phase: 'selection',
            availableComputers,
            selectedComputerIds: [],
          },
          gameLog: [...prev.gameLog.slice(-19), `📋 Audit succeeds! ${auditor.name} selects ${battle.computersToReturn} computer(s) to return...`],
        };
      } else {
        // Auditor passed - AUDIT FAILS (target's block succeeds)
        // Defender draws back to 6 cards
        let newDrawPile = [...prev.drawPile];
        const defenderCardsToDraw = Math.max(0, 6 - target.hand.length);
        if (defenderCardsToDraw > 0) {
          const { dealt, remaining } = dealCards(newDrawPile, defenderCardsToDraw);
          target.hand.push(...dealt);
          newDrawPile = remaining;
        }
        
        const logMessage = `🛡️ ${target.name} blocks the audit! ${auditor.name}'s Audit fails!`;
        
        return {
          ...prev,
          players: newPlayers,
          drawPile: newDrawPile,
          discardPile: [...prev.discardPile, ...cardsToDiscard],
          phase: 'moves',
          // Move was already consumed when audit started - don't deduct again
          auditBattle: undefined,
          gameLog: [...prev.gameLog.slice(-19), logMessage, defenderCardsToDraw > 0 ? `${target.name} draws ${defenderCardsToDraw} card(s)` : ''].filter(Boolean),
        };
      }
    });
  }, [gameState, getAllComputersWithLocation]);

  // Toggle computer selection during audit selection phase
  const toggleAuditComputerSelection = useCallback((computerId: string) => {
    if (!gameState || !gameState.auditBattle || gameState.auditBattle.phase !== 'selection') return;
    
    setGameState(prev => {
      if (!prev || !prev.auditBattle || prev.auditBattle.phase !== 'selection') return prev;
      
      const currentSelected = prev.auditBattle.selectedComputerIds || [];
      const maxSelections = prev.auditBattle.computersToReturn;
      
      let newSelected: string[];
      if (currentSelected.includes(computerId)) {
        // Deselect
        newSelected = currentSelected.filter(id => id !== computerId);
      } else if (currentSelected.length < maxSelections) {
        // Select
        newSelected = [...currentSelected, computerId];
      } else {
        // Already at max - replace oldest selection
        newSelected = [...currentSelected.slice(1), computerId];
      }
      
      return {
        ...prev,
        auditBattle: {
          ...prev.auditBattle,
          selectedComputerIds: newSelected,
        },
      };
    });
  }, [gameState]);

  // Confirm audit computer selection and execute removal
  const confirmAuditSelection = useCallback(() => {
    if (!gameState || !gameState.auditBattle || gameState.auditBattle.phase !== 'selection') return;
    
    const battle = gameState.auditBattle;
    const selectedIds = battle.selectedComputerIds || [];
    
    if (selectedIds.length !== battle.computersToReturn) return;
    
    setGameState(prev => {
      if (!prev || !prev.auditBattle) return prev;
      
      const newPlayers = prev.players.map(p => ({ 
        ...p, 
        hand: [...p.hand],
        auditedComputers: [...p.auditedComputers],
        network: {
          ...p.network,
          switches: p.network.switches.map(sw => ({
            ...sw,
            cables: sw.cables.map(c => ({
              ...c,
              computers: [...c.computers],
            })),
          })),
          floatingCables: p.network.floatingCables.map(fc => ({
            ...fc,
            computers: [...fc.computers],
          })),
          floatingComputers: [...p.network.floatingComputers],
        },
      }));
      
      const target = newPlayers[battle.targetIndex];
      const removedComputers: Card[] = [];
      
      // Remove selected computers from network
      selectedIds.forEach(compId => {
        // Check connected switches
        for (const sw of target.network.switches) {
          for (const cable of sw.cables) {
            const compIndex = cable.computers.findIndex(c => c.id === compId);
            if (compIndex !== -1) {
              const removed = cable.computers.splice(compIndex, 1)[0];
              removedComputers.push(removed.card);
              return;
            }
          }
        }
        
        // Check floating cables
        for (const cable of target.network.floatingCables) {
          const compIndex = cable.computers.findIndex(c => c.id === compId);
          if (compIndex !== -1) {
            const removed = cable.computers.splice(compIndex, 1)[0];
            removedComputers.push(removed.card);
            return;
          }
        }
        
        // Check floating computers
        const floatIndex = target.network.floatingComputers.findIndex(c => c.id === compId);
        if (floatIndex !== -1) {
          const removed = target.network.floatingComputers.splice(floatIndex, 1)[0];
          removedComputers.push(removed.card);
        }
      });
      
      // Collect chain cards to discard
      const cardsToDiscard: Card[] = [];
      battle.chain.forEach(response => {
        cardsToDiscard.push(response.card);
      });
      
      // First, replenish target's hand to 6 cards (excluding audited computers)
      let newDrawPile = [...prev.drawPile];
      const cardsToDraw = Math.max(0, 6 - target.hand.length);
      if (cardsToDraw > 0) {
        const { dealt, remaining } = dealCards(newDrawPile, cardsToDraw);
        target.hand.push(...dealt);
        newDrawPile = remaining;
      }
      
      // Then, add removed computers to auditedComputers (separate section, allows overflow)
      target.auditedComputers.push(...removedComputers);
      
      const logMessage = `📋 Audit successful! ${target.name} returns ${removedComputers.length} computer(s)!`;
      
      return {
        ...prev,
        players: newPlayers,
        drawPile: newDrawPile,
        discardPile: [...prev.discardPile, ...cardsToDiscard],
        phase: 'moves',
        // Move was already consumed when audit started - don't deduct again
        auditBattle: undefined,
        gameLog: [...prev.gameLog.slice(-19), logMessage, cardsToDraw > 0 ? `${target.name} draws ${cardsToDraw} card(s)` : ''].filter(Boolean),
      };
    });
  }, [gameState]);

  // Respond to Head Hunter battle by playing a Head Hunter card
  const respondToHeadHunterBattle = useCallback((cardId: string) => {
    if (!gameState || !gameState.headHunterBattle || gameState.phase !== 'headhunter-battle') return;
    
    const battle = gameState.headHunterBattle;
    const isDefenderTurn = battle.chain.length % 2 === 0;
    const respondingPlayerIndex = isDefenderTurn ? battle.defenderIndex : battle.attackerIndex;
    const respondingPlayer = gameState.players[respondingPlayerIndex];
    
    // Verify card exists and is a Head Hunter
    const card = respondingPlayer.hand.find(c => c.id === cardId);
    if (!card || card.subtype !== 'head-hunter') return;
    
    setGameState(prev => {
      if (!prev || !prev.headHunterBattle) return prev;
      
      const newPlayers = [...prev.players];
      const player = { ...newPlayers[respondingPlayerIndex] };
      
      // Remove card from player's hand
      player.hand = player.hand.filter(c => c.id !== cardId);
      newPlayers[respondingPlayerIndex] = player;
      
      // Add to chain
      const newChain = [...prev.headHunterBattle.chain, { playerId: respondingPlayerIndex, card }];
      
      const actionWord = isDefenderTurn ? 'blocks' : 'counters';
      
      return {
        ...prev,
        players: newPlayers,
        headHunterBattle: {
          ...prev.headHunterBattle,
          chain: newChain,
        },
        discardPile: [...prev.discardPile, card],
        gameLog: [...prev.gameLog.slice(-19), `🎯 ${player.name} ${actionWord} with Head Hunter!`],
      };
    });
  }, [gameState]);

  // Pass/accept in Head Hunter battle (don't play a card)
  const passHeadHunterBattle = useCallback(() => {
    if (!gameState || !gameState.headHunterBattle || gameState.phase !== 'headhunter-battle') return;
    
    const battle = gameState.headHunterBattle;
    const isDefenderTurn = battle.chain.length % 2 === 0;
    
    setGameState(prev => {
      if (!prev || !prev.headHunterBattle) return prev;
      
      const newPlayers = prev.players.map(p => ({ 
        ...p, 
        hand: [...p.hand],
        classificationCards: [...p.classificationCards],
      }));
      
      const attacker = newPlayers[battle.attackerIndex];
      const defender = newPlayers[battle.defenderIndex];
      
      if (isDefenderTurn) {
        // Defender passed - STEAL SUCCEEDS
        // Find and steal the target classification
        const targetIndex = defender.classificationCards.findIndex(c => c.id === battle.targetClassificationId);
        if (targetIndex === -1) {
          // Classification no longer exists, battle ends
          return {
            ...prev,
            phase: battle.previousPhase,
            movesRemaining: battle.previousMovesRemaining - 1,
            headHunterBattle: undefined,
            gameLog: [...prev.gameLog.slice(-19), `⚠️ Target classification no longer exists!`],
          };
        }
        
        const stolenCard = defender.classificationCards[targetIndex];
        defender.classificationCards = defender.classificationCards.filter((_, i) => i !== targetIndex);
        
        // Check if attacker already has this classification type
        const attackerHasSameType = attacker.classificationCards.some(
          c => c.card.subtype === stolenCard.card.subtype
        );
        
        if (attackerHasSameType) {
          // Can't steal - discard it instead
          return {
            ...prev,
            players: newPlayers,
            discardPile: [...prev.discardPile, stolenCard.card],
            phase: battle.previousPhase,
            movesRemaining: battle.previousMovesRemaining - 1,
            headHunterBattle: undefined,
            gameLog: [...prev.gameLog.slice(-19), `🎯 Steal successful but ${attacker.name} already has ${stolenCard.card.name} - card discarded!`],
          };
        }
        
        // Check if attacker already has 2 classifications - for now just add it (dialog should handle this)
        attacker.classificationCards = [...attacker.classificationCards, stolenCard];
        
        return {
          ...prev,
          players: newPlayers,
          phase: battle.previousPhase,
          movesRemaining: battle.previousMovesRemaining - 1,
          headHunterBattle: undefined,
          gameLog: [...prev.gameLog.slice(-19), `🎯 ${attacker.name} steals ${stolenCard.card.name} from ${defender.name}!`],
        };
      } else {
        // Attacker passed - BLOCK SUCCEEDS (steal fails)
        return {
          ...prev,
          players: newPlayers,
          phase: battle.previousPhase,
          movesRemaining: battle.previousMovesRemaining - 1,
          headHunterBattle: undefined,
          gameLog: [...prev.gameLog.slice(-19), `🛡️ ${defender.name} blocks the steal! ${attacker.name}'s Head Hunter fails!`],
        };
      }
    });
  }, [gameState]);

  return {
    gameState,
    selectedCard,
    selectedTarget,
    setSelectedCard,
    setSelectedTarget,
    initializeGame,
    getCurrentPlayer,
    playSwitch,
    playCable,
    playComputer,
    playAuditedComputer,
    playAttack,
    playResolution,
    playClassification,
    discardCard,
    discardClassification,
    drawCards,
    endPhase,
    executeAITurn,
    countConnectedComputers,
    findEquipmentById,
    connectFloatingComputersToCable,
    connectFloatingCablesToSwitch,
    moveEquipment,
    startAudit,
    respondToAudit,
    passAudit,
    countAllComputers,
    toggleAuditComputerSelection,
    confirmAuditSelection,
    respondToHeadHunterBattle,
    passHeadHunterBattle,
    aiDifficulty,
    aiDebugInfo,
  };
}
