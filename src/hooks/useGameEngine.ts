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
  const playSwitch = useCallback((cardId?: string) => {
    if (!gameState) return false;
    
    const player = gameState.players[gameState.currentPlayerIndex];
    const switchCard = cardId 
      ? player.hand.find(c => c.id === cardId)
      : player.hand.find(c => c.subtype === 'switch');
    
    if (!switchCard || switchCard.subtype !== 'switch') {
      addLog('No Switch card!');
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
      currentPlayer.hand = currentPlayer.hand.filter(c => c.id !== switchCard.id);
      
      // Create new switch - no auto-connect
      const newSwitch: SwitchNode = {
        card: switchCard,
        id: generatePlacementId(),
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
    
    return true;
  }, [gameState, addLog]);

  // Play a Cable card - NO auto-connect, requires proximity drop
  const playCable = useCallback((cardId?: string, targetSwitchId?: string) => {
    if (!gameState) return false;
    
    const player = gameState.players[gameState.currentPlayerIndex];
    const cableCard = cardId
      ? player.hand.find(c => c.id === cardId)
      : player.hand.find(c => c.subtype === 'cable-2' || c.subtype === 'cable-3');
    
    if (!cableCard || (cableCard.subtype !== 'cable-2' && cableCard.subtype !== 'cable-3')) {
      addLog('No Cable card!');
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
      currentPlayer.hand = currentPlayer.hand.filter(c => c.id !== cableCard.id);
      
      const maxComputers = cableCard.subtype === 'cable-2' ? 2 : 3;
      
      // Create cable node - no auto-connect
      const newCable: CableNode = {
        card: cableCard,
        id: generatePlacementId(),
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
    
    return true;
  }, [gameState, addLog]);

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
      
      // Apply attack to target equipment - create deep copy of network
      const newSwitches = target.network.switches.map((sw, si) => {
        if (equipmentInfo.type === 'switch' && si === equipmentInfo.switchIndex) {
          const updatedSwitch = { ...sw, attachedIssues: [...sw.attachedIssues, attackCard], isDisabled: true };
          return updatedSwitch;
        }
        
        return {
          ...sw,
          cables: sw.cables.map((cable, ci) => {
            if (equipmentInfo.type === 'cable' && si === equipmentInfo.switchIndex && ci === equipmentInfo.cableIndex) {
              return { ...cable, attachedIssues: [...cable.attachedIssues, attackCard], isDisabled: true };
            }
            
            return {
              ...cable,
              computers: cable.computers.map((comp, coi) => {
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
      
      // Apply resolution - create deep copy of network
      const newSwitches = player.network.switches.map((sw, si) => {
        const processIssues = (issues: Card[]): Card[] => {
          if (isHelpdesk) return []; // Helpdesk removes ALL issues
          return issues.filter(i => i.subtype !== targetIssueType); // Remove one matching issue type
        };
        
        if (equipmentInfo.type === 'switch' && si === equipmentInfo.switchIndex) {
          const newIssues = isHelpdesk ? [] : sw.attachedIssues.filter((i, idx) => 
            i.subtype !== targetIssueType || sw.attachedIssues.findIndex(x => x.subtype === targetIssueType) !== idx
          );
          return { ...sw, attachedIssues: newIssues, isDisabled: newIssues.length > 0 };
        }
        
        return {
          ...sw,
          cables: sw.cables.map((cable, ci) => {
            if (equipmentInfo.type === 'cable' && si === equipmentInfo.switchIndex && ci === equipmentInfo.cableIndex) {
              const newIssues = isHelpdesk ? [] : cable.attachedIssues.filter((i, idx) =>
                i.subtype !== targetIssueType || cable.attachedIssues.findIndex(x => x.subtype === targetIssueType) !== idx
              );
              return { ...cable, attachedIssues: newIssues, isDisabled: newIssues.length > 0 };
            }
            
            return {
              ...cable,
              computers: cable.computers.map((comp, coi) => {
                if (equipmentInfo.type === 'computer' && si === equipmentInfo.switchIndex && ci === equipmentInfo.cableIndex && coi === equipmentInfo.computerIndex) {
                  const newIssues = isHelpdesk ? [] : comp.attachedIssues.filter((i, idx) =>
                    i.subtype !== targetIssueType || comp.attachedIssues.findIndex(x => x.subtype === targetIssueType) !== idx
                  );
                  return { ...comp, attachedIssues: newIssues, isDisabled: newIssues.length > 0 };
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
      
      const phases: GamePhase[] = ['moves', 'discard', 'draw', 'score'];
      const currentIndex = phases.indexOf(prev.phase as GamePhase);
      
      if (prev.phase === 'score') {
        // Calculate score
        const currentPlayer = prev.players[prev.currentPlayerIndex];
        const connectedComputers = countConnectedComputers(currentPlayer.network);
        
        const newPlayers = [...prev.players];
        newPlayers[prev.currentPlayerIndex] = {
          ...currentPlayer,
          score: currentPlayer.score + connectedComputers,
        };
        
        const newScore = newPlayers[prev.currentPlayerIndex].score;
        
        // Check for winner
        if (newScore >= WINNING_SCORE) {
          return {
            ...prev,
            players: newPlayers,
            phase: 'game-over',
            winner: newPlayers[prev.currentPlayerIndex],
            gameLog: [...prev.gameLog.slice(-19), `🎉 ${currentPlayer.name} wins with ${newScore} bitcoin!`],
          };
        }
        
        // Move to next player's turn
        const nextPlayerIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
        const nextPlayer = prev.players[nextPlayerIndex];
        
        return {
          ...prev,
          players: newPlayers,
          currentPlayerIndex: nextPlayerIndex,
          phase: 'moves',
          movesRemaining: MOVES_PER_TURN,
          turnNumber: prev.turnNumber + 1,
          gameLog: [
            ...prev.gameLog.slice(-19),
            `Scored ${connectedComputers} bitcoin (Total: ${newScore})`,
            `--- ${nextPlayer.name}'s Turn ---`,
          ],
        };
      }
      
      const nextPhase = phases[currentIndex + 1] || 'moves';
      
      // Auto-draw when entering draw phase
      if (nextPhase === 'draw') {
        const currentPlayer = prev.players[prev.currentPlayerIndex];
        const cardsToDraw = Math.max(0, MAX_HAND_SIZE - currentPlayer.hand.length);
        
        let newDrawPile = [...prev.drawPile];
        let newDiscardPile = [...prev.discardPile];
        
        if (newDrawPile.length < cardsToDraw) {
          newDrawPile = [...newDrawPile, ...shuffleDeck(newDiscardPile)];
          newDiscardPile = [];
        }
        
        const drawnCards = newDrawPile.slice(0, cardsToDraw);
        newDrawPile = newDrawPile.slice(cardsToDraw);
        
        const newPlayers = [...prev.players];
        newPlayers[prev.currentPlayerIndex] = {
          ...currentPlayer,
          hand: [...currentPlayer.hand, ...drawnCards],
        };
        
        return {
          ...prev,
          players: newPlayers,
          drawPile: newDrawPile,
          discardPile: newDiscardPile,
          phase: 'score',
          gameLog: [...prev.gameLog.slice(-19), `Drew ${drawnCards.length} card(s)`, 'Scoring phase...'],
        };
      }
      
      return {
        ...prev,
        phase: nextPhase,
        gameLog: [...prev.gameLog.slice(-19), `${nextPhase.charAt(0).toUpperCase() + nextPhase.slice(1)} phase`],
      };
    });
  }, [gameState, countConnectedComputers]);

  // Simple AI turn (random play for now - will be enhanced with Lovable AI later)
  const executeAITurn = useCallback(async () => {
    if (!gameState) return;
    
    const player = gameState.players[gameState.currentPlayerIndex];
    if (player.isHuman) return;
    
    // Simple AI: Try to build network
    const switches = player.hand.filter(c => c.subtype === 'switch');
    const cables = player.hand.filter(c => c.subtype === 'cable-2' || c.subtype === 'cable-3');
    const computers = player.hand.filter(c => c.subtype === 'computer');
    
    // Play switch if none exist
    if (player.network.switches.length === 0 && switches.length > 0) {
      playSwitch();
      await new Promise(r => setTimeout(r, 800));
    }
    
    // Play cable if switch exists
    if (player.network.switches.length > 0 && cables.length > 0) {
      const targetSwitch = player.network.switches[0];
      const cable = cables[0];
      playCable(targetSwitch.id, cable.subtype as 'cable-2' | 'cable-3');
      await new Promise(r => setTimeout(r, 800));
    }
    
    // Play computer if cable exists with space
    if (computers.length > 0) {
      for (const sw of player.network.switches) {
        for (const cable of sw.cables) {
          if (cable.computers.length < cable.maxComputers) {
            playComputer(cable.id);
            await new Promise(r => setTimeout(r, 800));
            break;
          }
        }
      }
    }
    
    // End phases
    endPhase(); // discard
    await new Promise(r => setTimeout(r, 500));
    endPhase(); // draw + score
    await new Promise(r => setTimeout(r, 500));
    endPhase(); // next turn
  }, [gameState, playSwitch, playCable, playComputer, endPhase]);

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
  };
}
