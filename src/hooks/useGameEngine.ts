import { useState, useCallback } from 'react';
import { GameState, Player, Card, GamePhase, PlayerNetwork, SwitchNode, CableNode, PlacedCard, FloatingCable } from '@/types/game';
import { buildDeck, shuffleDeck, dealCards } from '@/utils/deckBuilder';

const STARTING_HAND_SIZE = 6;
const MAX_HAND_SIZE = 6;
const MOVES_PER_TURN = 3;
const WINNING_SCORE = 25;

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
      movesRemaining: MOVES_PER_TURN,
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

  // Check if attack is blocked by classification
  const isAttackBlocked = useCallback((targetPlayer: Player, attackType: string): boolean => {
    const blockMap: Record<string, string> = {
      'hacked': 'security-specialist',
      'power-outage': 'facilities',
      'new-hire': 'supervisor',
    };
    const blockingClass = blockMap[attackType];
    if (!blockingClass) return false;
    return targetPlayer.classificationCards.some(c => c.card.subtype === blockingClass);
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
                return { ...cable, computers: [...cable.computers, movedItem] };
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
                return { ...cable, computers: [...cable.computers, movedItem] };
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
              logMessage = 'Moved cable to switch (now connected to internet!)';
              return { ...sw, cables: [...sw.cables, movedItem] };
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
    
    // Check if blocked by classification
    if (isAttackBlocked(targetPlayer, attackCard.subtype)) {
      addLog(`Attack blocked by ${attackCard.subtype === 'hacked' ? 'Security Specialist' : attackCard.subtype === 'power-outage' ? 'Facilities' : 'Supervisor'}!`);
      return false;
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
        movesRemaining: prev.movesRemaining - 1,
        gameLog: [...prev.gameLog.slice(-19), `⚡ ${attackCard.name} played on ${target.name}'s ${equipmentInfo.type}!`],
      };
    });
    
    return true;
  }, [gameState, addLog, findEquipmentById, isAttackBlocked]);

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
        const cardsToDraw = Math.max(0, MAX_HAND_SIZE - currentPlayer.hand.length);
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
        const newScore = currentPlayer.score + connectedComputers;
        
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
              cardsToDraw > 0 ? `Drew ${cardsToDraw} card(s)` : '',
              `Scored ${connectedComputers} bitcoin (Total: ${newScore})`,
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
          movesRemaining: MOVES_PER_TURN,
          turnNumber: prev.turnNumber + 1,
          gameLog: [
            ...prev.gameLog.slice(-19),
            cardsToDraw > 0 ? `Drew ${cardsToDraw} card(s)` : '',
            `Scored ${connectedComputers} bitcoin (Total: ${newScore})`,
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
      const maxMoves = MOVES_PER_TURN;
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
        const attacks = hand.filter(c => c.type === 'attack' && c.subtype !== 'audit'); // Exclude audit for now
        const resolutions = hand.filter(c => c.type === 'resolution');
        
        let playedCard = false;
        
        // PRIORITY 1: Resolve own disabled equipment (if it would restore scoring)
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
        
        // PRIORITY 2: Attack human's network (if they have scoring equipment)
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
        
        // PRIORITY 3: Build network - play a switch if we have none
        if (!playedCard && network.switches.length === 0 && switches.length > 0) {
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
          gameLog = [...gameLog.slice(-19), `Computer played Switch`];
        }
        
        // PRIORITY 4: Play a cable on an existing enabled switch
        if (!playedCard && cables.length > 0) {
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
            gameLog = [...gameLog.slice(-19), `Computer played Cable on Switch`];
          }
        }
        
        // PRIORITY 5: Play a computer on a cable with space
        if (!playedCard && computers.length > 0) {
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
                gameLog = [...gameLog.slice(-19), `Computer played Computer`];
              }
            }
          }
        }
        
        // PRIORITY 6: Play another switch if we have switches but no valid moves
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
          gameLog = [...gameLog.slice(-19), `Computer played Switch`];
        }
        
        if (playedCard) {
          movesUsed++;
          movesRemaining--;
        } else {
          // No valid moves available
          break;
        }
      }
      
      // Now score and end turn
      const scoringPlayer = newPlayers[aiPlayerIndex];
      const connectedComputers = countConnectedComputers(scoringPlayer.network);
      const newScore = scoringPlayer.score + connectedComputers;
      
      // Check for win
      const isWinner = newScore >= WINNING_SCORE;
      
      // Draw cards to refill hand
      const cardsNeeded = Math.max(0, MAX_HAND_SIZE - scoringPlayer.hand.length);
      const { dealt, remaining } = dealCards(prev.drawPile, cardsNeeded);
      
      scoringPlayer.score = newScore;
      scoringPlayer.hand = [...scoringPlayer.hand, ...dealt];
      
      return {
        ...prev,
        players: newPlayers,
        drawPile: remaining,
        currentPlayerIndex: isWinner ? aiPlayerIndex : (aiPlayerIndex + 1) % 2,
        phase: isWinner ? 'game-over' : 'moves',
        movesRemaining: MOVES_PER_TURN,
        winner: isWinner ? scoringPlayer : undefined,
        gameLog: [
          ...gameLog.slice(-19), 
          connectedComputers > 0 ? `Computer scored ${connectedComputers} bitcoin (Total: ${newScore})` : `Computer's turn ended`,
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
