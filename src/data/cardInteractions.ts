// Card Interaction Data System for WIRED TCG Tutorial
// This file defines all cards and their interactions in a structured, scalable format.

export type CardCategory = 'equipment' | 'attack' | 'resolution' | 'classification';

export interface TutorialCard {
  id: string;
  name: string;
  image: string;
  type: CardCategory;
  description: string;
  rulesExplanation: string;
  tags: string[];
  targets?: string[];       // IDs of cards this can target
  affects?: string[];       // IDs of cards this affects
  counters?: string[];      // IDs of cards that counter this
  resolves?: string[];      // IDs of cards this resolves
  relatedCards?: string[];  // IDs of related/synergy cards
  interactionNotes?: string;
  enabled: boolean;         // Admin toggle
}

export interface InteractionStep {
  label: string;
  description: string;
  cardIds: string[];        // Which cards are visible at this step
  stackOrder: string[];     // Bottom to top stacking order
  highlight?: string;       // Card ID to highlight
  effectLabel?: string;     // e.g. "DISABLED", "RESOLVED"
  fadeOut?: string[];       // Card IDs that fade away
  layout?: 'stack' | 'network'; // Visual layout mode
  showRelatedCards?: string[]; // Card IDs to show as related cards for this specific step
  attackOverlay?: { attackCardId: string; targetEquipment: string }; // Show attack card on equipment
}

export interface CardInteraction {
  id: string;
  title: string;
  subtitle: string;
  featuredCardId: string;
  complexity: 'simple' | 'medium' | 'complex';
  steps: InteractionStep[];
  relatedInteractionIds?: string[];
}

// ─── CARD DEFINITIONS ────────────────────────────────────────

