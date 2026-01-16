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
  network: PlayerNetwork;
  classificationCards: PlacedCard[]; // Max 2 in play
  score: number;
  isHuman: boolean;
}

// Game phases
export type GamePhase = 'trade' | 'moves' | 'discard' | 'draw' | 'score' | 'game-over';

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
