import { useState, useCallback } from 'react';
import { GameState, Player, Card, GamePhase, PlayerNetwork, SwitchNode, CableNode, PlacedCard, FloatingCable } from '@/types/game';
import { buildDeck, shuffleDeck, dealCards } from '@/utils/deckBuilder';

const STARTING_HAND_SIZE = 6;
const MAX_HAND_SIZE = 6;
const BASE_MOVES_PER_TURN = 3;
const WINNING_SCORE = 25;

// Helper: Calculate moves per turn based on classification cards
function getMovesForPlayer(player: Player): number {
  let moves = BASE_MOVES_PER_TURN;
  // Field Tech gives +1 move per turn
  if (player.classificationCards.some(c => c.card.subtype === 'field-tech')) {
    moves += 1;
  }
  return moves;
}

// Helper: Count Head Hunter cards for a player
function countHeadHunters(player: Player): number {
  return player.classificationCards.filter(c => c.card.subtype === 'head-hunter').length;
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

  const initializeGame = useCallback((playerName: string = 'Player') => {
    // Build and shuffle deck
    const deck = shuffleDeck(buildDeck());
    
    // Create players
    const human = createPlayer('player-1', playerName, true);
    const computer = createPlayer('player-2', 'Computer', false);
    
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
      drawPile,
      discardPile: [],
      turnNumber: 1,
      winner: null,
      gameLog: ['Game started! You go first.', 'Build your network: Switch → Cable → Computer'],
    };
    
    setGameState(initialState);
    setSelectedCard(null);
    setSelectedTarget(null);
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

  // Helper: Find equipment by ID across network
  const findEquipmentById = useCallback((network: PlayerNetwork, equipmentId: string): { type: 'switch' | 'cable' | 'computer'; node: PlacedCard; switchIndex?: number; cableIndex?: number; computerIndex?: number } | null => {
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
    
    if (gameState.movesRemaining <= 0) {
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
      
      return {
        ...prev,
        players: newPlayers,
        movesRemaining: prev.movesRemaining - 1,
        gameLog: [...prev.gameLog.slice(-19), `Played Switch (${prev.movesRemaining - 1} moves left)`],
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
    
    if (gameState.movesRemaining <= 0) {
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
      
      return {
        ...prev,
        players: newPlayers,
        movesRemaining: prev.movesRemaining - 1,
        gameLog: [...prev.gameLog.slice(-19), `Played ${maxComputers}-Cable${floatingMsg} (${prev.movesRemaining - 1} moves left)`],
      };
    });
    
    return { success: true, cableId: newCableId, maxComputers };
  }, [gameState, addLog]);

  // Connect floating computers to a cable (FREE action - doesn't cost a move)
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
        gameLog: [...prev.gameLog.slice(-19), `Connected ${computersToConnect.length} computer(s)${locationMsg}`],
      };
    });
    
    return true;
  }, [gameState]);

  // Connect floating cables to a switch (FREE action - doesn't cost a move)
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
        gameLog: [...prev.gameLog.slice(-19), `Connected ${cablesToConnect.length} cable(s)${computerMsg} to switch!`],
      };
    });
    
    return true;
  }, [gameState]);

  // Move placed equipment to a new location (FREE action - doesn't cost a move if it's rearranging)
  const moveEquipment = useCallback((
    sourceType: 'switch' | 'cable' | 'computer' | 'floating-cable' | 'floating-computer',
    sourceId: string,
    targetType: 'switch' | 'cable' | 'floating' | 'board',
    targetId?: string
  ) => {
    if (!gameState) return false;
    
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
      
      return {
        ...prev,
        players: newPlayers,
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
    
    if (gameState.movesRemaining <= 0) {
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
      
      return {
        ...prev,
        players: newPlayers,
        movesRemaining: prev.movesRemaining - 1,
        gameLog: [...prev.gameLog.slice(-19), `Played Computer${floatingMsg} (${prev.movesRemaining - 1} moves left)`],
      };
    });
    
    return true;
  }, [gameState, addLog]);

  // Discard a card
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
      
      target.network = { ...target.network, switches: newSwitches };
      
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
      
      // Apply resolution - CASCADING ENABLE
      // Resolving switch → enables switch + all cables + all computers (if they have no other issues)
      // Resolving cable → enables cable + all computers on it (if they have no other issues)
      // Resolving computer → enables only that computer
      const newSwitches = player.network.switches.map((sw, si) => {
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
      
      player.network = { ...player.network, switches: newSwitches };
      newPlayers[prev.currentPlayerIndex] = player;
      
      return {
        ...prev,
        players: newPlayers,
        discardPile: [...prev.discardPile, resolutionCard],
        movesRemaining: prev.movesRemaining - 1,
        gameLog: [...prev.gameLog.slice(-19), `🔧 ${resolutionCard.name} resolved issue on ${equipmentInfo.type}!`],
      };
    });
    
    return true;
  }, [gameState, addLog, findEquipmentById]);

  // Play a Classification card (max 2 in play)
  // Head Hunter: Steals opponent's classification (can be blocked by opponent's Head Hunter)
  // Seal the Deal: Unblockable Head Hunter
  // Supervisor/Security Specialist/Facilities: Auto-resolves matching attacks on your network when played
  const playClassification = useCallback((cardId: string, targetClassificationId?: string) => {
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
      
      // For Head Hunter: check if opponent can block (has their own Head Hunter)
      if (isHeadHunter) {
        const opponentHeadHunters = countHeadHunters(opponent);
        const playerHeadHunters = countHeadHunters(currentPlayer);
        
        // If opponent has more or equal head hunters, the steal is blocked
        // (player is using one now, so compare player's current + 1 vs opponent's)
        if (opponentHeadHunters > 0) {
          addLog(`Opponent's Head Hunter blocks your steal! Both cards are discarded.`);
          // Both players lose a Head Hunter - the attacking one and one defending one
          setGameState(prev => {
            if (!prev) return prev;
            
            const newPlayers = [...prev.players];
            const player = { ...newPlayers[currentPlayerIndex] };
            const opp = { ...newPlayers[opponentPlayerIndex] };
            
            // Remove the Head Hunter card from attacker's hand
            player.hand = player.hand.filter(c => c.id !== classCard.id);
            
            // Remove one Head Hunter from opponent's classifications
            const oppHeadHunterIndex = opp.classificationCards.findIndex(c => c.card.subtype === 'head-hunter');
            const removedOppCard = opp.classificationCards[oppHeadHunterIndex];
            opp.classificationCards = opp.classificationCards.filter((_, i) => i !== oppHeadHunterIndex);
            
            newPlayers[currentPlayerIndex] = player;
            newPlayers[opponentPlayerIndex] = opp;
            
            return {
              ...prev,
              players: newPlayers,
              discardPile: [...prev.discardPile, classCard, removedOppCard.card],
              movesRemaining: prev.movesRemaining - 1,
              gameLog: [...prev.gameLog.slice(-19), `🎖️ Head Hunter vs Head Hunter! Both cards discarded.`],
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
        
        // Check if player already has this classification type (can't steal duplicates)
        const playerHasSameType = player.classificationCards.some(
          c => c.card.subtype === stolenCard.card.subtype
        );
        
        if (playerHasSameType) {
          return {
            ...prev,
            gameLog: [...prev.gameLog.slice(-19), `Can't steal ${stolenCard.card.name} - you already have this type!`],
          };
        }
        
        opp.classificationCards = opp.classificationCards.filter((_, i) => i !== targetIndex);
        
        // Check if player already has 2 classifications
        if (player.classificationCards.length >= 2) {
          // Can't add stolen card, it goes to discard
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
        
        newPlayers[currentPlayerIndex] = player;
        newPlayers[opponentPlayerIndex] = opp;
        
        return {
          ...prev,
          players: newPlayers,
          discardPile: [...prev.discardPile, classCard],
          movesRemaining: prev.movesRemaining - 1,
          gameLog: [...prev.gameLog.slice(-19), `🎖️ ${isSealTheDeal ? 'Seal the Deal' : 'Head Hunter'}! Stole ${stolenCard.card.name}!`],
        };
      });
      
      return true;
    }
    
    // Regular classification cards (Field Tech, Supervisor, Security Specialist, Facilities)
    // Check if player already has 2 classification cards
    if (currentPlayer.classificationCards.length >= 2) {
      addLog('Maximum 2 classification cards in play!');
      return false;
    }
    
    // Check if same type already in play
    const sameTypeInPlay = currentPlayer.classificationCards.some(
      c => c.card.subtype === classCard.subtype
    );
    if (sameTypeInPlay) {
      addLog(`${classCard.name} already in play!`);
      return false;
    }
    
    setGameState(prev => {
      if (!prev) return prev;
      
      const newPlayers = [...prev.players];
      const player = { ...newPlayers[prev.currentPlayerIndex] };
      
      // Remove card from hand
      player.hand = player.hand.filter(c => c.id !== classCard.id);
      
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
        // Resolve all matching attacks on player's network
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
      
      return {
        ...prev,
        players: newPlayers,
        discardPile: [...prev.discardPile, ...resolvedIssues],
        movesRemaining: prev.movesRemaining - 1,
        gameLog: [...prev.gameLog.slice(-19), `🎖️ ${classCard.name} played! ${abilities[classCard.subtype] || ''}${resolveMsg}`],
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
          movesRemaining: getMovesForPlayer(nextPlayer),
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

  // AI turn with full strategy: attacks, resolutions, and equipment
  const executeAITurn = useCallback(async () => {
    if (!gameState) return;
    
    const aiPlayerIndex = gameState.currentPlayerIndex;
    const humanPlayerIndex = aiPlayerIndex === 0 ? 1 : 0;
    const player = gameState.players[aiPlayerIndex];
    if (player.isHuman) return;
    
    setGameState(prev => {
      if (!prev) return prev;
      
      // Deep clone the state to work with
      let newPlayers = prev.players.map(p => ({
        ...p,
        hand: [...p.hand],
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
          floatingCables: [...p.network.floatingCables],
          floatingComputers: [...p.network.floatingComputers],
        },
      }));
      
      let movesRemaining = prev.movesRemaining;
      let gameLog = [...prev.gameLog];
      let newDiscardPile = [...prev.discardPile];
      const maxMoves = getMovesForPlayer(newPlayers[aiPlayerIndex]);
      let movesUsed = 0;
      
      // Helper: Find best attack target on human's network (prioritize switches > cables > computers)
      const findAttackTarget = (humanNetwork: PlayerNetwork): { type: 'switch' | 'cable' | 'computer', switchIndex: number, cableIndex?: number, computerIndex?: number } | null => {
        // Priority 1: Attack an enabled switch (disables everything below it)
        for (let si = 0; si < humanNetwork.switches.length; si++) {
          if (!humanNetwork.switches[si].isDisabled) {
            return { type: 'switch', switchIndex: si };
          }
        }
        // Priority 2: Attack an enabled cable
        for (let si = 0; si < humanNetwork.switches.length; si++) {
          for (let ci = 0; ci < humanNetwork.switches[si].cables.length; ci++) {
            if (!humanNetwork.switches[si].cables[ci].isDisabled) {
              return { type: 'cable', switchIndex: si, cableIndex: ci };
            }
          }
        }
        // Priority 3: Attack an enabled computer
        for (let si = 0; si < humanNetwork.switches.length; si++) {
          for (let ci = 0; ci < humanNetwork.switches[si].cables.length; ci++) {
            for (let coi = 0; coi < humanNetwork.switches[si].cables[ci].computers.length; coi++) {
              if (!humanNetwork.switches[si].cables[ci].computers[coi].isDisabled) {
                return { type: 'computer', switchIndex: si, cableIndex: ci, computerIndex: coi };
              }
            }
          }
        }
        return null;
      };
      
      // Helper: Find disabled equipment on AI's network that can be resolved
      const findResolutionTarget = (aiNetwork: PlayerNetwork, resolutionSubtype: string): { type: 'switch' | 'cable' | 'computer', switchIndex: number, cableIndex?: number, computerIndex?: number } | null => {
        const resolutionMap: Record<string, string> = {
          'secured': 'hacked',
          'powered': 'power-outage',
          'trained': 'new-hire',
          'helpdesk': 'any', // Helpdesk resolves any issue
        };
        const targetIssueType = resolutionMap[resolutionSubtype];
        
        // Check switches
        for (let si = 0; si < aiNetwork.switches.length; si++) {
          const sw = aiNetwork.switches[si];
          if (sw.attachedIssues.length > 0) {
            if (targetIssueType === 'any' || sw.attachedIssues.some(i => i.subtype === targetIssueType)) {
              return { type: 'switch', switchIndex: si };
            }
          }
          // Check cables
          for (let ci = 0; ci < sw.cables.length; ci++) {
            const cable = sw.cables[ci];
            if (cable.attachedIssues.length > 0) {
              if (targetIssueType === 'any' || cable.attachedIssues.some(i => i.subtype === targetIssueType)) {
                return { type: 'cable', switchIndex: si, cableIndex: ci };
              }
            }
            // Check computers
            for (let coi = 0; coi < cable.computers.length; coi++) {
              const comp = cable.computers[coi];
              if (comp.attachedIssues.length > 0) {
                if (targetIssueType === 'any' || comp.attachedIssues.some(i => i.subtype === targetIssueType)) {
                  return { type: 'computer', switchIndex: si, cableIndex: ci, computerIndex: coi };
                }
              }
            }
          }
        }
        return null;
      };
      
      // Helper: Apply attack with cascading disable
      const applyAttack = (targetNetwork: PlayerNetwork, target: { type: string, switchIndex: number, cableIndex?: number, computerIndex?: number }, attackCard: Card) => {
        if (target.type === 'switch') {
          const sw = targetNetwork.switches[target.switchIndex];
          sw.attachedIssues.push(attackCard);
          sw.isDisabled = true;
          // Cascade disable
          sw.cables.forEach(cable => {
            cable.isDisabled = true;
            cable.computers.forEach(comp => comp.isDisabled = true);
          });
        } else if (target.type === 'cable' && target.cableIndex !== undefined) {
          const cable = targetNetwork.switches[target.switchIndex].cables[target.cableIndex];
          cable.attachedIssues.push(attackCard);
          cable.isDisabled = true;
          // Cascade disable computers
          cable.computers.forEach(comp => comp.isDisabled = true);
        } else if (target.type === 'computer' && target.cableIndex !== undefined && target.computerIndex !== undefined) {
          const comp = targetNetwork.switches[target.switchIndex].cables[target.cableIndex].computers[target.computerIndex];
          comp.attachedIssues.push(attackCard);
          comp.isDisabled = true;
        }
      };
      
      // Helper: Apply resolution with cascading enable
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
          // Cascade enable if switch is now enabled
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
          // Cascade enable computers
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
      
      while (movesUsed < maxMoves && movesRemaining > 0) {
        const currentPlayer = newPlayers[aiPlayerIndex];
        const humanPlayer = newPlayers[humanPlayerIndex];
        const hand = currentPlayer.hand;
        const network = currentPlayer.network;
        
        const switches = hand.filter(c => c.subtype === 'switch');
        const cables = hand.filter(c => c.subtype === 'cable-2' || c.subtype === 'cable-3');
        const computers = hand.filter(c => c.subtype === 'computer');
        const attacks = hand.filter(c => c.type === 'attack' && c.subtype !== 'audit');
        const resolutions = hand.filter(c => c.type === 'resolution');
        const classifications = hand.filter(c => c.type === 'classification');
        
        let playedCard = false;
        
        // Check if we have any cables with space for computers
        const hasCableWithSpace = network.switches.some(sw => 
          !sw.isDisabled && sw.cables.some(c => !c.isDisabled && c.computers.length < c.maxComputers)
        );
        
        // Check if we have any enabled switches that could hold cables
        const hasEnabledSwitch = network.switches.some(sw => !sw.isDisabled);
        
        // PRIORITY 1: Resolve own disabled equipment FIRST (most important)
        if (!playedCard && resolutions.length > 0) {
          for (const resCard of resolutions) {
            const target = findResolutionTarget(network, resCard.subtype);
            if (target) {
              const isHelpdesk = resCard.subtype === 'helpdesk';
              applyResolution(network, target, resCard, isHelpdesk);
              currentPlayer.hand = hand.filter(c => c.id !== resCard.id);
              playedCard = true;
              gameLog = [...gameLog.slice(-19), `🔧 Computer used ${resCard.name} to fix ${target.type}!`];
              break;
            }
          }
        }
        
        // PRIORITY 2: Play classification cards (they provide bonuses)
        if (!playedCard && classifications.length > 0) {
          // Separate steal cards from placeable cards
          const stealCards = classifications.filter(c => c.subtype === 'head-hunter' || c.subtype === 'seal-the-deal');
          const placeableCards = classifications.filter(c => c.subtype !== 'head-hunter' && c.subtype !== 'seal-the-deal');
          
          // First, try to use steal cards if opponent has classifications
          if (stealCards.length > 0 && humanPlayer.classificationCards.length > 0) {
            // Prefer Seal the Deal (unblockable) over Head Hunter
            const stealCard = stealCards.find(c => c.subtype === 'seal-the-deal') || stealCards[0];
            
            // Pick a target classification to steal
            const targetClass = humanPlayer.classificationCards[0];
            
            // Check if AI already has this classification type
            const alreadyHasType = currentPlayer.classificationCards.some(
              c => c.card.subtype === targetClass.card.subtype
            );
            
            if (!alreadyHasType || currentPlayer.classificationCards.length < 2) {
              // Remove steal card from hand
              currentPlayer.hand = hand.filter(c => c.id !== stealCard.id);
              
              // Remove target from human
              humanPlayer.classificationCards = humanPlayer.classificationCards.filter(c => c.id !== targetClass.id);
              
              // Add to AI's classifications if space and not duplicate type
              if (currentPlayer.classificationCards.length < 2 && !alreadyHasType) {
                currentPlayer.classificationCards.push(targetClass);
                gameLog = [...gameLog.slice(-19), `🎖️ Computer used ${stealCard.name} to steal ${targetClass.card.name}!`];
              } else {
                // Discard if can't keep
                newDiscardPile.push(targetClass.card);
                gameLog = [...gameLog.slice(-19), `🎖️ Computer used ${stealCard.name} - ${targetClass.card.name} discarded!`];
              }
              
              newDiscardPile.push(stealCard);
              playedCard = true;
            }
          }
          
          // Then, try to place regular classification cards
          if (!playedCard && placeableCards.length > 0 && currentPlayer.classificationCards.length < 2) {
            // Prioritize: Field Tech (+1 move), then defensive ones
            const sortedClass = [...placeableCards].sort((a, b) => {
              const priority: Record<string, number> = {
                'field-tech': 1,
                'security-specialist': 2,
                'facilities': 3,
                'supervisor': 4,
              };
              return (priority[a.subtype] || 10) - (priority[b.subtype] || 10);
            });
            
            // Check if we already have this type
            const classCard = sortedClass.find(c => 
              !currentPlayer.classificationCards.some(existing => existing.card.subtype === c.subtype)
            );
            
            if (classCard) {
              const newClassification: PlacedCard = {
                card: classCard,
                id: generatePlacementId(),
                attachedIssues: [],
                isDisabled: false,
              };
              
              currentPlayer.hand = hand.filter(c => c.id !== classCard.id);
              currentPlayer.classificationCards.push(newClassification);
              playedCard = true;
              gameLog = [...gameLog.slice(-19), `🎖️ Computer activated ${classCard.name}!`];
            }
          }
        }
        
        // PRIORITY 3: Attack human's network (aggressive play)
        if (!playedCard && attacks.length > 0 && humanPlayer.network.switches.length > 0) {
          const target = findAttackTarget(humanPlayer.network);
          if (target) {
            const attackCard = attacks[0];
            applyAttack(humanPlayer.network, target, attackCard);
            currentPlayer.hand = hand.filter(c => c.id !== attackCard.id);
            playedCard = true;
            gameLog = [...gameLog.slice(-19), `⚡ Computer attacked your ${target.type} with ${attackCard.name}!`];
          }
        }
        
        // PRIORITY 4: Play computers on cables FIRST if we have space (maximize scoring)
        if (!playedCard && computers.length > 0 && hasCableWithSpace) {
          let placed = false;
          const computerCard = computers[0];
          
          for (let si = 0; si < network.switches.length && !placed; si++) {
            const sw = network.switches[si];
            if (sw.isDisabled) continue;
            
            for (let ci = 0; ci < sw.cables.length && !placed; ci++) {
              const cable = sw.cables[ci];
              if (cable.computers.length < cable.maxComputers && !cable.isDisabled) {
                const newComputerId = generatePlacementId();
                
                const newComputer: PlacedCard = {
                  card: computerCard,
                  id: newComputerId,
                  attachedIssues: [],
                  isDisabled: false,
                };
                
                currentPlayer.hand = hand.filter(c => c.id !== computerCard.id);
                currentPlayer.network.switches[si].cables[ci].computers.push(newComputer);
                
                placed = true;
                playedCard = true;
                gameLog = [...gameLog.slice(-19), `💻 Computer connected a Computer`];
              }
            }
          }
        }
        
        // PRIORITY 5: Play cables if we have switches but no cable space for computers
        if (!playedCard && cables.length > 0 && hasEnabledSwitch) {
          const enabledSwitch = network.switches.find(sw => !sw.isDisabled);
          if (enabledSwitch) {
            const cableCard = cables[0];
            const maxComputers = cableCard.subtype === 'cable-2' ? 2 : 3;
            const newCableId = generatePlacementId();
            
            const newCable: CableNode = {
              card: cableCard,
              id: newCableId,
              attachedIssues: [],
              isDisabled: false,
              maxComputers: maxComputers as 2 | 3,
              computers: [],
            };
            
            currentPlayer.hand = hand.filter(c => c.id !== cableCard.id);
            const switchIndex = currentPlayer.network.switches.findIndex(sw => sw.id === enabledSwitch.id);
            if (switchIndex !== -1) {
              currentPlayer.network.switches[switchIndex].cables.push(newCable);
            }
            
            playedCard = true;
            gameLog = [...gameLog.slice(-19), `🔗 Computer connected a Cable`];
          }
        }
        
        // PRIORITY 6: Play a switch if we have none or all are disabled
        if (!playedCard && switches.length > 0) {
          const needsSwitch = network.switches.length === 0 || !hasEnabledSwitch;
          
          if (needsSwitch) {
            const switchCard = switches[0];
            const newSwitchId = generatePlacementId();
            
            const newSwitch: SwitchNode = {
              card: switchCard,
              id: newSwitchId,
              attachedIssues: [],
              isDisabled: false,
              cables: [],
            };
            
            currentPlayer.hand = hand.filter(c => c.id !== switchCard.id);
            currentPlayer.network.switches = [...network.switches, newSwitch];
            
            playedCard = true;
            gameLog = [...gameLog.slice(-19), `🔌 Computer placed a Switch`];
          }
        }
        
        // PRIORITY 7: Play more switches if we have cables but no switch space
        if (!playedCard && switches.length > 0) {
          const switchCard = switches[0];
          const newSwitchId = generatePlacementId();
          
          const newSwitch: SwitchNode = {
            card: switchCard,
            id: newSwitchId,
            attachedIssues: [],
            isDisabled: false,
            cables: [],
          };
          
          currentPlayer.hand = hand.filter(c => c.id !== switchCard.id);
          currentPlayer.network.switches = [...currentPlayer.network.switches, newSwitch];
          
          playedCard = true;
          gameLog = [...gameLog.slice(-19), `🔌 Computer placed a Switch`];
        }
        
        // PRIORITY 8: Play more cables if we have computers but no cable space
        if (!playedCard && cables.length > 0 && hasEnabledSwitch) {
          const enabledSwitch = network.switches.find(sw => !sw.isDisabled);
          if (enabledSwitch) {
            const cableCard = cables[0];
            const maxComputers = cableCard.subtype === 'cable-2' ? 2 : 3;
            const newCableId = generatePlacementId();
            
            const newCable: CableNode = {
              card: cableCard,
              id: newCableId,
              attachedIssues: [],
              isDisabled: false,
              maxComputers: maxComputers as 2 | 3,
              computers: [],
            };
            
            currentPlayer.hand = hand.filter(c => c.id !== cableCard.id);
            const switchIndex = currentPlayer.network.switches.findIndex(sw => sw.id === enabledSwitch.id);
            if (switchIndex !== -1) {
              currentPlayer.network.switches[switchIndex].cables.push(newCable);
            }
            
            playedCard = true;
            gameLog = [...gameLog.slice(-19), `🔗 Computer connected a Cable`];
          }
        }
        
        if (playedCard) {
          movesUsed++;
          movesRemaining--;
        } else {
          // No valid play found - try to discard unusable cards before ending
          const hand = currentPlayer.hand;
          
          // Find cards that can't be played:
          // - Head Hunter/Seal the Deal with no opponent classifications to steal
          // - Attack cards with no valid targets on opponent's network
          // - Resolution cards with no matching issues on own network
          const stealCards = hand.filter(c => c.subtype === 'head-hunter' || c.subtype === 'seal-the-deal');
          const hasStealTarget = humanPlayer.classificationCards.length > 0;
          
          const attackCards = hand.filter(c => c.type === 'attack');
          const hasAttackTarget = findAttackTarget(humanPlayer.network) !== null;
          
          // Smart attack card retention: Hold attacks if opponent might build equipment soon
          // Keep attacks if: opponent has cards in hand OR has any network (even if disabled)
          const opponentHasNetwork = humanPlayer.network.switches.length > 0;
          const opponentHasCards = humanPlayer.hand.length > 0;
          const shouldHoldAttacks = opponentHasNetwork || opponentHasCards;
          
          const resolutionCards = hand.filter(c => c.type === 'resolution');
          const hasResolutionTarget = resolutionCards.some(c => findResolutionTarget(network, c.subtype) !== null);
          
          // Find a card to discard
          let cardToDiscard: Card | null = null;
          
          // Priority: Discard steal cards if no target
          if (!hasStealTarget && stealCards.length > 0) {
            cardToDiscard = stealCards[0];
          }
          // Discard attack cards ONLY if no valid target AND opponent unlikely to build soon
          else if (!hasAttackTarget && attackCards.length > 0 && !shouldHoldAttacks) {
            cardToDiscard = attackCards[0];
          }
          // Discard resolution cards that have no matching issues
          else if (resolutionCards.length > 0) {
            const unusableRes = resolutionCards.find(c => !findResolutionTarget(network, c.subtype));
            if (unusableRes) {
              cardToDiscard = unusableRes;
            }
          }
          
          if (cardToDiscard && movesRemaining > 0) {
            currentPlayer.hand = hand.filter(c => c.id !== cardToDiscard!.id);
            newDiscardPile.push(cardToDiscard);
            gameLog = [...gameLog.slice(-19), `🗑️ Computer discarded ${cardToDiscard.name}`];
            movesUsed++;
            movesRemaining--;
            // Continue the loop to try another action
            continue;
          }
          
          // No valid moves and nothing to discard
          break;
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
      const { dealt, remaining } = dealCards(prev.drawPile, cardsNeeded);
      
      scoringPlayer.score = newScore;
      scoringPlayer.hand = [...scoringPlayer.hand, ...dealt];
      
      // Build score log message for AI
      const aiScoreLog = connectedComputers > 0 ? `Computer scored ${scoreGained} bitcoin (Total: ${newScore})` : `Computer's turn ended`;
      
      const nextPlayer = prev.players[(aiPlayerIndex + 1) % 2];
      
      return {
        ...prev,
        players: newPlayers,
        drawPile: remaining,
        discardPile: newDiscardPile,
        currentPlayerIndex: isWinner ? aiPlayerIndex : (aiPlayerIndex + 1) % 2,
        phase: isWinner ? 'game-over' : 'moves',
        movesRemaining: getMovesForPlayer(nextPlayer),
        winner: isWinner ? scoringPlayer : undefined,
        gameLog: [
          ...gameLog.slice(-19), 
          aiScoreLog,
        ],
      };
    });
  }, [gameState, countConnectedComputers]);

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
    playAttack,
    playResolution,
    playClassification,
    discardCard,
    drawCards,
    endPhase,
    executeAITurn,
    countConnectedComputers,
    findEquipmentById,
    connectFloatingComputersToCable,
    connectFloatingCablesToSwitch,
    moveEquipment,
  };
}