export const tutorialCards: Record<string, TutorialCard> = {
  // Internet (not a playable card, but part of the network)
  'internet': {
    id: 'internet',
    name: 'Internet',
    image: '/lovable-uploads/internet-logo.png',
    type: 'equipment',
    description: 'The Internet is the starting point of every player\'s network. All equipment connects below it.',
    rulesExplanation: 'Every player starts with an Internet card already on the board. Switches connect directly to it. The Internet itself cannot be attacked or removed.',
    tags: ['equipment', 'foundation', 'permanent'],
    relatedCards: ['switch'],
    enabled: true,
  },
  // Equipment
  'computer': {
    id: 'computer',
    name: 'Computer',
    image: '/lovable-uploads/equipment-computer-new.png',
    type: 'equipment',
    description: 'A Computer is the core equipment card. Connect it to a Cable to add it to your network. Each connected, active Computer mines 1 Bitcoin per turn.',
    rulesExplanation: 'Computers are how you score points. You must connect them to a Cable card, which must be connected to a Switch. Each active Computer earns 1 Bitcoin at the end of your turn. Disabled Computers do not mine.',
    tags: ['equipment', 'mining', 'network', 'target'],
    counters: ['hacked', 'power-outage', 'audit'],
    relatedCards: ['cable-2', 'cable-3', 'switch'],
    enabled: true,
  },
  'cable-2': {
    id: 'cable-2',
    name: 'Cabling (2x)',
    image: '/lovable-uploads/equipment-2cable.png',
    type: 'equipment',
    description: 'A 2-port Cable connects up to 2 Computers. It must be attached to a Switch to be part of the network.',
    rulesExplanation: 'Cables link Computers to your network. A 2-port Cable can hold up to 2 Computers. Cables must be connected to a Switch. If a Cable is disabled, all Computers on it stop mining.',
    tags: ['equipment', 'network', 'connector'],
    counters: ['power-outage'],
    relatedCards: ['computer', 'switch', 'cable-3'],
    enabled: true,
  },
  'cable-3': {
    id: 'cable-3',
    name: 'Cabling (3x)',
    image: '/lovable-uploads/equipment-3cable.png',
    type: 'equipment',
    description: 'A 3-port Cable connects up to 3 Computers. It must be attached to a Switch to be part of the network.',
    rulesExplanation: 'The 3-port Cable holds more Computers than the 2-port version, making it more valuable — but also a bigger target for attacks.',
    tags: ['equipment', 'network', 'connector'],
    counters: ['power-outage'],
    relatedCards: ['computer', 'switch', 'cable-2'],
    enabled: true,
  },
  'switch': {
    id: 'switch',
    name: 'Switch',
    image: '/lovable-uploads/equipment-switch.png',
    type: 'equipment',
    description: 'A Switch is the foundation of your network. Connect Cables to it to build out your infrastructure.',
    rulesExplanation: 'Switches are the backbone. Each Switch can hold multiple Cables, which in turn hold Computers. A disabled Switch stops all equipment connected to it from mining.',
    tags: ['equipment', 'network', 'foundation'],
    counters: ['power-outage'],
    relatedCards: ['cable-2', 'cable-3', 'computer'],
    enabled: true,
  },

  // Attack cards
  'hacked': {
    id: 'hacked',
    name: 'Hacked',
    image: '/lovable-uploads/attack-hacked-v2.png',
    type: 'attack',
    description: 'Hacked disables any Equipment card. All connected equipment downstream is also disabled (cascade). Resolve with Secured.',
    rulesExplanation: 'Play Hacked on any opponent\'s Equipment (Computer, Cable, or Switch). That equipment is disabled and stops producing Bitcoin. If placed on a Switch or Cable, all downstream equipment is also disabled. Equipment can have multiple attack cards stacked on it. Resolved by a Secured card or the Security Specialist classification.',
    tags: ['attack', 'disable', 'equipment-target', 'cascade'],
    targets: ['computer', 'cable-2', 'cable-3', 'switch'],
    counters: ['secured', 'helpdesk'],
    relatedCards: ['security-specialist', 'audit'],
    interactionNotes: 'Also used as a counter card during Audit battles. Multiple attacks can stack on one equipment.',
    enabled: true,
  },
  'power-outage': {
    id: 'power-outage',
    name: 'Power Outage',
    image: '/lovable-uploads/attack-poweroutage-v2.png',
    type: 'attack',
    description: 'Power Outage disables any Equipment card. All connected equipment downstream is also disabled (cascade). Resolve with Powered.',
    rulesExplanation: 'Play Power Outage on any opponent\'s Equipment (Computer, Cable, or Switch). That equipment and all downstream equipment is disabled. Equipment can have multiple attack cards stacked on it. Resolved by a Powered card or the Facilities classification.',
    tags: ['attack', 'disable', 'equipment-target', 'cascade'],
    targets: ['computer', 'cable-2', 'cable-3', 'switch'],
    counters: ['powered', 'helpdesk'],
    relatedCards: ['facilities'],
    interactionNotes: 'Multiple attacks can stack on one equipment.',
    enabled: true,
  },
  'new-hire': {
    id: 'new-hire',
    name: 'New Hire',
    image: '/lovable-uploads/attack-newhire-v2.png',
    type: 'attack',
    description: 'New Hire disables any Equipment card. All connected equipment downstream is also disabled (cascade). Resolve with Trained.',
    rulesExplanation: 'Play New Hire on any opponent\'s Equipment (Computer, Cable, or Switch). That equipment and all downstream equipment is disabled. Equipment can have multiple attack cards stacked on it. Resolved by a Trained card or the Supervisor classification.',
    tags: ['attack', 'disable', 'equipment-target', 'cascade'],
    targets: ['computer', 'cable-2', 'cable-3', 'switch'],
    counters: ['trained', 'helpdesk'],
    relatedCards: ['supervisor'],
    interactionNotes: 'Multiple attacks can stack on one equipment.',
    enabled: true,
  },
  'audit': {
    id: 'audit',
    name: 'Audit',
    image: '/lovable-uploads/attack-audit-v2.png',
    type: 'attack',
    description: 'Audit forces an opponent to return Computers from their network. The defender can counter with Secured cards, and the attacker can counter back with Hacked cards.',
    rulesExplanation: 'Play Audit to target an opponent. They must return Computers from their network. A back-and-forth battle begins: the defender plays Hacked to block, the attacker plays Secured to counter, and so on until one side runs out.',
    tags: ['attack', 'removal', 'battle', 'chain'],
    targets: ['computer'],
    counters: ['hacked'],
    relatedCards: ['hacked', 'security-specialist'],
    interactionNotes: 'Triggers a unique Audit Battle phase. Computers returned go to the audited pile and can be replayed.',
    enabled: true,
  },

  // Resolution cards
  'secured': {
    id: 'secured',
    name: 'Secured',
    image: '/lovable-uploads/resolution-secured-v2.png',
    type: 'resolution',
    description: 'Secured resolves a Hacked attack on a Computer, restoring it to active status.',
    rulesExplanation: 'Play Secured on a Computer that has been Hacked. The Hacked card is removed and the Computer resumes mining Bitcoin. Also used by the attacker to counter Hacked blocks during Audit Battles.',
    tags: ['resolution', 'restore', 'counter-hacked'],
    resolves: ['hacked'],
    relatedCards: ['computer', 'audit', 'security-specialist'],
    enabled: true,
  },
  'powered': {
    id: 'powered',
    name: 'Powered',
    image: '/lovable-uploads/resolution-powered-v2.png',
    type: 'resolution',
    description: 'Powered resolves a Power Outage attack, restoring equipment to active status.',
    rulesExplanation: 'Play Powered on any equipment affected by a Power Outage. The Power Outage card is removed and the equipment (and all connected downstream equipment) resumes normal operation.',
    tags: ['resolution', 'restore', 'counter-power-outage'],
    resolves: ['power-outage'],
    relatedCards: ['switch', 'cable-2', 'cable-3', 'computer', 'facilities'],
    enabled: true,
  },
  'trained': {
    id: 'trained',
    name: 'Trained',
    image: '/lovable-uploads/resolution-trained-v2.png',
    type: 'resolution',
    description: 'Trained resolves a New Hire attack on Equipment, restoring it to active status.',
    rulesExplanation: 'Play Trained on any Equipment card that has been targeted by New Hire. The New Hire card is removed and the equipment resumes normal operation.',
    tags: ['resolution', 'restore', 'counter-new-hire'],
    resolves: ['new-hire'],
    relatedCards: ['supervisor', 'computer', 'cable-2', 'cable-3', 'switch'],
    enabled: true,
  },
  'helpdesk': {
    id: 'helpdesk',
    name: 'Helpdesk',
    image: '/lovable-uploads/resolution-helpdesk-v2.png',
    type: 'resolution',
    description: 'Helpdesk is a wildcard resolution. It removes ALL attack cards from a single equipment card at once.',
    rulesExplanation: 'Play Helpdesk on any equipment that has attack cards on it. Unlike other resolution cards that remove one attack at a time, Helpdesk clears ALL attacks on that equipment in one move — even if it has multiple Hacked, Power Outage, and New Hire cards stacked on it. Only 4 in the deck.',
    tags: ['resolution', 'wildcard', 'universal', 'clear-all'],
    resolves: ['hacked', 'power-outage', 'new-hire'],
    relatedCards: ['secured', 'powered', 'trained'],
    interactionNotes: 'Rare and powerful — clears ALL attacks on one equipment, not just one.',
    enabled: true,
  },

  // Classification cards
  'security-specialist': {
    id: 'security-specialist',
    name: 'Security Specialist',
    image: '/lovable-uploads/classification-security.png',
    type: 'classification',
    description: 'Security Specialist automatically resolves Hacked attacks on your Computers at the start of your turn.',
    rulesExplanation: 'While active, the Security Specialist passively protects your network. At the start of your turn, any Hacked cards on your Computers are automatically removed. This saves you from spending moves on Secured cards.',
    tags: ['classification', 'passive', 'auto-resolve', 'defense'],
    resolves: ['hacked'],
    counters: ['new-hire', 'head-hunter'],
    relatedCards: ['computer', 'secured'],
    enabled: true,
  },
  'facilities': {
    id: 'facilities',
    name: 'Facilities',
    image: '/lovable-uploads/classification-facilities-new.png',
    type: 'classification',
    description: 'Facilities automatically resolves Power Outage attacks on your equipment at the start of your turn.',
    rulesExplanation: 'While active, Facilities keeps your power running. At the start of your turn, any Power Outage cards on your equipment are automatically removed. Essential for maintaining a large network.',
    tags: ['classification', 'passive', 'auto-resolve', 'defense'],
    resolves: ['power-outage'],
    counters: ['new-hire', 'head-hunter'],
    relatedCards: ['switch', 'cable-2', 'cable-3', 'powered'],
    enabled: true,
  },
  'supervisor': {
    id: 'supervisor',
    name: 'Supervisor',
    image: '/lovable-uploads/classification-supervisor.png',
    type: 'classification',
    description: 'Supervisor automatically resolves New Hire attacks on your Equipment at the start of your turn.',
    rulesExplanation: 'While active, the Supervisor protects your equipment from being disabled by New Hire. At the start of your turn, any New Hire cards on your equipment are automatically removed.',
    tags: ['classification', 'passive', 'auto-resolve', 'defense'],
    resolves: ['new-hire'],
    counters: ['new-hire', 'head-hunter'],
    relatedCards: ['computer', 'cable-2', 'cable-3', 'switch', 'trained'],
    enabled: true,
  },
  'field-tech': {
    id: 'field-tech',
    name: 'Field Tech',
    image: '/lovable-uploads/classification-fieldtech-new.png',
    type: 'classification',
    description: 'Field Tech grants +1 bonus equipment move per turn. This extra move can only be used for equipment cards.',
    rulesExplanation: 'While active, Field Tech gives you an extra move each turn that can only be used to play equipment cards (Computer, Cable, or Switch). This accelerates your network building without costing regular moves.',
    tags: ['classification', 'passive', 'bonus', 'equipment'],
    counters: ['new-hire', 'head-hunter'],
    relatedCards: ['computer', 'cable-2', 'cable-3', 'switch'],
    enabled: true,
  },
  'head-hunter': {
    id: 'head-hunter',
    name: 'Head Hunter',
    image: '/lovable-uploads/classification-headhunter.png',
    type: 'classification',
    description: 'Head Hunter lets you steal an opponent\'s Classification card. The defender can counter with their own Head Hunter cards.',
    rulesExplanation: 'Play Head Hunter to target one of your opponent\'s active Classification cards. A Head Hunter Battle begins — the defender can play their own Head Hunter to block, then you can counter with another, and so on. If the steal succeeds, the classification moves to your board.',
    tags: ['classification', 'attack', 'steal', 'battle', 'chain'],
    targets: ['security-specialist', 'facilities', 'supervisor', 'field-tech'],
    relatedCards: ['seal-the-deal'],
    interactionNotes: 'Triggers a Head Hunter Battle phase. Max 2 classifications per player.',
    enabled: true,
  },
  'seal-the-deal': {
    id: 'seal-the-deal',
    name: 'Seal the Deal',
    image: '/lovable-uploads/classification-sealthedeal.png',
    type: 'classification',
    description: 'Seal the Deal is a Head Hunter that cannot be countered. The defender has no way to block it.',
    rulesExplanation: 'Play Seal the Deal to steal an opponent\'s Classification card — just like Head Hunter, but it cannot be blocked or countered. The steal is guaranteed. Only 1 exists in the entire deck, making it the most powerful classification card.',
    tags: ['classification', 'attack', 'steal', 'unblockable', 'rare'],
    targets: ['security-specialist', 'facilities', 'supervisor', 'field-tech'],
    relatedCards: ['head-hunter', 'security-specialist', 'facilities', 'supervisor', 'field-tech'],
    interactionNotes: 'Only 1 copy in the entire deck. Cannot be countered.',
    enabled: true,
  },
};

