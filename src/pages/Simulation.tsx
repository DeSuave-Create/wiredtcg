import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw } from 'lucide-react';
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
import { PlacementChoiceDialog, switchesToPlacementTargets, cablesToPlacementTargets } from '@/components/game/PlacementChoiceDialog';
import { AuditComputerSelectionDialog } from '@/components/game/AuditComputerSelectionDialog';
import { GameEventAnimation, useGameEventAnimation } from '@/components/game/GameEventAnimations';
import { DifficultySelector } from '@/components/game/DifficultySelector';
import { SimulationIntro } from '@/components/game/SimulationIntro';
import { AIDifficulty } from '@/utils/ai';
import { Card } from '@/types/game';
import { toast } from 'sonner';

// Custom collision detection that prefers specific targets over board zones
const preferSpecificTargets: CollisionDetection = (args) => {
  const collisions = pointerWithin(args);
  
  if (collisions.length <= 1) {
    return collisions;
  }
  
  // Sort to prefer specific targets (switch, cable, floating-cable) over board
  const sorted = [...collisions].sort((a, b) => {
    const aId = String(a.id);
    const bId = String(b.id);
    
    // Board zones should have lowest priority
    const aIsBoard = aId.includes('-board');
    const bIsBoard = bId.includes('-board');
    
    if (aIsBoard && !bIsBoard) return 1;  // a goes after b
    if (!aIsBoard && bIsBoard) return -1; // a goes before b
    
    return 0;
  });
  
  // Return only the highest priority collision
  return sorted.slice(0, 1);
};

