// =============================================================================
// SIMULATION LOG - Full playable game with live AI thought process panel
// =============================================================================

import { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Brain, Bug } from 'lucide-react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, pointerWithin, CollisionDetection } from '@dnd-kit/core';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useGameEngine } from '@/hooks/useGameEngine';
import { PlayerSection } from '@/components/game/PlayerSection';
import { AILogPanel } from '@/components/game/AILogPanel';
import { ConnectComputersDialog } from '@/components/game/ConnectComputersDialog';
import { ConnectCablesDialog } from '@/components/game/ConnectCablesDialog';
import { StealClassificationDialog } from '@/components/game/StealClassificationDialog';
import { AuditDialog } from '@/components/game/AuditDialog';
import { HeadHunterBattleDialog } from '@/components/game/HeadHunterBattleDialog';
import { PlacementChoiceDialog, switchesToPlacementTargets, cablesToPlacementTargets } from '@/components/game/PlacementChoiceDialog';
import { ReconnectEquipmentDialog, switchesToReconnectTargets, cablesToReconnectTargets } from '@/components/game/ReconnectEquipmentDialog';
import { AuditComputerSelectionDialog } from '@/components/game/AuditComputerSelectionDialog';
import { ReplaceClassificationDialog } from '@/components/game/ReplaceClassificationDialog';
import { GameEventAnimation, useGameEventAnimation } from '@/components/game/GameEventAnimations';
import { DifficultySelector } from '@/components/game/DifficultySelector';
import { SimulationIntro } from '@/components/game/SimulationIntro';
import { DeckIndicator } from '@/components/game/DeckIndicator';
import { AICardPlayAnimation } from '@/components/game/FloatingCardAnimation';
import { MobileSelectionBar } from '@/components/game/MobileSelectionBar';
import { MobileGameProvider, useMobileGame } from '@/contexts/MobileGameContext';
import { AIThoughtPanel } from '@/components/game/AIThoughtPanel';
import { AIDifficulty, makeAIDecision, getMatchStateDebug } from '@/utils/ai';
import { EvaluatedAction } from '@/utils/ai/types';
import { Card } from '@/types/game';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// Custom collision detection
const preferSpecificTargets: CollisionDetection = (args) => {
  const collisions = pointerWithin(args);
  if (collisions.length <= 1) return collisions;
  
  const sorted = [...collisions].sort((a, b) => {
    const aId = String(a.id);
    const bId = String(b.id);
    const aIsBoard = aId.includes('-board');
    const bIsBoard = bId.includes('-board');
    const aIsCable = aId.includes('-cable-');
    const bIsCable = bId.includes('-cable-');
    
    if (aIsCable && !bIsCable) return -1;
    if (!aIsCable && bIsCable) return 1;
    if (aIsBoard && !bIsBoard) return 1;
    if (!aIsBoard && bIsBoard) return -1;
    return 0;
  });
  
  return sorted.slice(0, 1);
};

// AI Decision Log interface
interface AIDecisionLog {
  turn: number;
  movesRemaining: number;
  timestamp: number;
  action: EvaluatedAction | null;
  allActions: EvaluatedAction[];
  reasoning?: string;
  profile?: { aggression: string; difficulty: string; turns: number } | null;
}