// ─── INTERACTION SCENARIOS ────────────────────────────────────

export const cardInteractions: CardInteraction[] = [
  // ── EQUIPMENT: Building a network ──
  {
    id: 'network-building',
    title: 'Building Your Network',
    subtitle: 'How equipment cards connect',
    featuredCardId: 'switch',
    complexity: 'medium',
    steps: [
      {
        label: 'Step 1: Start with Internet',
        description: 'Every player starts with an Internet card on the board. This is the top of your network — everything connects below it.',
        cardIds: ['internet'],
        stackOrder: ['internet'],
        highlight: 'internet',
        layout: 'network',
      },
      {
        label: 'Step 2: Place a Switch',
        description: 'Play a Switch card and connect it to your Internet. The Switch is the backbone — all Cables branch off from it.',
        cardIds: ['internet', 'switch'],
        stackOrder: ['internet', 'switch'],
        highlight: 'switch',
        layout: 'network',
      },
      {
        label: 'Step 3: Connect a Cable',
        description: 'Attach a Cable below the Switch. Cables connect Switches to Computers. A 3-port Cable can hold up to 3 Computers.',
        cardIds: ['internet', 'switch', 'cable-3'],
        stackOrder: ['internet', 'switch', 'cable-3'],
        highlight: 'cable-3',
        layout: 'network',
      },
      {
        label: 'Step 4: Connect Computers',
        description: 'Plug Computers into the Cable. Each active, fully connected Computer mines 1 Bitcoin per turn.',
        cardIds: ['internet', 'switch', 'cable-3', 'computer', 'computer', 'computer'],
        stackOrder: ['internet', 'switch', 'cable-3', 'computer', 'computer', 'computer'],
        highlight: 'computer',
        effectLabel: 'MINING',
        layout: 'network',
      },
    ],
  },

  // ── HOW COMPUTERS SCORE ──
  {
    id: 'how-computers-score',
    title: 'How Computers Score',
    subtitle: 'The full network connection',
    featuredCardId: 'computer',
    complexity: 'medium',
    steps: [
      {
        label: 'The Full Network',
        description: 'To mine Bitcoin, a Computer must be fully connected: Internet → Switch → Cable → Computer. Every player starts with an Internet card on the board.',
        cardIds: ['internet', 'switch', 'cable-3', 'computer', 'computer', 'computer'],
        stackOrder: ['internet', 'switch', 'cable-3', 'computer', 'computer', 'computer'],
        highlight: 'internet',
        layout: 'network',
      },
      {
        label: 'Each Computer = 1 Bitcoin',
        description: 'At the end of your turn, each active, fully connected Computer earns you 1 Bitcoin. 3 connected Computers = 3 Bitcoin per turn.',
        cardIds: ['internet', 'switch', 'cable-3', 'computer', 'computer', 'computer'],
        stackOrder: ['internet', 'switch', 'cable-3', 'computer', 'computer', 'computer'],
        highlight: 'computer',
        effectLabel: '+3 BITCOIN',
        layout: 'network',
      },
      {
        label: 'Hacked — Disables Equipment',
        description: 'An opponent plays Hacked on one of your Computers. That Computer stops mining until you resolve it with a Secured card.',
        cardIds: ['internet', 'switch', 'cable-3', 'computer', 'computer', 'computer'],
        stackOrder: ['internet', 'switch', 'cable-3', 'computer', 'computer', 'computer'],
        highlight: 'computer',
        fadeOut: ['computer'],
        effectLabel: 'HACKED',
        layout: 'network',
        showRelatedCards: ['hacked', 'secured', 'security-specialist'],
      },
      {
        label: 'Power Outage — Cascading Shutdown',
        description: 'Power Outage hits your Switch — everything downstream (Cables and Computers) stops mining. Resolve with a Powered card.',
        cardIds: ['internet', 'switch', 'cable-3', 'computer', 'computer', 'computer'],
        stackOrder: ['internet', 'switch', 'cable-3', 'computer', 'computer', 'computer'],
        highlight: 'switch',
        fadeOut: ['switch', 'cable-3', 'computer'],
        effectLabel: 'POWER OUTAGE',
        layout: 'network',
        showRelatedCards: ['power-outage', 'powered', 'facilities'],
      },
      {
        label: 'New Hire — Equipment Disabled',
        description: 'New Hire disables a Cable — all Computers connected to it stop mining. Resolve with a Trained card.',
        cardIds: ['internet', 'switch', 'cable-3', 'computer', 'computer', 'computer'],
        stackOrder: ['internet', 'switch', 'cable-3', 'computer', 'computer', 'computer'],
        highlight: 'cable-3',
        fadeOut: ['cable-3', 'computer'],
        effectLabel: 'NEW HIRE',
        layout: 'network',
        showRelatedCards: ['new-hire', 'trained', 'supervisor'],
      },
      {
        label: 'Race to 25 Bitcoin',
        description: 'The first player to reach 25 Bitcoin wins! Build more branches with multiple Switches and Cables to maximize your mining output.',
        cardIds: ['internet', 'switch', 'cable-2', 'cable-3', 'computer', 'computer', 'computer'],
        stackOrder: ['internet', 'switch', 'cable-2', 'cable-3', 'computer', 'computer', 'computer'],
        highlight: 'computer',
        effectLabel: 'RACE TO 25',
        layout: 'network',
      },
    ],
  },

  // ── HACKED interaction ──
  {
    id: 'hacked-interaction',
    title: 'Hacked Attack',
    subtitle: 'Disabling equipment with cascade',
    featuredCardId: 'hacked',
    complexity: 'medium',
    steps: [
      {
        label: 'Step 1: Target Any Equipment',
        description: 'Any opponent\'s Equipment (Computer, Cable, or Switch) can be targeted by a Hacked card.',
        cardIds: ['switch'],
        stackOrder: ['switch'],
        highlight: 'switch',
        effectLabel: 'ACTIVE',
      },
      {
        label: 'Step 2: Play Hacked',
        description: 'Hacked is placed on the equipment. That equipment and all connected equipment downstream is disabled (cascade effect). Equipment can have multiple attacks stacked on it.',
        cardIds: ['switch', 'hacked'],
        stackOrder: ['switch', 'hacked'],
        highlight: 'hacked',
        effectLabel: 'DISABLED',
      },
      {
        label: 'Step 3: Resolve with Secured',
        description: 'Play a Secured card to remove one Hacked attack. Each Secured removes one Hacked card.',
        cardIds: ['switch', 'hacked', 'secured'],
        stackOrder: ['switch', 'hacked', 'secured'],
        highlight: 'secured',
        effectLabel: 'RESOLVING',
      },
      {
        label: 'Step 4: Equipment Restored',
        description: 'The Hacked card is removed. If no other attacks remain, the equipment and downstream connections resume mining.',
        cardIds: ['switch'],
        stackOrder: ['switch'],
        highlight: 'switch',
        fadeOut: ['hacked', 'secured'],
        effectLabel: 'RESTORED',
      },
    ],
  },

  // ── POWER OUTAGE interaction ──
  {
    id: 'power-outage-interaction',
    title: 'Power Outage Attack',
    subtitle: 'Shutting down equipment with cascade',
    featuredCardId: 'power-outage',
    complexity: 'medium',
    steps: [
      {
        label: 'Step 1: Target Any Equipment',
        description: 'Any opponent\'s Equipment (Computer, Cable, or Switch) can be targeted. Placing it on a Switch disables the most equipment.',
        cardIds: ['switch'],
        stackOrder: ['switch'],
        highlight: 'switch',
        effectLabel: 'ACTIVE',
      },
      {
        label: 'Step 2: Play Power Outage',
        description: 'Power Outage is placed on the equipment. That equipment and ALL connected equipment downstream is disabled (cascade). Multiple attacks can stack on one equipment.',
        cardIds: ['switch', 'power-outage'],
        stackOrder: ['switch', 'power-outage'],
        highlight: 'power-outage',
        effectLabel: 'DISABLED',
      },
      {
        label: 'Step 3: Resolve with Powered',
        description: 'Play a Powered card to remove one Power Outage. Each Powered removes one Power Outage card.',
        cardIds: ['switch', 'power-outage', 'powered'],
        stackOrder: ['switch', 'power-outage', 'powered'],
        highlight: 'powered',
        effectLabel: 'RESOLVING',
      },
      {
        label: 'Step 4: Equipment Restored',
        description: 'The Power Outage is removed. If no other attacks remain, the equipment and all downstream connections resume mining.',
        cardIds: ['switch'],
        stackOrder: ['switch'],
        highlight: 'switch',
        fadeOut: ['power-outage', 'powered'],
        effectLabel: 'RESTORED',
      },
    ],
  },

  // ── NEW HIRE interaction ──
  {
    id: 'new-hire-interaction',
    title: 'New Hire Attack',
    subtitle: 'Disabling equipment with cascade',
    featuredCardId: 'new-hire',
    complexity: 'medium',
    steps: [
      {
        label: 'Step 1: Target Any Equipment',
        description: 'Any opponent\'s Equipment (Computer, Cable, or Switch) can be targeted by New Hire.',
        cardIds: ['cable-3'],
        stackOrder: ['cable-3'],
        highlight: 'cable-3',
        effectLabel: 'ACTIVE',
      },
      {
        label: 'Step 2: Play New Hire',
        description: 'New Hire is placed on the equipment. That equipment and all downstream connections are disabled (cascade). Multiple attacks can stack on one equipment.',
        cardIds: ['cable-3', 'new-hire'],
        stackOrder: ['cable-3', 'new-hire'],
        highlight: 'new-hire',
        effectLabel: 'DISABLED',
      },
      {
        label: 'Step 3: Resolve with Trained',
        description: 'Play a Trained card to remove one New Hire. Each Trained removes one New Hire card.',
        cardIds: ['cable-3', 'new-hire', 'trained'],
        stackOrder: ['cable-3', 'new-hire', 'trained'],
        highlight: 'trained',
        effectLabel: 'RESOLVING',
      },
      {
        label: 'Step 4: Equipment Restored',
        description: 'The New Hire is removed. If no other attacks remain, the equipment and downstream connections resume mining.',
        cardIds: ['cable-3'],
        stackOrder: ['cable-3'],
        highlight: 'cable-3',
        fadeOut: ['new-hire', 'trained'],
        effectLabel: 'RESTORED',
      },
    ],
  },

  // ── HELPDESK wildcard ──
  {
    id: 'helpdesk-interaction',
    title: 'Helpdesk Resolution',
    subtitle: 'Clears ALL attacks at once',
    featuredCardId: 'helpdesk',
    complexity: 'medium',
    steps: [
      {
        label: 'Step 1: Equipment Under Multiple Attacks',
        description: 'An equipment card has been hit by multiple attacks — a Hacked AND a Power Outage are stacked on it. Each one would need its own resolution card.',
        cardIds: ['switch', 'hacked'],
        stackOrder: ['switch', 'hacked'],
        highlight: 'hacked',
        effectLabel: 'MULTIPLE ATTACKS',
      },
      {
        label: 'Step 2: More Attacks Stack Up',
        description: 'Equipment can have unlimited attack cards on it. Normally you\'d need a Secured, a Powered, and a Trained to clear each one individually.',
        cardIds: ['switch', 'hacked', 'power-outage'],
        stackOrder: ['switch', 'hacked', 'power-outage'],
        highlight: 'power-outage',
        effectLabel: 'STACKING',
      },
      {
        label: 'Step 3: Play Helpdesk',
        description: 'Helpdesk clears ALL attack cards on one equipment in a single move — no matter how many are stacked on it.',
        cardIds: ['switch', 'hacked', 'power-outage', 'helpdesk'],
        stackOrder: ['switch', 'hacked', 'power-outage', 'helpdesk'],
        highlight: 'helpdesk',
        effectLabel: 'CLEAR ALL',
      },
      {
        label: 'Step 4: Fully Restored',
        description: 'Every attack card is removed at once. Only 4 Helpdesk cards exist in the entire deck — save them for heavily attacked equipment.',
        cardIds: ['switch'],
        stackOrder: ['switch'],
        highlight: 'switch',
        fadeOut: ['hacked', 'power-outage', 'helpdesk'],
        effectLabel: 'RESTORED',
      },
    ],
  },

  // ── AUDIT battle ──
  {
    id: 'audit-interaction',
    title: 'Audit Battle',
    subtitle: 'A back-and-forth showdown',
    featuredCardId: 'audit',
    complexity: 'complex',
    steps: [
      {
        label: 'Step 1: Play Audit',
        description: 'The attacker plays an Audit card targeting an opponent\'s network. This initiates an Audit Battle.',
        cardIds: ['audit'],
        stackOrder: ['audit'],
        highlight: 'audit',
        effectLabel: 'AUDIT INITIATED',
      },
      {
        label: 'Step 2: Defender Blocks with Hacked',
        description: 'The defender can play a Hacked card to block the Audit. If they do, the battle continues.',
        cardIds: ['audit', 'hacked'],
        stackOrder: ['audit', 'hacked'],
        highlight: 'hacked',
        effectLabel: 'BLOCKED',
      },
      {
        label: 'Step 3: Attacker Counters with Secured',
        description: 'The attacker can play a Secured card to counter the Hacked. The chain goes back and forth.',
        cardIds: ['audit', 'hacked', 'secured'],
        stackOrder: ['audit', 'hacked', 'secured'],
        highlight: 'secured',
        effectLabel: 'COUNTERED',
      },
      {
        label: 'Step 4: Battle Resolves',
        description: 'The battle ends when one side can\'t counter. If the Audit succeeds, the attacker selects Computers to return from the defender\'s network.',
        cardIds: ['audit', 'computer'],
        stackOrder: ['audit', 'computer'],
        highlight: 'audit',
        effectLabel: 'COMPUTERS RETURNED',
      },
    ],
  },

  // ── HEAD HUNTER battle ──
  {
    id: 'head-hunter-interaction',
    title: 'Head Hunter Battle',
    subtitle: 'Stealing classifications',
    featuredCardId: 'head-hunter',
    complexity: 'complex',
    steps: [
      {
        label: 'Step 1: Play Head Hunter',
        description: 'Target an opponent\'s Classification card. You want to steal it for yourself.',
        cardIds: ['head-hunter', 'facilities'],
        stackOrder: ['facilities', 'head-hunter'],
        highlight: 'head-hunter',
        effectLabel: 'STEAL ATTEMPT',
      },
      {
        label: 'Step 2: Defender Blocks',
        description: 'The defender can play their own Head Hunter card to block the steal. The battle continues.',
        cardIds: ['head-hunter', 'facilities'],
        stackOrder: ['facilities', 'head-hunter'],
        highlight: 'facilities',
        effectLabel: 'BLOCKED',
      },
      {
        label: 'Step 3: Steal Succeeds or Fails',
        description: 'When one side runs out of Head Hunter cards, the battle ends. If the attacker wins, the classification moves to their board.',
        cardIds: ['facilities'],
        stackOrder: ['facilities'],
        highlight: 'facilities',
        effectLabel: 'STOLEN',
      },
    ],
  },

  // ── SEAL THE DEAL — unblockable steal ──
  {
    id: 'seal-the-deal-interaction',
    title: 'Seal the Deal',
    subtitle: 'The unblockable steal',
    featuredCardId: 'seal-the-deal',
    complexity: 'simple',
    steps: [
      {
        label: 'Step 1: Target a Classification',
        description: 'An opponent has a valuable Classification you want. Normally you\'d play Head Hunter — but they could block it.',
        cardIds: ['facilities'],
        stackOrder: ['facilities'],
        highlight: 'facilities',
        effectLabel: 'TARGET',
      },
      {
        label: 'Step 2: Play Seal the Deal',
        description: 'Seal the Deal works like a Head Hunter — but it cannot be countered. The defender has no way to block the steal. The classification is yours.',
        cardIds: ['facilities', 'seal-the-deal'],
        stackOrder: ['facilities', 'seal-the-deal'],
        highlight: 'seal-the-deal',
        effectLabel: 'UNBLOCKABLE STEAL',
      },
      {
        label: 'Step 3: Classification Stolen',
        description: 'The classification moves to your board. Only 1 Seal the Deal exists in the entire deck — use it on the most valuable target.',
        cardIds: ['seal-the-deal', 'facilities'],
        stackOrder: ['facilities'],
        highlight: 'facilities',
        fadeOut: ['seal-the-deal'],
        effectLabel: 'STOLEN',
      },
    ],
  },

  // ── AUTO-RESOLVE: Security Specialist ──
  {
    id: 'security-specialist-auto',
    title: 'Security Specialist',
    subtitle: 'Auto-resolving Hacked attacks',
    featuredCardId: 'security-specialist',
    complexity: 'medium',
    steps: [
      {
        label: 'Step 1: Computer Gets Hacked',
        description: 'An opponent plays Hacked on your Computer. It\'s disabled.',
        cardIds: ['computer', 'hacked'],
        stackOrder: ['computer', 'hacked'],
        highlight: 'hacked',
        effectLabel: 'DISABLED',
      },
      {
        label: 'Step 2: Your Turn Begins',
        description: 'You have an active Security Specialist. At the start of your turn, it automatically resolves all Hacked attacks.',
        cardIds: ['computer', 'hacked', 'security-specialist'],
        stackOrder: ['computer', 'hacked'],
        highlight: 'security-specialist',
        effectLabel: 'AUTO-RESOLVE',
      },
      {
        label: 'Step 3: Computer Restored',
        description: 'The Hacked card is removed automatically — no move spent. The Computer is active again.',
        cardIds: ['computer', 'security-specialist'],
        stackOrder: ['computer'],
        highlight: 'computer',
        fadeOut: ['hacked'],
        effectLabel: 'RESTORED',
      },
    ],
  },

  // ── AUTO-RESOLVE: Facilities ──
  {
    id: 'facilities-auto',
    title: 'Facilities',
    subtitle: 'Auto-resolving Power Outages',
    featuredCardId: 'facilities',
    complexity: 'medium',
    steps: [
      {
        label: 'Step 1: Equipment Hit by Power Outage',
        description: 'An opponent plays Power Outage on your Switch. Everything downstream is disabled.',
        cardIds: ['switch', 'power-outage'],
        stackOrder: ['switch', 'power-outage'],
        highlight: 'power-outage',
        effectLabel: 'DISABLED',
      },
      {
        label: 'Step 2: Your Turn Begins',
        description: 'You have an active Facilities card. At the start of your turn, it automatically resolves all Power Outage attacks.',
        cardIds: ['switch', 'power-outage', 'facilities'],
        stackOrder: ['switch', 'power-outage'],
        highlight: 'facilities',
        effectLabel: 'AUTO-RESOLVE',
      },
      {
        label: 'Step 3: Equipment Restored',
        description: 'The Power Outage card is removed automatically. Your Switch and all connected equipment power back on.',
        cardIds: ['switch', 'facilities'],
        stackOrder: ['switch'],
        highlight: 'switch',
        fadeOut: ['power-outage'],
        effectLabel: 'RESTORED',
      },
    ],
  },

  // ── AUTO-RESOLVE: Supervisor ──
  {
    id: 'supervisor-auto',
    title: 'Supervisor',
    subtitle: 'Auto-resolving New Hire attacks',
    featuredCardId: 'supervisor',
    complexity: 'medium',
    steps: [
      {
        label: 'Step 1: Equipment Hit by New Hire',
        description: 'An opponent plays New Hire on your Cable. It\'s disabled and its Computers stop mining.',
        cardIds: ['cable-2', 'new-hire'],
        stackOrder: ['cable-2', 'new-hire'],
        highlight: 'new-hire',
        effectLabel: 'DISABLED',
      },
      {
        label: 'Step 2: Your Turn Begins',
        description: 'You have an active Supervisor. At the start of your turn, it automatically resolves all New Hire attacks on your equipment.',
        cardIds: ['cable-2', 'new-hire', 'supervisor'],
        stackOrder: ['cable-2', 'new-hire'],
        highlight: 'supervisor',
        effectLabel: 'AUTO-RESOLVE',
      },
      {
        label: 'Step 3: Equipment Restored',
        description: 'The New Hire card is removed automatically. Your Cable is active again and its Computers resume mining.',
        cardIds: ['cable-2', 'supervisor'],
        stackOrder: ['cable-2'],
        highlight: 'cable-2',
        fadeOut: ['new-hire'],
        effectLabel: 'RESTORED',
      },
    ],
  },

  // ── FIELD TECH bonus ──
  {
    id: 'field-tech-bonus',
    title: 'Field Tech',
    subtitle: 'Bonus equipment moves',
    featuredCardId: 'field-tech',
    complexity: 'simple',
    steps: [
      {
        label: 'Step 1: Field Tech is Active',
        description: 'While Field Tech is in play, you get +1 bonus move each turn — but only for equipment cards.',
        cardIds: ['field-tech'],
        stackOrder: ['field-tech'],
        highlight: 'field-tech',
        effectLabel: '+1 EQUIPMENT MOVE',
      },
      {
        label: 'Step 2: Play Extra Equipment',
        description: 'Use the bonus move to play an extra Computer, Cable, or Switch. This accelerates your network growth without using regular moves.',
        cardIds: ['field-tech', 'computer'],
        stackOrder: ['field-tech', 'computer'],
        highlight: 'computer',
        effectLabel: 'BONUS PLAY',
      },
    ],
  },
];