const Simulation = () => {
  const navigate = useNavigate();
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
    aiDifficulty,
  } = useGameEngine();
  
  // Animation hook for game events
  const { currentEvent, triggerEvent, clearEvent } = useGameEventAnimation();

  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [activePlacedCard, setActivePlacedCard] = useState<{
    card: Card;
    sourceType: 'switch' | 'cable' | 'computer' | 'floating-cable' | 'floating-computer';
    sourceId: string;
    parentId?: string;
  } | null>(null);
  
  // Dialog state for connecting floating computers
  const [connectDialog, setConnectDialog] = useState<{
    isOpen: boolean;
    cableId: string;
    maxConnections: number;
    cableType: string;
  } | null>(null);
  
  // Dialog state for connecting floating cables to a new switch
  const [cableDialog, setCableDialog] = useState<{
    isOpen: boolean;
    switchId: string;
  } | null>(null);
  
  // Dialog state for stealing classifications
  const [stealDialog, setStealDialog] = useState<{
    isOpen: boolean;
    cardId: string;
    cardName: string;
  } | null>(null);
  
  // Dialog state for placement choice (cable or computer)
  const [placementChoiceDialog, setPlacementChoiceDialog] = useState<{
    isOpen: boolean;
    cardType: 'cable' | 'computer';
    card: Card;
    pendingAction: () => void; // Action to place floating
  } | null>(null);
  
  // Check if intro was already shown this session
  const hasSeenIntro = sessionStorage.getItem('hasSeenIntro') === 'true';
  
  // Intro animation state
  const [showIntro, setShowIntro] = useState(!hasSeenIntro);
  
  // Transition state for smooth fade between intro and difficulty selector
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Difficulty selector dialog state - show immediately if intro was already seen
  const [showDifficultySelector, setShowDifficultySelector] = useState(hasSeenIntro);

  const handleIntroComplete = () => {
    sessionStorage.setItem('hasSeenIntro', 'true');
    setIsTransitioning(true);
    setShowIntro(false);
    setShowDifficultySelector(true);
  };

  // Start new game with selected difficulty
  const handleStartGame = useCallback((difficulty: AIDifficulty) => {
    initializeGame('You', difficulty);
    setShowDifficultySelector(false);
    toast.success(`Game started! AI difficulty: ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`);
  }, [initializeGame]);

  // Handle new game button click
  const handleNewGame = useCallback(() => {
    setShowDifficultySelector(true);
  }, []);

  // Navigate to home if difficulty selector is closed without starting a game
  useEffect(() => {
    if (!gameState && !showDifficultySelector && !showIntro) {
      navigate('/');
    }
  }, [gameState, showDifficultySelector, showIntro, navigate]);

  // Track previous classifications to detect steals
  const [prevHumanClassCount, setPrevHumanClassCount] = useState<number>(0);

  // Execute AI turn when it's computer's turn
  useEffect(() => {
    if (!gameState) return;
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (!currentPlayer.isHuman && gameState.phase !== 'game-over' && gameState.phase !== 'audit') {
      const timer = setTimeout(() => {
        executeAITurn();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState?.currentPlayerIndex, gameState?.phase, executeAITurn]);

  // Handle AI response in audit battles (counter phase)
  useEffect(() => {
    if (!gameState || gameState.phase !== 'audit' || !gameState.auditBattle) return;
    if (gameState.auditBattle.phase !== 'counter') return;
    
    const battle = gameState.auditBattle;
    const isTargetTurn = battle.chain.length % 2 === 0;
    const respondingPlayerIndex = isTargetTurn ? battle.targetIndex : battle.auditorIndex;
    const respondingPlayer = gameState.players[respondingPlayerIndex];
    
    // Only act if it's AI's turn to respond
    if (!respondingPlayer.isHuman) {
      const neededType = isTargetTurn ? 'hacked' : 'secured';
      const playableCards = respondingPlayer.hand.filter(c => c.subtype === neededType);
      
      const timer = setTimeout(() => {
        if (playableCards.length > 0) {
          // AI plays a card to respond
          respondToAudit(playableCards[0].id);
          toast.info(`🤖 Computer plays ${playableCards[0].name}!`);
        } else {
          // AI passes
          passAudit();
          if (isTargetTurn) {
            toast.info('🤖 Computer accepts the audit!');
          } else {
            toast.info('🤖 Computer lets the block succeed!');
          }
        }
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [gameState?.phase, gameState?.auditBattle?.phase, gameState?.auditBattle?.chain.length, respondToAudit, passAudit]);

  // Handle AI computer selection during audit selection phase
  useEffect(() => {
    if (!gameState || gameState.phase !== 'audit' || !gameState.auditBattle) return;
    if (gameState.auditBattle.phase !== 'selection') return;
    
    const battle = gameState.auditBattle;
    const auditor = gameState.players[battle.auditorIndex];
    
    // Only act if AI is the auditor (selects computers)
    if (!auditor.isHuman) {
      const availableComputers = battle.availableComputers || [];
      const neededCount = battle.computersToReturn;
      const selectedCount = (battle.selectedComputerIds || []).length;
      
      const timer = setTimeout(() => {
        if (selectedCount < neededCount && availableComputers.length > selectedCount) {
          // AI selects next computer (prioritize connected computers first)
          const unselectedComputers = availableComputers.filter(
            c => !(battle.selectedComputerIds || []).includes(c.id)
          );
          if (unselectedComputers.length > 0) {
            // Prioritize connected computers (Switch → Cable) over floating
            const connected = unselectedComputers.find(c => c.location.includes('Switch'));
            const toSelect = connected || unselectedComputers[0];
            toggleAuditComputerSelection(toSelect.id);
          }
        } else if (selectedCount === neededCount) {
          // All selected, confirm
          confirmAuditSelection();
          toast.info(`🤖 Computer selected ${neededCount} computer(s) to return!`);
        }
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [gameState?.phase, gameState?.auditBattle?.phase, gameState?.auditBattle?.selectedComputerIds?.length, toggleAuditComputerSelection, confirmAuditSelection]);

  // Track previous game log to detect events
  const [prevLogLength, setPrevLogLength] = useState(0);

  // Detect game events and trigger animations
  useEffect(() => {
    if (!gameState) return;
    
    const logs = gameState.gameLog;
    if (logs.length > prevLogLength && prevLogLength > 0) {
      // Check new log messages for events
      const newLogs = logs.slice(prevLogLength);
      for (const log of newLogs) {
        if (log.includes('Audit successful!')) {
          triggerEvent('audit-success', 'Audit Successful!');
        } else if (log.includes('blocks the audit')) {
          triggerEvent('audit-blocked', 'Audit Blocked!');
        } else if (log.includes('steals') || log.includes('Steal')) {
          if (log.includes('Computer')) {
            // AI stole from player
            triggerEvent('head-hunter', 'Classification Stolen!');
          }
        }
      }
    }
    setPrevLogLength(logs.length);
  }, [gameState?.gameLog.length, triggerEvent]);

  // Detect when AI steals a classification and show visual feedback
  useEffect(() => {
    if (!gameState) return;
    
    const humanClassCount = gameState.players[0].classificationCards.length;
    
    // Check if human lost a classification (AI stole it)
    if (prevHumanClassCount > 0 && humanClassCount < prevHumanClassCount) {
      const lastLog = gameState.gameLog[gameState.gameLog.length - 1];
      if (lastLog?.includes('steal') || lastLog?.includes('Steal')) {
        triggerEvent('head-hunter', 'Your classification was stolen!');
      }
    }
    
    setPrevHumanClassCount(humanClassCount);
  }, [gameState?.players[0].classificationCards.length, triggerEvent]);

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current;
    const card = data?.card as Card;
    
    // Check if this is a placed card being dragged
    if (data?.isPlaced) {
      setActivePlacedCard({
        card,
        sourceType: data.sourceType,
        sourceId: data.sourceId,
        parentId: data.parentId,
      });
      setActiveCard(card);
    } else {
      setActiveCard(card);
      setActivePlacedCard(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const droppedCard = activeCard;
    const droppedPlacedCard = activePlacedCard;
    setActiveCard(null);
    setActivePlacedCard(null);
    
    const { active, over } = event;
    if (!over || !gameState) {
      // Dropped outside valid zone
      if (droppedCard && !droppedPlacedCard) {
        showCardHint(droppedCard);
      }
      return;
    }

    const data = active.data.current;
    const card = data?.card as Card;
    const dropZoneId = over.id as string;
    const dropData = over.data.current;

    if (!card) return;

    // Parse the drop zone ID
    const parts = dropZoneId.split('-');
    const targetPlayerId = parts[0] + '-' + parts[1]; // e.g., "player-1" or "player-2"
    const zoneType = parts[2]; // e.g., "internet", "switch", "cable", "computer", "discard", "floating", "board"

    const isHumanTarget = targetPlayerId === 'player-1';
    const isComputerTarget = targetPlayerId === 'player-2';
    const computerPlayerIndex = 1;
    
    // === Handle AUDITED COMPUTER being played ===
    if (data?.isAudited && isHumanTarget) {
      const auditedIndex = data.auditedIndex as number;
      let cableId: string | undefined;
      if (zoneType === 'cable') {
        cableId = dropZoneId.replace(`${targetPlayerId}-cable-`, '');
      } else if (zoneType === 'floating') {
        cableId = dropZoneId.replace(`${targetPlayerId}-floating-cable-`, '');
      }
      const success = playAuditedComputer(card.id, auditedIndex, cableId);
      if (success) {
        toast.success(cableId ? 'Audited computer reconnected!' : 'Audited computer placed (floating)');
      }
      return;
    }
    
    // === Handle PLACED CLASSIFICATION being discarded ===
    if (data?.isPlacedClassification && zoneType === 'discard' && isHumanTarget) {
      const classificationId = data.classificationId as string;
      const success = discardClassification(classificationId);
      if (success) {
        toast.success(`${card.name} discarded from board`);
      } else {
        toast.error('Failed to discard classification');
      }
      return;
    }
    
    // === Handle PLACED CARD being moved (rearranging) ===
    if (droppedPlacedCard && isHumanTarget) {
      const { sourceType, sourceId } = droppedPlacedCard;
      
      // Determine target type and ID
      let targetType: 'switch' | 'cable' | 'floating' | 'board' = 'board';
      let targetId: string | undefined;
      
      if (zoneType === 'switch') {
        targetType = 'switch';
        targetId = dropZoneId.replace(`${targetPlayerId}-switch-`, '');
      } else if (zoneType === 'cable') {
        targetType = 'cable';
        targetId = dropZoneId.replace(`${targetPlayerId}-cable-`, '');
      } else if (zoneType === 'floating') {
        targetType = 'cable';
        targetId = dropZoneId.replace(`${targetPlayerId}-floating-cable-`, '');
      } else if (zoneType === 'board' || zoneType === 'internet') {
        targetType = 'floating';
      }
      
      // Don't move to same location
      if (targetId === sourceId) {
        return;
      }
      
      moveEquipment(sourceType, sourceId, targetType, targetId);
      toast.success('Equipment moved!');
      return;
    }

    // === Handle HAND CARD being played ===
    
    // Check if this card type is accepted (only for non-placed cards)
    if (!droppedPlacedCard && dropData) {
      const accepts = dropData.accepts as string[];
      if (!accepts.includes(card.subtype)) {
        showCardHint(card);
        return;
      }
    }

    // Handle discard from hand
    if (zoneType === 'discard' && !data?.isPlacedClassification) {
      discardCard(card.id);
      toast.success('Card discarded');
      return;
    }

    // Handle equipment cards (only on own network)
    if (card.type === 'equipment' && isHumanTarget) {
      if (card.subtype === 'switch') {
        const result = playSwitch(card.id);
        if (result.success) {
          toast.success('Switch placed!');
          
          // Check if there are floating cables to connect
          const humanPlayer = gameState!.players[0];
          if (humanPlayer.network.floatingCables.length > 0 && result.switchId) {
            setCableDialog({
              isOpen: true,
              switchId: result.switchId,
            });
          }
        }
      } else if (card.subtype === 'cable-2' || card.subtype === 'cable-3') {
        // If dropped on a switch, connect to it directly
        if (zoneType === 'switch') {
          const switchId = dropZoneId.replace(`${targetPlayerId}-switch-`, '');
          const result = playCable(card.id, switchId);
          
          if (result.success) {
            toast.success('Cable connected to switch!');
            
            // Check if there are floating computers to connect
            const humanPlayer = gameState!.players[0];
            if (humanPlayer.network.floatingComputers.length > 0 && result.cableId && result.maxComputers) {
              setConnectDialog({
                isOpen: true,
                cableId: result.cableId,
                maxConnections: result.maxComputers,
                cableType: card.subtype,
              });
            }
          }
        } else {
          // Dropped on unconnected area or board - check if switches exist
          const humanPlayer = gameState!.players[0];
          const availableSwitches = humanPlayer.network.switches.filter(sw => !sw.isDisabled);
          
          if (availableSwitches.length > 0) {
            // Show placement choice dialog
            setPlacementChoiceDialog({
              isOpen: true,
              cardType: 'cable',
              card: card,
              pendingAction: () => {
                const result = playCable(card.id, undefined);
                if (result.success) {
                  toast.success('Cable placed (floating)');
                }
              },
            });
          } else {
            // No switches - just place floating
            const result = playCable(card.id, undefined);
            if (result.success) {
              toast.success('Cable placed (floating - drag onto a switch to connect)');
            }
          }
        }
      } else if (card.subtype === 'computer') {
        // If dropped on a cable (connected or floating), connect to it directly
        if (zoneType === 'cable' || zoneType === 'floating') {
          let cableId: string | undefined;
          if (zoneType === 'cable') {
            cableId = dropZoneId.replace(`${targetPlayerId}-cable-`, '');
          } else {
            cableId = dropZoneId.replace(`${targetPlayerId}-floating-cable-`, '');
          }
          playComputer(card.id, cableId);
          toast.success('Computer connected to cable!');
        } else {
          // Dropped on unconnected area or board - check if connected cables with space exist
          const humanPlayer = gameState!.players[0];
          const availableCables = cablesToPlacementTargets(
            humanPlayer.network.switches,
            humanPlayer.network.floatingCables
          );
          
          if (availableCables.length > 0) {
            // Show placement choice dialog
            setPlacementChoiceDialog({
              isOpen: true,
              cardType: 'computer',
              card: card,
              pendingAction: () => {
                playComputer(card.id, undefined);
                toast.success('Computer placed (floating)');
              },
            });
          } else {
            // No cables with space - just place floating
            playComputer(card.id, undefined);
            toast.success('Computer placed (floating - drag onto a cable to connect)');
          }
        }
      }
      return;
    }

    // Handle attack cards (on opponent's network)
    if (card.type === 'attack' && isComputerTarget) {
      // Special handling for Audit card
      if (card.subtype === 'audit') {
        // Audit can be dropped anywhere on opponent's network/board
        if (zoneType === 'board' || zoneType === 'switch' || zoneType === 'cable' || zoneType === 'computer') {
          const success = startAudit(card.id, computerPlayerIndex);
          if (success) {
            toast.info('📋 Audit initiated!');
          }
        }
        return;
      }
      
      // Regular attack cards - can target connected OR floating equipment
      let equipmentId = '';
      if (zoneType === 'switch') {
        equipmentId = dropZoneId.replace(`${targetPlayerId}-switch-`, '');
      } else if (zoneType === 'cable') {
        // Check if it's a floating cable first
        if (dropZoneId.includes('floating-cable')) {
          equipmentId = dropZoneId.replace(`${targetPlayerId}-floating-cable-`, '');
        } else {
          equipmentId = dropZoneId.replace(`${targetPlayerId}-cable-`, '');
        }
      } else if (zoneType === 'computer') {
        equipmentId = dropZoneId.replace(`${targetPlayerId}-computer-`, '');
      } else if (zoneType === 'floating') {
        // Handle floating equipment dropped on floating zone
        if (dropZoneId.includes('floating-cable')) {
          equipmentId = dropZoneId.replace(`${targetPlayerId}-floating-cable-`, '');
        } else if (dropZoneId.includes('floating-computer')) {
          equipmentId = dropZoneId.replace(`${targetPlayerId}-floating-computer-`, '');
        }
      }
      
      if (equipmentId) {
        playAttack(card.id, equipmentId, computerPlayerIndex);
        toast.success(`${card.name} attack played!`);
      } else if (zoneType === 'board') {
        toast.error('Drop on specific equipment to attack!');
      }
      return;
    }

    // Handle resolution cards (on own network)
    if (card.type === 'resolution' && isHumanTarget) {
      let equipmentId = '';
      if (zoneType === 'switch') {
        equipmentId = dropZoneId.replace(`${targetPlayerId}-switch-`, '');
      } else if (zoneType === 'cable') {
        equipmentId = dropZoneId.replace(`${targetPlayerId}-cable-`, '');
      } else if (zoneType === 'computer') {
        equipmentId = dropZoneId.replace(`${targetPlayerId}-computer-`, '');
      }
      
      if (equipmentId) {
        playResolution(card.id, equipmentId);
        toast.success('Issue resolved!');
      }
      return;
    }

    // Handle classification cards
    if (card.type === 'classification' && zoneType === 'classification') {
      // Head Hunter and Seal the Deal - must target OPPONENT's classification zone
      if (card.subtype === 'head-hunter' || card.subtype === 'seal-the-deal') {
        if (!isComputerTarget) {
          toast.error(`${card.name} must be used on opponent's classifications!`);
          return;
        }
        
        const computerPlayer = gameState.players[1];
        const humanPlayer = gameState.players[0];
        
        if (computerPlayer.classificationCards.length === 0) {
          toast.error("Opponent has no classifications to steal!");
          return;
        }
        
        // Check if there are any stealable classifications (player doesn't already have the type)
        const stealable = computerPlayer.classificationCards.filter(oppClass => 
          !humanPlayer.classificationCards.some(c => c.card.subtype === oppClass.card.subtype)
        );
        
        if (stealable.length === 0) {
          toast.error("Can't steal - you already have the same classification types!");
          return;
        }
        
        // Open the steal dialog
        setStealDialog({
          isOpen: true,
          cardId: card.id,
          cardName: card.name,
        });
        return;
      }
      
      // Regular classifications (Field Tech, Supervisor, etc.) - on OWN zone only
      if (!isHumanTarget) {
        toast.error(`${card.name} must be placed on your own classification zone!`);
        return;
      }
      
      const humanPlayer = gameState.players[0];
      
      // Check if already at max classifications
      if (humanPlayer.classificationCards.length >= 2) {
        toast.error("Maximum 2 classification cards in play!");
        return;
      }
      
      const success = playClassification(card.id);
      if (success) {
        // Check if this creates a duplicate pair (steal protection)
        const updatedClassifications = [...humanPlayer.classificationCards, { card }];
        const hasDuplicate = updatedClassifications.filter(c => c.card.subtype === card.subtype).length >= 2;
        if (hasDuplicate) {
          toast.success(`${card.name} is now active! 🛡️ Duplicate protection active!`);
        } else {
          toast.success(`${card.name} is now active!`);
        }
      } else {
        toast.error(`Failed to play ${card.name}!`);
      }
      return;
    }
  };

  // Show helpful hint based on card type
  const showCardHint = (card: Card) => {
    const hints: Record<string, string> = {
      'switch': '🔌 Drag Switch to your network board',
      'cable-2': '🔗 Drag Cable to the board OR drop on a Switch to connect',
      'cable-3': '🔗 Drag Cable to the board OR drop on a Switch to connect',
      'computer': '💻 Drag Computer to the board OR drop on a Cable to connect',
      'hacked': '⚡ Drag attack cards to OPPONENT\'s equipment',
      'power-outage': '⚡ Drag attack cards to OPPONENT\'s equipment',
      'new-hire': '⚡ Drag attack cards to OPPONENT\'s equipment',
      'audit': '📋 Drag Audit to OPPONENT\'s network to audit them!',
      'secured': '🔧 Drag to YOUR disabled equipment with Hacked issue',
      'powered': '🔧 Drag to YOUR disabled equipment with Power Outage issue',
      'trained': '🔧 Drag to YOUR disabled equipment with New Hire issue',
      'helpdesk': '🔧 Drag to YOUR disabled equipment to fix ALL issues',
      'security-specialist': '🎖️ Drag to YOUR classification zone (auto-resolves Hacked)',
      'facilities': '🎖️ Drag to YOUR classification zone (auto-resolves Power Outage)',
      'supervisor': '🎖️ Drag to YOUR classification zone (auto-resolves New Hire)',
      'field-tech': '🎖️ Drag to YOUR classification zone (+1 move/turn)',
      'head-hunter': '🎯 Drag to OPPONENT\'s classification zone to steal!',
      'seal-the-deal': '💎 Drag to OPPONENT\'s classification zone (unblockable steal)!',
    };
    
    const hint = hints[card.subtype] || `Cannot place ${card.name} here`;
    toast.info(hint, { duration: 3000 });
  };


  // Show intro animation first, then difficulty selector (only if not seen this session)
  if (showIntro) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <SimulationIntro onComplete={handleIntroComplete} />
      </div>
    );
  }

  // After intro, if game not started, show difficulty selector with fade-in
  if (!gameState) {
    // If difficulty selector is closed, useEffect above will handle navigation
    if (!showDifficultySelector) {
      return null;
    }
    
    return (
      <div className="min-h-screen flex flex-col bg-background relative">
        {/* Fade overlay that disappears */}
        <div 
          className={`fixed inset-0 bg-black z-40 pointer-events-none transition-opacity duration-700 ease-out ${
            isTransitioning ? 'opacity-100' : 'opacity-0'
          }`}
          onTransitionEnd={() => setIsTransitioning(false)}
        />
        
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <DifficultySelector
            isOpen={showDifficultySelector}
            onSelect={handleStartGame}
            onClose={() => setShowDifficultySelector(false)}
          />
        </div>
        <Footer />
      </div>
    );
  }

  const humanPlayer = gameState.players[0];
  const computerPlayer = gameState.players[1];
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isHumanTurn = currentPlayer.isHuman;
  const canPlayCards = isHumanTurn && gameState.phase === 'moves' && gameState.movesRemaining > 0;
  const canDiscard = isHumanTurn && gameState.phase === 'moves'; // Can always discard during your turn
  const isDiscardPhase = isHumanTurn && gameState.phase === 'discard';
  
  // Check if player has resolution cards
  const hasResolutionCards = humanPlayer.hand.some(c => c.type === 'resolution');
  
  // Check if opponent has equipment with issues that need resolving
  const playerHasDisabledEquipment = humanPlayer.network.switches.some(sw => 
    sw.attachedIssues.length > 0 || 
    sw.cables.some(c => c.attachedIssues.length > 0 || c.computers.some(comp => comp.attachedIssues.length > 0))
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <DndContext 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        collisionDetection={preferSpecificTargets}
      >
        <main className="flex-grow container mx-auto px-4 py-4">
          {/* Header with title and controls */}
          <div className="flex items-center justify-between mb-4">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 hover:opacity-80 transition-colors text-sm"
              style={{ color: 'hsl(var(--accent-green))' }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            
            <h1 className="text-2xl font-bold font-orbitron text-accent-green">
              WIRED Simulator
            </h1>
            
            <Button
              onClick={handleNewGame}
              variant="outline"
              size="sm"
              className="border-accent-green text-accent-green hover:bg-accent-green/20"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              New Game
            </Button>
          </div>

          {/* Game Over overlay */}
          {gameState.phase === 'game-over' && gameState.winner && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
              <div className="text-center p-8 bg-black/90 border-2 border-accent-green rounded-lg">
                <h2 className="text-4xl font-bold font-orbitron text-accent-green mb-4">
                  🎉 {gameState.winner.name} Wins!
                </h2>
                <p className="text-xl text-white mb-6">
                  Final Score: {gameState.winner.score} bitcoin
                </p>
                <Button
                  onClick={handleNewGame}
                  className="bg-accent-green hover:bg-accent-green/80 text-black font-bold"
                >
                  Play Again
                </Button>
              </div>
            </div>
          )}

          {/* Main 3-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_250px] gap-4">
            {/* Player Section - Left */}
            <PlayerSection
              player={humanPlayer}
              isHuman={true}
              isCurrentTurn={isHumanTurn}
              canPlayCards={canPlayCards}
              canDiscard={canDiscard}
              isDiscardPhase={isDiscardPhase}
              hasResolutionCards={hasResolutionCards}
              hasDisabledEquipment={playerHasDisabledEquipment}
              discardPile={gameState.discardPile}
              connectedComputers={countConnectedComputers(humanPlayer.network)}
              playerId="player-1"
              gamePhase={gameState.phase}
              movesRemaining={gameState.movesRemaining}
              onEndPhase={endPhase}
              isDragging={activeCard !== null}
              isWinning={humanPlayer.score > computerPlayer.score}
              opponentScore={computerPlayer.score}
            />

            {/* Opponent Section - Center */}
            <PlayerSection
              player={computerPlayer}
              isHuman={false}
              isCurrentTurn={!isHumanTurn}
              canPlayCards={false}
              canDiscard={false}
              isDiscardPhase={false}
              hasResolutionCards={false}
              hasDisabledEquipment={false}
              discardPile={[]}
              connectedComputers={countConnectedComputers(computerPlayer.network)}
              playerId="player-2"
              gamePhase={gameState.phase}
              isWinning={computerPlayer.score > humanPlayer.score}
              opponentScore={humanPlayer.score}
              humanCanPlayCards={canPlayCards}
            />

            {/* AI Log Panel - Right */}
            <AILogPanel actions={gameState.aiLastTurnActions} />
          </div>
        </main>

        {/* Drag overlay - shows the card being dragged */}
        <DragOverlay>
          {activeCard && (
            <div className="w-24 h-32 rounded-lg border-2 border-yellow-400 overflow-hidden shadow-2xl rotate-6">
              <img 
                src={activeCard.image} 
                alt={activeCard.name}
                className="w-full h-full object-contain bg-black"
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Connect Computers Dialog */}
      {connectDialog && gameState && (
        <ConnectComputersDialog
          isOpen={connectDialog.isOpen}
          onClose={() => setConnectDialog(null)}
          floatingComputers={gameState.players[0].network.floatingComputers}
          maxConnections={connectDialog.maxConnections}
          cableType={connectDialog.cableType}
          onConfirm={(selectedIds) => {
            if (selectedIds.length > 0) {
              connectFloatingComputersToCable(connectDialog.cableId, selectedIds);
            }
            setConnectDialog(null);
          }}
        />
      )}
      
      {/* Connect Cables Dialog */}
      {cableDialog && gameState && (
        <ConnectCablesDialog
          isOpen={cableDialog.isOpen}
          onClose={() => setCableDialog(null)}
          floatingCables={gameState.players[0].network.floatingCables}
          onConfirm={(selectedIds) => {
            if (selectedIds.length > 0) {
              connectFloatingCablesToSwitch(cableDialog.switchId, selectedIds);
            }
            setCableDialog(null);
          }}
        />
      )}
      
      {/* Steal Classification Dialog */}
      {stealDialog && gameState && (
        <StealClassificationDialog
          isOpen={stealDialog.isOpen}
          onClose={() => setStealDialog(null)}
          opponentClassifications={gameState.players[1].classificationCards}
          playerClassifications={gameState.players[0].classificationCards}
          cardName={stealDialog.cardName}
          onSteal={(targetId, discardId) => {
            // Capture card data before the action
            const stolenCard = gameState.players[1].classificationCards.find(c => c.id === targetId);
            const discardedCard = discardId 
              ? gameState.players[0].classificationCards.find(c => c.id === discardId)
              : undefined;
            
            const success = playClassification(stealDialog.cardId, targetId, discardId);
            if (success) {
              toast.success(`${stealDialog.cardName} used!`);
              
              // Trigger swap animation if swapping, otherwise regular steal animation
              if (discardedCard && stolenCard) {
                triggerEvent('classification-swap', 'Classification Swapped!', {
                  stolenCardImage: stolenCard.card.image,
                  stolenCardName: stolenCard.card.name,
                  discardedCardImage: discardedCard.card.image,
                  discardedCardName: discardedCard.card.name,
                });
              } else {
                triggerEvent('head-hunter', 'Classification Stolen!');
              }
            }
            setStealDialog(null);
          }}
        />
      )}
      
      {/* Audit Battle Counter Dialog - shown during counter phase */}
      {gameState && gameState.phase === 'audit' && gameState.auditBattle && gameState.auditBattle.phase === 'counter' && (
        <AuditDialog
          isOpen={true}
          auditBattle={gameState.auditBattle}
          players={gameState.players}
          currentPlayerId={humanPlayer.id}
          onPlayCard={(cardId) => {
            respondToAudit(cardId);
          }}
          onPass={() => {
            passAudit();
          }}
        />
      )}
      
      {/* Audit Computer Selection Dialog - shown during selection phase */}
      {gameState && gameState.phase === 'audit' && gameState.auditBattle && gameState.auditBattle.phase === 'selection' && (
        <AuditComputerSelectionDialog
          isOpen={true}
          auditBattle={gameState.auditBattle}
          players={gameState.players}
          currentPlayerId={humanPlayer.id}
          onToggleSelection={(computerId) => {
            toggleAuditComputerSelection(computerId);
          }}
          onConfirm={() => {
            confirmAuditSelection();
          }}
        />
      )}

      {/* Placement Choice Dialog - cable or computer placement */}
      {placementChoiceDialog && gameState && (
        <PlacementChoiceDialog
          isOpen={placementChoiceDialog.isOpen}
          cardType={placementChoiceDialog.cardType}
          cardImage={placementChoiceDialog.card.image}
          cardName={placementChoiceDialog.card.name}
          availableTargets={
            placementChoiceDialog.cardType === 'cable'
              ? switchesToPlacementTargets(gameState.players[0].network.switches)
              : cablesToPlacementTargets(
                  gameState.players[0].network.switches,
                  gameState.players[0].network.floatingCables
                )
          }
          onPlaceFloating={() => {
            placementChoiceDialog.pendingAction();
            setPlacementChoiceDialog(null);
          }}
          onConnectTo={(targetId) => {
            if (placementChoiceDialog.cardType === 'cable') {
              const result = playCable(placementChoiceDialog.card.id, targetId);
              if (result.success) {
                toast.success('Cable connected to switch!');
                // Check for floating computers to connect
                const humanPlayer = gameState.players[0];
                if (humanPlayer.network.floatingComputers.length > 0 && result.cableId && result.maxComputers) {
                  setConnectDialog({
                    isOpen: true,
                    cableId: result.cableId,
                    maxConnections: result.maxComputers,
                    cableType: placementChoiceDialog.card.subtype,
                  });
                }
              }
            } else {
              playComputer(placementChoiceDialog.card.id, targetId);
              toast.success('Computer connected to cable!');
            }
            setPlacementChoiceDialog(null);
          }}
          onCancel={() => setPlacementChoiceDialog(null)}
        />
      )}

      {/* Game Event Animation Overlay */}
      <GameEventAnimation 
        event={currentEvent?.type || null}
        message={currentEvent?.message}
        swapData={currentEvent?.swapData}
        onComplete={clearEvent}
      />

      {/* Intro Animation - handled in early return above */}

      {/* Difficulty Selector Dialog */}
      <DifficultySelector
        isOpen={showDifficultySelector}
        onSelect={handleStartGame}
        onClose={() => setShowDifficultySelector(false)}
      />

      <Footer />
    </div>
  );
};

export default Simulation;