const SimulationLogContent = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const {
    gameState,
    initializeGame,
    playSwitch,
    playCable,
    playComputer,
    playAuditedComputer,
    playAttack,
    playResolution,
    playClassification,
    discardCard,
    discardClassification,
    endPhase,
    executeAITurn,
    countConnectedComputers,
    connectFloatingComputersToCable,
    connectFloatingCablesToSwitch,
    moveEquipment,
    startAudit,
    respondToAudit,
    passAudit,
    toggleAuditComputerSelection,
    confirmAuditSelection,
    respondToHeadHunterBattle,
    passHeadHunterBattle,
    aiDifficulty,
  } = useGameEngine();
  
  const { currentEvent, triggerEvent, clearEvent } = useGameEventAnimation();

  // === AI THOUGHT LOGGING STATE ===
  const [decisionHistory, setDecisionHistory] = useState<AIDecisionLog[]>([]);
  const [showDebugPanel, setShowDebugPanel] = useState(true);
  const lastCaptureRef = useRef<string>('');

  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [activePlacedCard, setActivePlacedCard] = useState<{
    card: Card;
    sourceType: 'switch' | 'cable' | 'computer' | 'floating-cable' | 'floating-computer';
    sourceId: string;
    parentId?: string;
  } | null>(null);
  
  const [connectDialog, setConnectDialog] = useState<{
    isOpen: boolean;
    cableId: string;
    maxConnections: number;
    cableType: string;
  } | null>(null);
  
  const [cableDialog, setCableDialog] = useState<{
    isOpen: boolean;
    switchId: string;
  } | null>(null);
  
  const [stealDialog, setStealDialog] = useState<{
    isOpen: boolean;
    cardId: string;
    cardName: string;
  } | null>(null);
  
  const [placementChoiceDialog, setPlacementChoiceDialog] = useState<{
    isOpen: boolean;
    cardType: 'cable' | 'computer';
    card: Card;
    pendingAction: () => void;
  } | null>(null);
  
  const [reconnectDialog, setReconnectDialog] = useState<{
    isOpen: boolean;
    equipmentType: 'cable' | 'computer';
    equipmentId: string;
    equipmentImage: string;
    equipmentName: string;
  } | null>(null);
  
  const [replaceClassDialog, setReplaceClassDialog] = useState<{
    isOpen: boolean;
    newCard: Card;
  } | null>(null);
  
  const [aiCardAnimation, setAICardAnimation] = useState<{
    card: Card | null;
    action: 'play' | 'draw' | null;
  }>({ card: null, action: null });
  
  const [prevAIHandSize, setPrevAIHandSize] = useState<number>(0);
  
  const hasSeenIntro = sessionStorage.getItem('hasSeenIntro') === 'true';
  const [showIntro, setShowIntro] = useState(!hasSeenIntro);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showDifficultySelector, setShowDifficultySelector] = useState(hasSeenIntro);

  const handleIntroComplete = () => {
    sessionStorage.setItem('hasSeenIntro', 'true');
    setIsTransitioning(true);
    setShowIntro(false);
    setShowDifficultySelector(true);
  };

  const handleStartGame = useCallback((difficulty: AIDifficulty) => {
    initializeGame('You', difficulty);
    setShowDifficultySelector(false);
    setDecisionHistory([]);
    lastCaptureRef.current = '';
    toast.success(`Game started! AI difficulty: ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`);
  }, [initializeGame]);

  const handleNewGame = useCallback(() => {
    setShowDifficultySelector(true);
    setDecisionHistory([]);
    lastCaptureRef.current = '';
  }, []);

  useEffect(() => {
    if (!gameState && !showDifficultySelector && !showIntro) {
      navigate('/');
    }
  }, [gameState, showDifficultySelector, showIntro, navigate]);

  const [prevHumanClassCount, setPrevHumanClassCount] = useState<number>(0);

  // === CAPTURE AI DECISIONS BEFORE EXECUTION ===
  useEffect(() => {
    if (!gameState) return;
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const captureKey = `${gameState.turnNumber}-${gameState.movesRemaining}`;
    
    if (!currentPlayer.isHuman && gameState.phase === 'moves' && captureKey !== lastCaptureRef.current) {
      lastCaptureRef.current = captureKey;
      
      const decision = makeAIDecision(gameState, aiDifficulty);
      const profile = getMatchStateDebug();
      
      setDecisionHistory(prev => [...prev.slice(-50), {
        turn: gameState.turnNumber,
        movesRemaining: gameState.movesRemaining,
        timestamp: Date.now(),
        action: decision.action,
        allActions: decision.allActions,
        reasoning: decision.action?.reasoning,
        profile,
      }]);
    }
  }, [gameState?.turnNumber, gameState?.currentPlayerIndex, gameState?.phase, gameState?.movesRemaining, aiDifficulty]);

  // Execute AI turn
  useEffect(() => {
    if (!gameState) return;
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    
    if (!currentPlayer.isHuman && gameState.phase === 'moves') {
      const timer = setTimeout(() => {
        executeAITurn();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState?.currentPlayerIndex, gameState?.phase, gameState?.movesRemaining, executeAITurn]);

  // Handle AI audit response
  useEffect(() => {
    if (!gameState || gameState.phase !== 'audit' || !gameState.auditBattle) return;
    if (gameState.auditBattle.phase !== 'counter') return;
    
    const battle = gameState.auditBattle;
    const isTargetTurn = battle.chain.length % 2 === 0;
    const respondingPlayerIndex = isTargetTurn ? battle.targetIndex : battle.auditorIndex;
    const respondingPlayer = gameState.players[respondingPlayerIndex];
    
    if (!respondingPlayer.isHuman) {
      const neededType = isTargetTurn ? 'hacked' : 'secured';
      const playableCards = respondingPlayer.hand.filter(c => c.subtype === neededType);
      
      const timer = setTimeout(() => {
        if (playableCards.length > 0) {
          respondToAudit(playableCards[0].id);
          toast.info(`🤖 Computer plays ${playableCards[0].name}!`);
        } else {
          passAudit();
          toast.info(isTargetTurn ? '🤖 Computer accepts the audit!' : '🤖 Computer lets the block succeed!');
        }
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [gameState?.phase, gameState?.auditBattle?.phase, gameState?.auditBattle?.chain.length, respondToAudit, passAudit]);

  // Handle AI Head Hunter battle response
  useEffect(() => {
    if (!gameState || gameState.phase !== 'headhunter-battle' || !gameState.headHunterBattle) return;
    
    const battle = gameState.headHunterBattle;
    const isDefenderTurn = battle.chain.length % 2 === 0;
    const respondingPlayerIndex = isDefenderTurn ? battle.defenderIndex : battle.attackerIndex;
    const respondingPlayer = gameState.players[respondingPlayerIndex];
    
    if (!respondingPlayer.isHuman) {
      const playableCards = respondingPlayer.hand.filter(c => c.subtype === 'head-hunter');
      
      const timer = setTimeout(() => {
        if (playableCards.length > 0) {
          respondToHeadHunterBattle(playableCards[0].id);
          toast.info(`🤖 Computer plays Head Hunter!`);
        } else {
          passHeadHunterBattle();
          toast.info(isDefenderTurn ? '🤖 Computer accepts the steal!' : '🤖 Computer lets the block succeed!');
        }
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [gameState?.phase, gameState?.headHunterBattle?.chain.length, respondToHeadHunterBattle, passHeadHunterBattle]);

  // Handle AI audit computer selection
  useEffect(() => {
    if (!gameState || gameState.phase !== 'audit' || !gameState.auditBattle) return;
    if (gameState.auditBattle.phase !== 'selection') return;
    
    const battle = gameState.auditBattle;
    const auditor = gameState.players[battle.auditorIndex];
    
    if (!auditor.isHuman) {
      const availableComputers = battle.availableComputers || [];
      const neededCount = battle.computersToReturn;
      const selectedCount = (battle.selectedComputerIds || []).length;
      
      const timer = setTimeout(() => {
        if (selectedCount < neededCount && availableComputers.length > selectedCount) {
          const unselectedComputers = availableComputers.filter(c => !(battle.selectedComputerIds || []).includes(c.id));
          if (unselectedComputers.length > 0) {
            const connected = unselectedComputers.find(c => c.location.includes('Switch'));
            toggleAuditComputerSelection((connected || unselectedComputers[0]).id);
          }
        } else if (selectedCount === neededCount) {
          confirmAuditSelection();
          toast.info(`🤖 Computer selected ${neededCount} computer(s) to return!`);
        }
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [gameState?.phase, gameState?.auditBattle?.phase, gameState?.auditBattle?.selectedComputerIds?.length, toggleAuditComputerSelection, confirmAuditSelection]);

  const [prevLogLength, setPrevLogLength] = useState(0);

  useEffect(() => {
    if (!gameState) return;
    
    const logs = gameState.gameLog;
    if (logs.length > prevLogLength && prevLogLength > 0) {
      const newLogs = logs.slice(prevLogLength);
      for (const log of newLogs) {
        if (log.includes('Audit successful!')) triggerEvent('audit-success', 'Audit Successful!');
        else if (log.includes('blocks the audit')) triggerEvent('audit-blocked', 'Audit Blocked!');
        else if (log.includes('blocks the steal')) triggerEvent('audit-blocked', 'Steal Blocked!');
        else if (log.includes('Seal the Deal')) triggerEvent('seal-the-deal', 'UNBLOCKABLE STEAL! 💎');
        else if (log.includes('steals')) triggerEvent('head-hunter', 'Classification Stolen!');
      }
    }
    setPrevLogLength(logs.length);
  }, [gameState?.gameLog.length, triggerEvent]);

  useEffect(() => {
    if (!gameState) return;
    const humanClassCount = gameState.players[0].classificationCards.length;
    if (prevHumanClassCount > 0 && humanClassCount < prevHumanClassCount) {
      const lastLog = gameState.gameLog[gameState.gameLog.length - 1];
      if (lastLog?.includes('Seal the Deal')) triggerEvent('seal-the-deal', 'Your classification was stolen! 💎');
      else if (lastLog?.includes('steal')) triggerEvent('head-hunter', 'Your classification was stolen!');
    }
    setPrevHumanClassCount(humanClassCount);
  }, [gameState?.players[0].classificationCards.length, triggerEvent]);

  useEffect(() => {
    if (!gameState) return;
    const aiHandSize = gameState.players[1].hand.length;
    if (aiHandSize > prevAIHandSize && prevAIHandSize > 0) {
      const lastDrawnCard = gameState.players[1].hand[aiHandSize - 1];
      if (lastDrawnCard) setAICardAnimation({ card: lastDrawnCard, action: 'draw' });
    }
    setPrevAIHandSize(aiHandSize);
  }, [gameState?.players[1].hand.length]);

  useEffect(() => {
    if (!gameState || gameState.aiLastTurnActions.length === 0) return;
    const lastAction = gameState.aiLastTurnActions[gameState.aiLastTurnActions.length - 1];
    if (lastAction?.type === 'play' && lastAction.card) {
      setAICardAnimation({ card: lastAction.card, action: 'play' });
    }
  }, [gameState?.aiLastTurnActions.length]);

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current;
    const card = data?.card as Card;
    if (data?.isPlaced) {
      setActivePlacedCard({ card, sourceType: data.sourceType, sourceId: data.sourceId, parentId: data.parentId });
    }
    setActiveCard(card);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const droppedCard = activeCard;
    const droppedPlacedCard = activePlacedCard;
    setActiveCard(null);
    setActivePlacedCard(null);
    
    const { active, over } = event;
    if (!over || !gameState) {
      if (droppedCard && !droppedPlacedCard) showCardHint(droppedCard);
      return;
    }

    const data = active.data.current;
    const card = data?.card as Card;
    const dropZoneId = over.id as string;
    const dropData = over.data.current;

    if (!card) return;

    const parts = dropZoneId.split('-');
    const targetPlayerId = parts[0] + '-' + parts[1];
    const zoneType = parts[2];

    const isHumanTarget = targetPlayerId === 'player-1';
    const isComputerTarget = targetPlayerId === 'player-2';
    const computerPlayerIndex = 1;
    
    // AUDITED COMPUTER
    if (data?.isAudited && isHumanTarget) {
      const auditedIndex = data.auditedIndex as number;
      let cableId: string | undefined;
      if (zoneType === 'cable') cableId = dropZoneId.replace(`${targetPlayerId}-cable-`, '');
      else if (zoneType === 'floating') cableId = dropZoneId.replace(`${targetPlayerId}-floating-cable-`, '');
      const success = playAuditedComputer(card.id, auditedIndex, cableId);
      if (success) toast.success(cableId ? 'Audited computer reconnected!' : 'Audited computer placed (floating)');
      return;
    }
    
    // PLACED CLASSIFICATION discard
    if (data?.isPlacedClassification && zoneType === 'discard' && isHumanTarget) {
      const classificationId = data.classificationId as string;
      const success = discardClassification(classificationId);
      if (success) toast.success(`${card.name} discarded from board`);
      return;
    }
    
    // PLACED CARD move
    if (droppedPlacedCard && isHumanTarget) {
      const { sourceType, sourceId } = droppedPlacedCard;
      let targetType: 'switch' | 'cable' | 'floating' | 'board' = 'board';
      let targetId: string | undefined;
      
      if (zoneType === 'switch') { targetType = 'switch'; targetId = dropZoneId.replace(`${targetPlayerId}-switch-`, ''); }
      else if (zoneType === 'cable') { targetType = 'cable'; targetId = dropZoneId.replace(`${targetPlayerId}-cable-`, ''); }
      else if (zoneType === 'floating') { targetType = 'cable'; targetId = dropZoneId.replace(`${targetPlayerId}-floating-cable-`, ''); }
      else if (zoneType === 'board' || zoneType === 'internet') targetType = 'floating';
      
      if (targetId === sourceId) return;
      
      if (targetType === 'floating') {
        const humanPlayer = gameState.players[0];
        if (sourceType === 'floating-cable') {
          const availableSwitches = switchesToReconnectTargets(humanPlayer.network.switches);
          if (availableSwitches.length > 0) {
            const floatingCable = humanPlayer.network.floatingCables.find(c => c.id === sourceId);
            if (floatingCable) {
              setReconnectDialog({ isOpen: true, equipmentType: 'cable', equipmentId: sourceId, equipmentImage: floatingCable.card.image, equipmentName: floatingCable.card.name });
              return;
            }
          }
        }
        if (sourceType === 'floating-computer') {
          const availableCables = cablesToReconnectTargets(humanPlayer.network.switches, humanPlayer.network.floatingCables);
          if (availableCables.length > 0) {
            const floatingComputer = humanPlayer.network.floatingComputers.find(c => c.id === sourceId);
            if (floatingComputer) {
              setReconnectDialog({ isOpen: true, equipmentType: 'computer', equipmentId: sourceId, equipmentImage: floatingComputer.card.image, equipmentName: floatingComputer.card.name });
              return;
            }
          }
        }
      }
      
      moveEquipment(sourceType, sourceId, targetType, targetId);
      toast.success('Equipment moved!');
      return;
    }

    // HAND CARD validation
    if (!droppedPlacedCard && dropData) {
      const accepts = dropData.accepts as string[];
      if (!accepts.includes(card.subtype)) { showCardHint(card); return; }
    }

    // DISCARD
    if (zoneType === 'discard' && !data?.isPlacedClassification) {
      discardCard(card.id);
      toast.success('Card discarded');
      return;
    }

    // EQUIPMENT
    if (card.type === 'equipment' && isHumanTarget) {
      if (card.subtype === 'switch') {
        const result = playSwitch(card.id);
        if (result.success) {
          toast.success('Switch placed!');
          const humanPlayer = gameState.players[0];
          if (humanPlayer.network.floatingCables.length > 0 && result.switchId) {
            setCableDialog({ isOpen: true, switchId: result.switchId });
          }
        }
      } else if (card.subtype === 'cable-2' || card.subtype === 'cable-3') {
        if (zoneType === 'switch') {
          const switchId = dropZoneId.replace(`${targetPlayerId}-switch-`, '');
          const result = playCable(card.id, switchId);
          if (result.success) {
            toast.success('Cable connected to switch!');
            const humanPlayer = gameState.players[0];
            if (humanPlayer.network.floatingComputers.length > 0 && result.cableId && result.maxComputers) {
              setConnectDialog({ isOpen: true, cableId: result.cableId, maxConnections: result.maxComputers, cableType: card.subtype });
            }
          }
        } else {
          const humanPlayer = gameState.players[0];
          const availableSwitches = humanPlayer.network.switches.filter(sw => !sw.isDisabled);
          if (availableSwitches.length > 0) {
            setPlacementChoiceDialog({
              isOpen: true, cardType: 'cable', card,
              pendingAction: () => {
                const result = playCable(card.id, undefined);
                if (result.success) {
                  toast.success('Cable placed (floating)');
                  const hp = gameState.players[0];
                  if (hp.network.floatingComputers.length > 0 && result.cableId && result.maxComputers) {
                    setConnectDialog({ isOpen: true, cableId: result.cableId, maxConnections: result.maxComputers, cableType: card.subtype });
                  }
                }
              },
            });
          } else {
            const result = playCable(card.id, undefined);
            if (result.success) toast.success('Cable placed (floating)');
          }
        }
      } else if (card.subtype === 'computer') {
        if (zoneType === 'cable' || zoneType === 'floating') {
          const cableId = zoneType === 'cable' ? dropZoneId.replace(`${targetPlayerId}-cable-`, '') : dropZoneId.replace(`${targetPlayerId}-floating-cable-`, '');
          playComputer(card.id, cableId);
          toast.success('Computer connected to cable!');
        } else {
          const humanPlayer = gameState.players[0];
          const availableCables = cablesToPlacementTargets(humanPlayer.network.switches, humanPlayer.network.floatingCables);
          if (availableCables.length > 0) {
            setPlacementChoiceDialog({
              isOpen: true, cardType: 'computer', card,
              pendingAction: () => { playComputer(card.id, undefined); toast.success('Computer placed (floating)'); },
            });
          } else {
            playComputer(card.id, undefined);
            toast.success('Computer placed (floating)');
          }
        }
      }
      return;
    }

    // ATTACKS
    if (card.type === 'attack' && isComputerTarget) {
      if (card.subtype === 'audit') {
        if (['board', 'switch', 'cable', 'computer'].includes(zoneType)) {
          const success = startAudit(card.id, computerPlayerIndex);
          if (success) toast.info('📋 Audit initiated!');
        }
        return;
      }
      let equipmentId = '';
      if (zoneType === 'switch') equipmentId = dropZoneId.replace(`${targetPlayerId}-switch-`, '');
      else if (zoneType === 'cable') equipmentId = dropZoneId.includes('floating-cable') ? dropZoneId.replace(`${targetPlayerId}-floating-cable-`, '') : dropZoneId.replace(`${targetPlayerId}-cable-`, '');
      else if (zoneType === 'computer') equipmentId = dropZoneId.replace(`${targetPlayerId}-computer-`, '');
      else if (zoneType === 'floating') equipmentId = dropZoneId.includes('floating-cable') ? dropZoneId.replace(`${targetPlayerId}-floating-cable-`, '') : dropZoneId.replace(`${targetPlayerId}-floating-computer-`, '');
      
      if (equipmentId) { playAttack(card.id, equipmentId, computerPlayerIndex); toast.success(`${card.name} attack played!`); }
      else if (zoneType === 'board') toast.error('Drop on specific equipment to attack!');
      return;
    }

    // RESOLUTIONS
    if (card.type === 'resolution' && isHumanTarget) {
      let equipmentId = '';
      if (zoneType === 'switch') equipmentId = dropZoneId.replace(`${targetPlayerId}-switch-`, '');
      else if (zoneType === 'cable') equipmentId = dropZoneId.includes('floating-cable') ? dropZoneId.replace(`${targetPlayerId}-floating-cable-`, '') : dropZoneId.replace(`${targetPlayerId}-cable-`, '');
      else if (zoneType === 'computer') equipmentId = dropZoneId.includes('floating-computer') ? dropZoneId.replace(`${targetPlayerId}-floating-computer-`, '') : dropZoneId.replace(`${targetPlayerId}-computer-`, '');
      else if (zoneType === 'floating') equipmentId = dropZoneId.includes('floating-cable') ? dropZoneId.replace(`${targetPlayerId}-floating-cable-`, '') : dropZoneId.replace(`${targetPlayerId}-floating-computer-`, '');
      
      if (equipmentId) { playResolution(card.id, equipmentId); toast.success('Issue resolved!'); }
      return;
    }

    // CLASSIFICATIONS
    if (card.type === 'classification' && zoneType === 'classification') {
      if (card.subtype === 'head-hunter' || card.subtype === 'seal-the-deal') {
        if (!isComputerTarget) { toast.error(`${card.name} must be used on opponent's classifications!`); return; }
        const computerPlayer = gameState.players[1];
        const humanPlayer = gameState.players[0];
        if (computerPlayer.classificationCards.length === 0) { toast.error("Opponent has no classifications to steal!"); return; }
        const stealable = computerPlayer.classificationCards.filter(oc => !humanPlayer.classificationCards.some(c => c.card.subtype === oc.card.subtype));
        if (stealable.length === 0) { toast.error("Can't steal - you already have the same classification types!"); return; }
        setStealDialog({ isOpen: true, cardId: card.id, cardName: card.name });
        return;
      }
      if (!isHumanTarget) { toast.error(`${card.name} must be placed on your own classification zone!`); return; }
      const humanPlayer = gameState.players[0];
      if (humanPlayer.classificationCards.length >= 2) { setReplaceClassDialog({ isOpen: true, newCard: card }); return; }
      const success = playClassification(card.id);
      if (success) toast.success(`${card.name} is now active!`);
      return;
    }

    showCardHint(card);
  };

  const showCardHint = (card: Card) => {
    const hints: Record<string, string> = {
      'switch': '🔌 Drag Switch to your network board',
      'cable-2': '🔗 Drag Cable to a Switch to connect',
      'cable-3': '🔗 Drag Cable to a Switch to connect',
      'computer': '💻 Drag Computer to a Cable to connect',
      'hacked': '⚡ Drag to OPPONENT\'s equipment',
      'power-outage': '⚡ Drag to OPPONENT\'s equipment',
      'new-hire': '⚡ Drag to OPPONENT\'s equipment',
      'audit': '📋 Drag to OPPONENT\'s network',
      'secured': '🔧 Drag to YOUR disabled equipment',
      'powered': '🔧 Drag to YOUR disabled equipment',
      'trained': '🔧 Drag to YOUR disabled equipment',
      'helpdesk': '🔧 Drag to YOUR disabled equipment',
      'head-hunter': '🎯 Drag to OPPONENT\'s classification',
      'seal-the-deal': '💎 Drag to OPPONENT\'s classification',
    };
    toast.info(hints[card.subtype] || `Cannot place ${card.name} here`, { duration: 3000 });
  };

  const { selectedCard, selectedCardSource, clearSelection } = useMobileGame();

  if (showIntro) {
    return <div className="min-h-screen flex flex-col bg-background"><SimulationIntro onComplete={handleIntroComplete} /></div>;
  }

  if (!gameState) {
    if (!showDifficultySelector) return null;
    return (
      <div className="min-h-screen flex flex-col bg-background relative">
        <div className={cn("fixed inset-0 bg-black z-40 pointer-events-none transition-opacity duration-700", isTransitioning ? 'opacity-100' : 'opacity-0')} onTransitionEnd={() => setIsTransitioning(false)} />
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <DifficultySelector isOpen={showDifficultySelector} onSelect={handleStartGame} onClose={() => setShowDifficultySelector(false)} />
        </div>
        <Footer />
      </div>
    );
  }

  const humanPlayer = gameState.players[0];
  const computerPlayer = gameState.players[1];
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isHumanTurn = currentPlayer.isHuman;
  const totalMovesAvailable = gameState.movesRemaining + gameState.equipmentMovesRemaining;
  const canPlayCards = isHumanTurn && gameState.phase === 'moves' && totalMovesAvailable > 0;
  const canDiscard = isHumanTurn && gameState.phase === 'moves';
  const isDiscardPhase = isHumanTurn && gameState.phase === 'discard';
  const hasResolutionCards = humanPlayer.hand.some(c => c.type === 'resolution');
  const playerHasDisabledEquipment = humanPlayer.network.switches.some(sw => sw.isDisabled || sw.cables.some(c => c.isDisabled || c.computers.some(comp => comp.isDisabled)));
  const latestDecision = decisionHistory[decisionHistory.length - 1] || null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={preferSpecificTargets}>
        <main className="flex-grow container mx-auto px-2 md:px-4 py-2 md:py-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-2 md:mb-4">
            <Link to="/" className="inline-flex items-center gap-2 hover:opacity-80 text-sm text-accent-green">
              <ArrowLeft className="w-4 h-4" /><span className="hidden md:inline">Back</span>
            </Link>
            <div className="flex items-center gap-2">
              <Bug className="w-5 h-5 text-purple-400" />
              <h1 className="text-lg md:text-xl font-bold font-orbitron text-accent-green">AI Debug Mode</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setShowDebugPanel(!showDebugPanel)} variant="outline" size="sm" className="border-purple-500/50 text-purple-400 hover:bg-purple-900/20">
                <Brain className="w-4 h-4" /><span className="hidden md:inline ml-1">{showDebugPanel ? 'Hide' : 'Show'}</span>
              </Button>
              <Button onClick={handleNewGame} variant="outline" size="sm" className="border-accent-green text-accent-green hover:bg-accent-green/20">
                <RotateCcw className="w-4 h-4" /><span className="hidden md:inline ml-2">New</span>
              </Button>
            </div>
          </div>

          {/* Game Over */}
          {gameState.phase === 'game-over' && gameState.winner && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
              <div className="text-center p-8 bg-black/90 border-2 border-accent-green rounded-lg">
                <h2 className="text-4xl font-bold font-orbitron text-accent-green mb-4">🎉 {gameState.winner.name} Wins!</h2>
                <p className="text-xl text-white mb-6">Final Score: {gameState.winner.score} bitcoin</p>
                <Button onClick={handleNewGame} className="bg-accent-green hover:bg-accent-green/80 text-black font-bold">Play Again</Button>
              </div>
            </div>
          )}

          {/* Main Layout */}
          <div className={cn("grid gap-4", showDebugPanel ? "grid-cols-1 xl:grid-cols-[1fr_350px]" : "grid-cols-1 lg:grid-cols-[1fr_1fr_250px]")}>
            {/* Game Area */}
            <div className={cn(showDebugPanel ? "" : "lg:col-span-2")}>
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-4">
                {/* Human Player */}
                <PlayerSection
                  player={humanPlayer} isHuman={true} isCurrentTurn={isHumanTurn} canPlayCards={canPlayCards}
                  canDiscard={canDiscard} isDiscardPhase={isDiscardPhase} hasResolutionCards={hasResolutionCards}
                  hasDisabledEquipment={playerHasDisabledEquipment} discardPile={gameState.discardPile}
                  connectedComputers={countConnectedComputers(humanPlayer.network)} playerId="player-1"
                  gamePhase={gameState.phase} movesRemaining={gameState.movesRemaining}
                  equipmentMovesRemaining={gameState.equipmentMovesRemaining} onEndPhase={endPhase}
                  isDragging={activeCard !== null} isWinning={humanPlayer.score > computerPlayer.score}
                  opponentScore={computerPlayer.score} aiDifficulty={aiDifficulty}
                />
                {/* Opponent */}
                <PlayerSection
                  player={computerPlayer} isHuman={false} isCurrentTurn={!isHumanTurn} canPlayCards={false}
                  canDiscard={false} isDiscardPhase={false} hasResolutionCards={false} hasDisabledEquipment={false}
                  discardPile={[]} connectedComputers={countConnectedComputers(computerPlayer.network)}
                  playerId="player-2" gamePhase={gameState.phase} isWinning={computerPlayer.score > humanPlayer.score}
                  opponentScore={humanPlayer.score} humanCanPlayCards={canPlayCards}
                />
              </div>
              
              {/* AI Log + Deck */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <AILogPanel actions={gameState.aiLastTurnActions} />
                <div className="bg-gray-900/60 rounded-lg border border-gray-700 p-4">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 text-center">Card Piles</h3>
                  <DeckIndicator deckCount={gameState.drawPile.length} discardCount={gameState.discardPile.length} />
                </div>
              </div>
            </div>

            {/* Debug Panel */}
            {showDebugPanel && (
              <div className="flex flex-col gap-4">
                <div className="h-[350px]">
                  <AIThoughtPanel gameState={gameState} difficulty={aiDifficulty} lastDecision={latestDecision} />
                </div>
                <div className="flex-1 bg-gray-900/60 rounded-lg border border-gray-700">
                  <div className="px-3 py-2 border-b border-gray-700/50">
                    <h3 className="text-sm font-semibold text-muted-foreground">History ({decisionHistory.length})</h3>
                  </div>
                  <ScrollArea className="h-[200px] p-3">
                    {decisionHistory.length === 0 ? (
                      <div className="text-center text-muted-foreground py-4 text-sm"><Brain className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>AI decisions will appear here...</p></div>
                    ) : (
                      <div className="space-y-2">
                        {[...decisionHistory].reverse().slice(0, 15).map((d, idx) => (
                          <div key={d.timestamp} className={cn("p-2 rounded border text-xs", idx === 0 ? "bg-green-900/20 border-green-500/30" : "bg-gray-800/50 border-gray-700/50")}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-muted-foreground">T{d.turn} M{d.movesRemaining}</span>
                              {d.profile && <span className={cn("px-1 py-0.5 rounded text-[10px]", d.profile.aggression === 'aggressive' && "bg-red-900/50 text-red-300", d.profile.aggression === 'passive' && "bg-blue-900/50 text-blue-300", d.profile.aggression === 'balanced' && "bg-gray-700/50 text-gray-300")}>{d.profile.aggression}</span>}
                            </div>
                            {d.action ? (
                              <div>
                                <span className="text-foreground font-medium">{d.action.type}</span>
                                {d.action.card && <span className="text-muted-foreground ml-1">"{d.action.card.name}"</span>}
                                <div className="text-muted-foreground">Utility: <span className="text-accent-green">{d.action.utility.toFixed(1)}</span></div>
                              </div>
                            ) : <span className="text-muted-foreground italic">No action</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </div>
            )}

            {/* Right Column when no debug */}
            {!showDebugPanel && (
              <div className="flex flex-col gap-4">
                <AILogPanel actions={gameState.aiLastTurnActions} />
                <div className="bg-gray-900/60 rounded-lg border border-gray-700 p-4">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 text-center">Card Piles</h3>
                  <DeckIndicator deckCount={gameState.drawPile.length} discardCount={gameState.discardPile.length} />
                </div>
              </div>
            )}
          </div>

          <AICardPlayAnimation card={aiCardAnimation.card} action={aiCardAnimation.action} onComplete={() => setAICardAnimation({ card: null, action: null })} />
        </main>

        <DragOverlay>
          {activeCard && (
            <div className="w-24 h-32 rounded-lg border-2 border-yellow-400 overflow-hidden shadow-2xl rotate-6">
              <img src={activeCard.image} alt={activeCard.name} className="w-full h-full object-contain bg-black" />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Mobile Selection Bar */}
      {isMobile && selectedCard && (
        <MobileSelectionBar selectedCard={selectedCard} selectedCardSource={selectedCardSource} onCancel={clearSelection} />
      )}

      {/* Dialogs */}
      {connectDialog && gameState && (
        <ConnectComputersDialog isOpen={connectDialog.isOpen} onClose={() => setConnectDialog(null)} floatingComputers={gameState.players[0].network.floatingComputers} maxConnections={connectDialog.maxConnections} cableType={connectDialog.cableType}
          onConfirm={(ids) => { if (ids.length > 0) connectFloatingComputersToCable(connectDialog.cableId, ids); setConnectDialog(null); }} />
      )}
      {cableDialog && gameState && (
        <ConnectCablesDialog isOpen={cableDialog.isOpen} onClose={() => setCableDialog(null)} floatingCables={gameState.players[0].network.floatingCables}
          onConfirm={(ids) => { if (ids.length > 0) connectFloatingCablesToSwitch(cableDialog.switchId, ids); setCableDialog(null); }} />
      )}
      {stealDialog && gameState && (
        <StealClassificationDialog isOpen={stealDialog.isOpen} onClose={() => setStealDialog(null)} opponentClassifications={gameState.players[1].classificationCards} playerClassifications={gameState.players[0].classificationCards} cardName={stealDialog.cardName}
          onSteal={(targetId, discardId) => {
            const stolenCard = gameState.players[1].classificationCards.find(c => c.id === targetId);
            const discardedCard = discardId ? gameState.players[0].classificationCards.find(c => c.id === discardId) : undefined;
            const success = playClassification(stealDialog.cardId, targetId, discardId);
            if (success) {
              toast.success(`${stealDialog.cardName} used!`);
              if (discardedCard && stolenCard) triggerEvent('classification-swap', 'Classification Swapped!', { stolenCardImage: stolenCard.card.image, stolenCardName: stolenCard.card.name, discardedCardImage: discardedCard.card.image, discardedCardName: discardedCard.card.name });
              else triggerEvent('head-hunter', 'Classification Stolen!');
            }
            setStealDialog(null);
          }} />
      )}
      {gameState?.phase === 'audit' && gameState?.auditBattle?.phase === 'counter' && (
        <AuditDialog isOpen={true} auditBattle={gameState.auditBattle} players={gameState.players} currentPlayerId={humanPlayer.id} onPlayCard={respondToAudit} onPass={passAudit} />
      )}
      {gameState?.phase === 'headhunter-battle' && gameState?.headHunterBattle && (
        <HeadHunterBattleDialog isOpen={true} battle={gameState.headHunterBattle} players={gameState.players} currentPlayerId={humanPlayer.id} onPlayCard={respondToHeadHunterBattle} onPass={passHeadHunterBattle} />
      )}
      {gameState?.phase === 'audit' && gameState?.auditBattle?.phase === 'selection' && (
        <AuditComputerSelectionDialog isOpen={true} auditBattle={gameState.auditBattle} players={gameState.players} currentPlayerId={humanPlayer.id} onToggleSelection={toggleAuditComputerSelection} onConfirm={confirmAuditSelection} />
      )}
      {placementChoiceDialog && gameState && (
        <PlacementChoiceDialog isOpen={placementChoiceDialog.isOpen} cardType={placementChoiceDialog.cardType} cardImage={placementChoiceDialog.card.image} cardName={placementChoiceDialog.card.name}
          availableTargets={placementChoiceDialog.cardType === 'cable' ? switchesToPlacementTargets(gameState.players[0].network.switches) : cablesToPlacementTargets(gameState.players[0].network.switches, gameState.players[0].network.floatingCables)}
          onPlaceFloating={() => { placementChoiceDialog.pendingAction(); setPlacementChoiceDialog(null); }}
          onConnectTo={(targetId) => {
            if (placementChoiceDialog.cardType === 'cable') {
              const result = playCable(placementChoiceDialog.card.id, targetId);
              if (result.success) {
                toast.success('Cable connected!');
                const hp = gameState.players[0];
                if (hp.network.floatingComputers.length > 0 && result.cableId && result.maxComputers) {
                  setConnectDialog({ isOpen: true, cableId: result.cableId, maxConnections: result.maxComputers, cableType: placementChoiceDialog.card.subtype });
                }
              }
            } else { playComputer(placementChoiceDialog.card.id, targetId); toast.success('Computer connected!'); }
            setPlacementChoiceDialog(null);
          }}
          onCancel={() => setPlacementChoiceDialog(null)} />
      )}
      {reconnectDialog && gameState && (
        <ReconnectEquipmentDialog isOpen={reconnectDialog.isOpen} equipmentType={reconnectDialog.equipmentType} equipmentImage={reconnectDialog.equipmentImage} equipmentName={reconnectDialog.equipmentName}
          availableTargets={reconnectDialog.equipmentType === 'cable' ? switchesToReconnectTargets(gameState.players[0].network.switches) : cablesToReconnectTargets(gameState.players[0].network.switches, gameState.players[0].network.floatingCables)}
          onReconnect={(targetId) => {
            if (reconnectDialog.equipmentType === 'cable') {
              moveEquipment('floating-cable', reconnectDialog.equipmentId, 'switch', targetId);
              toast.success('Cable connected!');
              const hp = gameState.players[0];
              const fc = hp.network.floatingCables.find(c => c.id === reconnectDialog.equipmentId);
              if (fc && hp.network.floatingComputers.length > 0) {
                setConnectDialog({ isOpen: true, cableId: reconnectDialog.equipmentId, maxConnections: fc.maxComputers - fc.computers.length, cableType: fc.card.subtype });
              }
            } else { moveEquipment('floating-computer', reconnectDialog.equipmentId, 'cable', targetId); toast.success('Computer connected!'); }
            setReconnectDialog(null);
          }}
          onCancel={() => setReconnectDialog(null)} />
      )}
      {replaceClassDialog && gameState && (
        <ReplaceClassificationDialog isOpen={replaceClassDialog.isOpen} newCard={replaceClassDialog.newCard} existingClassifications={gameState.players[0].classificationCards}
          onReplace={(discardId) => {
            const success = playClassification(replaceClassDialog.newCard.id, undefined, discardId);
            if (success) toast.success(`${replaceClassDialog.newCard.name} activated!`);
            setReplaceClassDialog(null);
          }}
          onCancel={() => setReplaceClassDialog(null)} />
      )}

      <GameEventAnimation event={currentEvent?.type || null} message={currentEvent?.message} swapData={currentEvent?.swapData} onComplete={clearEvent} />
      <DifficultySelector isOpen={showDifficultySelector} onSelect={handleStartGame} onClose={() => setShowDifficultySelector(false)} />
      <Footer />
    </div>
  );
};

const SimulationLog = () => (
  <MobileGameProvider>
    <SimulationLogContent />
  </MobileGameProvider>
);

export default SimulationLog;