// ─── HELPERS ──────────────────────────────────────────────────

export const getCard = (id: string): TutorialCard | undefined => tutorialCards[id];

export const getInteractionsByCard = (cardId: string): CardInteraction[] =>
  cardInteractions.filter(i => i.featuredCardId === cardId && tutorialCards[i.featuredCardId]?.enabled);

export const getInteractionsByType = (type: CardCategory): CardInteraction[] =>
  cardInteractions.filter(i => tutorialCards[i.featuredCardId]?.type === type && tutorialCards[i.featuredCardId]?.enabled);

export const getEnabledInteractions = (): CardInteraction[] =>
  cardInteractions.filter(i => tutorialCards[i.featuredCardId]?.enabled);

export const getCategoryColor = (type: CardCategory): string => {
  switch (type) {
    case 'equipment': return 'hsl(var(--primary))';
    case 'attack': return 'hsl(var(--destructive))';
    case 'resolution': return 'hsl(280, 65%, 60%)';
    case 'classification': return 'hsl(var(--accent-blue))';
  }
};

export const getCategoryBorderClass = (type: CardCategory): string => {
  switch (type) {
    case 'equipment': return 'border-primary';
    case 'attack': return 'border-destructive';
    case 'resolution': return 'border-purple-500';
    case 'classification': return 'border-blue-500';
  }
};

export const getCategoryTextClass = (type: CardCategory): string => {
  switch (type) {
    case 'equipment': return 'text-primary';
    case 'attack': return 'text-destructive';
    case 'resolution': return 'text-yellow-400';
    case 'classification': return 'text-blue-400';
  }
};

export const getCategoryBgClass = (type: CardCategory): string => {
  switch (type) {
    case 'equipment': return 'bg-primary/10';
    case 'attack': return 'bg-destructive/10';
    case 'resolution': return 'bg-purple-500/10';
    case 'classification': return 'bg-blue-500/10';
  }
};
