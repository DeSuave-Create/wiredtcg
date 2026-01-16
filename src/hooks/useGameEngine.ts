import { useState, useCallback } from 'react';
import { GameState, Player, Card, GamePhase, PlayerNetwork, SwitchNode, CableNode, PlacedCard } from '@/types/game';
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
    floatingEquipment: [],
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

  // Play a Switch card
  const playSwitch = useCallback(() => {
    if (!gameState) return false;
    
    const player = gameState.players[gameState.currentPlayerIndex];
    const switchCard = player.hand.find(c => c.subtype === 'switch');
    
    if (!switchCard) {
      addLog('No Switch card in hand!');
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
      
      // Add switch to network
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

  // Play a Cable card on a Switch
  const playCable = useCallback((switchId: string, cableType: 'cable-2' | 'cable-3') => {
    if (!gameState) return false;
    
    const player = gameState.players[gameState.currentPlayerIndex];
    const cableCard = player.hand.find(c => c.subtype === cableType);
    
    if (!cableCard) {
      addLog(`No ${cableType === 'cable-2' ? '2-Cable' : '3-Cable'} in hand!`);
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
      
      // Find the switch
      const switchIndex = currentPlayer.network.switches.findIndex(s => s.id === switchId);
      if (switchIndex === -1) return prev;
      
      // Remove card from hand
      currentPlayer.hand = currentPlayer.hand.filter(c => c.id !== cableCard.id);
      
      // Create cable node
      const newCable: CableNode = {
        card: cableCard,
        id: generatePlacementId(),
        attachedIssues: [],
        isDisabled: false,
        maxComputers: cableType === 'cable-2' ? 2 : 3,
        computers: [],
      };
      
      // Add cable to switch
      const newSwitches = [...currentPlayer.network.switches];
      newSwitches[switchIndex] = {
        ...newSwitches[switchIndex],
        cables: [...newSwitches[switchIndex].cables, newCable],
      };
      
      currentPlayer.network = {
        ...currentPlayer.network,
        switches: newSwitches,
      };
      
      newPlayers[prev.currentPlayerIndex] = currentPlayer;
      
      return {
        ...prev,
        players: newPlayers,
        movesRemaining: prev.movesRemaining - 1,
        gameLog: [...prev.gameLog.slice(-19), `Played ${cableType === 'cable-2' ? '2-Cable' : '3-Cable'} (${prev.movesRemaining - 1} moves left)`],
      };
    });
    
    return true;
  }, [gameState, addLog]);

  // Play a Computer on a Cable
  const playComputer = useCallback((cableId: string) => {
    if (!gameState) return false;
    
    const player = gameState.players[gameState.currentPlayerIndex];
    const computerCard = player.hand.find(c => c.subtype === 'computer');
    
    if (!computerCard) {
      addLog('No Computer card in hand!');
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
      
      // Find the cable
      let cableFound = false;
      const newSwitches = currentPlayer.network.switches.map(sw => {
        const cableIndex = sw.cables.findIndex(c => c.id === cableId);
        if (cableIndex === -1) return sw;
        
        const cable = sw.cables[cableIndex];
        if (cable.computers.length >= cable.maxComputers) {
          return sw; // Cable is full
        }
        
        cableFound = true;
        
        const newComputer: PlacedCard = {
          card: computerCard,
          id: generatePlacementId(),
          attachedIssues: [],
          isDisabled: false,
        };
        
        const newCables = [...sw.cables];
        newCables[cableIndex] = {
          ...cable,
          computers: [...cable.computers, newComputer],
        };
        
        return { ...sw, cables: newCables };
      });
      
      if (!cableFound) {
        return {
          ...prev,
          gameLog: [...prev.gameLog.slice(-19), 'Cable is full or not found!'],
        };
      }
      
      // Remove card from hand
      currentPlayer.hand = currentPlayer.hand.filter(c => c.id !== computerCard.id);
      currentPlayer.network = {
        ...currentPlayer.network,
        switches: newSwitches,
      };
      
      newPlayers[prev.currentPlayerIndex] = currentPlayer;
      
      return {
        ...prev,
        players: newPlayers,
        movesRemaining: prev.movesRemaining - 1,
        gameLog: [...prev.gameLog.slice(-19), `Played Computer (${prev.movesRemaining - 1} moves left)`],
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
    discardCard,
    drawCards,
    endPhase,
    executeAITurn,
    countConnectedComputers,
  };
}
