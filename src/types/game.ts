// Card Types
export type CardType = 'equipment' | 'attack' | 'resolution' | 'classification';
export type EquipmentType = 'switch' | 'cable-2' | 'cable-3' | 'computer';
export type AttackType = 'hacked' | 'power-outage' | 'new-hire' | 'audit';
export type ResolutionType = 'secured' | 'powered' | 'trained' | 'helpdesk';
export type ClassificationType = 'security-specialist' | 'facilities' | 'supervisor' | 'field-tech' | 'head-hunter' | 'seal-the-deal';

export interface Card {
  id: string;
  type: CardType;
  subtype: EquipmentType | AttackType | ResolutionType | ClassificationType;
  name: string;
  image: string;
  description: string;
}

// Network structure
export interface PlacedCard {
  card: Card;
  id: string; // Unique placement ID
  attachedIssues: Card[]; // Attack cards placed on this equipment
  isDisabled: boolean;
}

export interface CableNode extends PlacedCard {
  maxComputers: 2 | 3;
  computers: PlacedCard[];
}

export interface SwitchNode extends PlacedCard {
  cables: CableNode[];
}

// Floating equipment types (not yet connected to internet)
export interface FloatingCable extends CableNode {
  // Inherits maxComputers and computers - cables can have computers even when floating
}

export interface PlayerNetwork {
  switches: SwitchNode[]; // Connected to internet
  floatingCables: FloatingCable[]; // Cables not connected to any switch
  floatingComputers: PlacedCard[]; // Computers not connected to any cable
}

// Player state
export interface Player {
  id: string;
  name: string;
  hand: Card[];
  auditedComputers: Card[]; // Computers returned via audit - shown separately, allow overflow
  network: PlayerNetwork;
  classificationCards: PlacedCard[]; // Max 2 in play
  score: number;
  isHuman: boolean;
}

// Game phases
export type GamePhase = 'trade' | 'moves' | 'discard' | 'draw' | 'score' | 'game-over' | 'audit' | 'headhunter-battle';

// Audit battle state (for the back-and-forth blocking)
export interface AuditBattle {
  auditorIndex: number; // Player who initiated audit
  targetIndex: number; // Player being audited
  auditCardId: string; // The audit card being used
  chain: { playerId: number; card: Card }[]; // Chain of Hacked/Secured cards played
  currentTurn: number; // Which player needs to respond (0 = target can block, 1 = auditor can counter, etc.)
  computersToReturn: number; // How many computers will be returned if audit succeeds
  phase: 'counter' | 'selection'; // 'counter' = back-and-forth, 'selection' = attacker picks computers
  availableComputers?: { id: string; card: Card; location: string }[]; // Computers available for selection
  selectedComputerIds?: string[]; // IDs of computers selected for removal
}

// Head Hunter battle state (for the back-and-forth blocking with Head Hunters from hand)
export interface HeadHunterBattle {
  attackerIndex: number; // Player who initiated the Head Hunter attack
  defenderIndex: number; // Player being targeted
  initialHeadHunterCardId: string; // The Head Hunter card that started the battle
  targetClassificationId: string; // Which classification is being stolen
  chain: { playerId: number; card: Card }[]; // Chain of Head Hunter cards played
  previousPhase: GamePhase; // Phase to return to if battle ends
  previousMovesRemaining: number; // Moves to restore when returning to previous phase
}

// AI Action tracking
export interface AIAction {
  type: 'play' | 'attack' | 'resolve' | 'discard' | 'classification' | 'steal';
  card: Card;
  target?: string; // Description of target
  blocked?: boolean; // If attack was blocked
}

// Game state
export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  phase: GamePhase;
  movesRemaining: number;
  drawPile: Card[];
  discardPile: Card[];
  turnNumber: number;
  winner: Player | null;
  gameLog: string[];
  aiLastTurnActions: AIAction[]; // Track AI's last turn moves
  auditBattle?: AuditBattle; // Active audit battle state
  headHunterBattle?: HeadHunterBattle; // Active head hunter battle state
}

// Actions
export type GameAction =
  | { type: 'PLAY_SWITCH' }
  | { type: 'PLAY_CABLE'; switchId: string; cableType: 'cable-2' | 'cable-3' }
  | { type: 'PLAY_COMPUTER'; cableId: string }
  | { type: 'DISCARD_CARD'; cardId: string }
  | { type: 'DRAW_CARDS' }
  | { type: 'END_PHASE' }
  | { type: 'NEXT_TURN' };
