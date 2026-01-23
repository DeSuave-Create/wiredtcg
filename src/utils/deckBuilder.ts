import { Card, CardType, EquipmentType, AttackType, ResolutionType, ClassificationType } from '@/types/game';

// Card definitions with images
const cardDefinitions: Record<string, { type: CardType; subtype: string; name: string; image: string; description: string }> = {
  // Equipment
  'computer': { type: 'equipment', subtype: 'computer', name: 'Computer', image: '/lovable-uploads/equipment-computer-new.png', description: 'Connects to a Cable. Scores 1 bitcoin per turn when connected to the Internet.' },
  'cable-2': { type: 'equipment', subtype: 'cable-2', name: 'Cable (2x)', image: '/lovable-uploads/equipment-2cable.png', description: 'Connects to a Switch. Can hold up to 2 Computers.' },
  'cable-3': { type: 'equipment', subtype: 'cable-3', name: 'Cable (3x)', image: '/lovable-uploads/equipment-3cable.png', description: 'Connects to a Switch. Can hold up to 3 Computers.' },
  'switch': { type: 'equipment', subtype: 'switch', name: 'Switch', image: '/lovable-uploads/equipment-switch.png', description: 'Connects to the Internet. Can hold unlimited Cables.' },
  
  // Attacks
  'audit': { type: 'attack', subtype: 'audit', name: 'Audit', image: '/lovable-uploads/attack-audit-v2.png', description: 'Target returns half their computers (rounded up) to hand. Can be countered with Hacked.' },
  'hacked': { type: 'attack', subtype: 'hacked', name: 'Hacked', image: '/lovable-uploads/attack-hacked-v2.png', description: 'Disable target equipment card. Resolved by Secured or Helpdesk.' },
  'new-hire': { type: 'attack', subtype: 'new-hire', name: 'New Hire', image: '/lovable-uploads/attack-newhire-v2.png', description: 'Disable target equipment card. Resolved by Trained or Helpdesk.' },
  'power-outage': { type: 'attack', subtype: 'power-outage', name: 'Power Outage', image: '/lovable-uploads/attack-poweroutage-v2.png', description: 'Disable target equipment card. Resolved by Powered or Helpdesk.' },
  
  // Resolutions
  'helpdesk': { type: 'resolution', subtype: 'helpdesk', name: 'Helpdesk', image: '/lovable-uploads/resolution-helpdesk-v2.png', description: 'Resolve ALL issues on target equipment card.' },
  'trained': { type: 'resolution', subtype: 'trained', name: 'Trained', image: '/lovable-uploads/resolution-trained-v2.png', description: 'Resolve a single New Hire on target equipment.' },
  'powered': { type: 'resolution', subtype: 'powered', name: 'Powered', image: '/lovable-uploads/resolution-powered-v2.png', description: 'Resolve a single Power Outage on target equipment.' },
  'secured': { type: 'resolution', subtype: 'secured', name: 'Secured', image: '/lovable-uploads/resolution-secured-v2.png', description: 'Resolve a single Hacked on target equipment.' },
  
  // Classifications
  'facilities': { type: 'classification', subtype: 'facilities', name: 'Facilities', image: '/lovable-uploads/classification-facilities-new.png', description: 'Resolves all Power Outage cards. Blocks new Power Outage attacks.' },
  'field-tech': { type: 'classification', subtype: 'field-tech', name: 'Field Tech', image: '/lovable-uploads/classification-fieldtech-new.png', description: 'Each Field Tech grants +1 free Equipment-only move per turn. Can stack up to 2.' },
  'supervisor': { type: 'classification', subtype: 'supervisor', name: 'Supervisor', image: '/lovable-uploads/classification-supervisor.png', description: 'Resolves all New Hire cards. Blocks new New Hire attacks.' },
  'security-specialist': { type: 'classification', subtype: 'security-specialist', name: 'Security Specialist', image: '/lovable-uploads/classification-security.png', description: 'Resolves all Hacked cards. Blocks new Hacked attacks.' },
  'head-hunter': { type: 'classification', subtype: 'head-hunter', name: 'Head Hunter', image: '/lovable-uploads/classification-headhunter.png', description: 'Steal an opponent\'s classification card. Can be countered.' },
  'seal-the-deal': { type: 'classification', subtype: 'seal-the-deal', name: 'Seal the Deal', image: '/lovable-uploads/classification-sealthedeal.png', description: 'Steal an opponent\'s classification card. Cannot be blocked.' },
};

// Actual deck composition (144 cards total)
const deckComposition: Record<string, number> = {
  // Equipment (75 total)
  'computer': 32,
  'cable-2': 16,
  'cable-3': 9,
  'switch': 18,
  
  // Attacks (27 total)
  'audit': 4,
  'hacked': 9,
  'new-hire': 7,
  'power-outage': 7,
  
  // Resolutions (27 total)
  'helpdesk': 4,
  'trained': 7,
  'powered': 7,
  'secured': 9,
  
  // Classifications (15 total)
  'facilities': 2,
  'field-tech': 2,
  'supervisor': 2,
  'security-specialist': 2,
  'head-hunter': 6,
  'seal-the-deal': 1,
};

let cardIdCounter = 0;

export function createCard(key: string): Card {
  const def = cardDefinitions[key];
  if (!def) throw new Error(`Unknown card: ${key}`);
  
  cardIdCounter++;
  return {
    id: `${key}-${cardIdCounter}`,
    type: def.type,
    subtype: def.subtype as any,
    name: def.name,
    image: def.image,
    description: def.description,
  };
}

export function buildDeck(): Card[] {
  const deck: Card[] = [];
  
  for (const [cardKey, count] of Object.entries(deckComposition)) {
    for (let i = 0; i < count; i++) {
      deck.push(createCard(cardKey));
    }
  }
  
  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function dealCards(deck: Card[], count: number): { dealt: Card[]; remaining: Card[] } {
  const dealt = deck.slice(0, count);
  const remaining = deck.slice(count);
  return { dealt, remaining };
}
