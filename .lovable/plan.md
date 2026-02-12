
# Score Keeper Update: Card-Style Player Cards + Game Classifications

## Overview
Update the Score Keeper page to replace the generic emoji-based character roles with the actual game classifications (Security Specialist, Facilities, Supervisor, Field Tech) and restyle the player cards to match the look and feel of the actual WIRED TCG playing cards.

## Changes

### 1. Update Classifications in `src/components/ScoreKeeper.tsx`
Replace the current 6 fictional characters with the 4 real game classifications:

| Old | New |
|-----|-----|
| ZeroTrust | Security Specialist |
| DeskJockey | Facilities |
| PingMaster | Supervisor |
| RedTapeRipper | Field Tech |
| ClutchCache | *(removed)* |
| CloudCrafter | *(removed)* |

Each classification will use its actual card image instead of emoji icons:
- Security Specialist: `/lovable-uploads/classification-security.png`
- Facilities: `/lovable-uploads/classification-facilities-new.png`
- Supervisor: `/lovable-uploads/classification-supervisor.png`
- Field Tech: `/lovable-uploads/classification-fieldtech-new.png`

Update `maxPlayers` to 4 (matching 4 classifications) and update the default players to use `security-specialist` and `facilities`.

### 2. Redesign `src/components/PlayerCard.tsx` to Match Card Aesthetic
Restyle the player card to look like an actual WIRED playing card:

- **Dark background** (`bg-gray-900/95`) matching the game's card style instead of light gray
- **Classification card image** displayed as the card's hero visual (small thumbnail on mobile, larger on desktop)
- **Border colors** matched to classification type using the game's blue classification border (`border-blue-500`)
- **Leader highlight** keeps the yellow gold border (`border-yellow-400`)
- Replace emoji icon display with the actual classification card image using `<img>` tags
- Keep the circuit board background pattern but darken it to match the game's dark card aesthetic
- Bitcoin score display stays prominent with the existing yellow/red color scheme

#### Desktop Layout (card-shaped):
```text
+---------------------------+
|  [X]     Classification   |
|        [Card Image]       |
|     [Classification Name] |
|      [Player Name Input]  |
|                           |
|    B  Bitcoins Mined      |
|         << 0 >>           |
|      [ - ]  [ + ]         |
+---------------------------+
```

#### Mobile Layout (compact row):
```text
[X] [img] [Name / Class dropdown] [-] 0 [+]
```

### 3. Update Border Color Logic
Replace the old character-based color map with classification-based colors:
- All classifications: `border-blue-500` (matching the game's classification card border)
- Leader override: `border-yellow-400` (unchanged)

### 4. Update `src/components/GameHeader.tsx` (minor)
No structural changes needed -- the header still works as-is.

### 5. Update `src/components/GameInfo.tsx` (minor text tweak)
Update max players display to reflect 4 max instead of 6.

## Technical Details

### Files Modified
1. **`src/components/ScoreKeeper.tsx`** -- Replace characters array, update defaults, change maxPlayers to 4, add `image` field to Character interface
2. **`src/components/PlayerCard.tsx`** -- Full visual redesign: dark bg, card images, classification borders, updated color logic
3. **`src/components/GameInfo.tsx`** -- No code changes needed (already dynamic via props)

### Character Interface Update
```typescript
interface Character {
  id: string;
  name: string;
  icon: string;    // keep for fallback
  image: string;   // NEW: actual card image path
}
```

### Data Update
```typescript
const classifications = [
  { id: 'security-specialist', name: 'Security Specialist', icon: '🛡️', image: '/lovable-uploads/classification-security.png' },
  { id: 'facilities', name: 'Facilities', icon: '⚡', image: '/lovable-uploads/classification-facilities-new.png' },
  { id: 'supervisor', name: 'Supervisor', icon: '👔', image: '/lovable-uploads/classification-supervisor.png' },
  { id: 'field-tech', name: 'Field Tech', icon: '🔧', image: '/lovable-uploads/classification-fieldtech-new.png' },
];
```

### Visual Style Changes
- Card background: `bg-gray-900/95` (dark, matching game cards)
- Card border radius: keep `rounded-3xl`
- Card image: rendered via `<img>` with `object-contain`, sized ~80px on desktop, ~32px on mobile
- Text colors: white/light on dark background for readability
- Score text: stays `text-red-500` for bitcoin count, `text-yellow-400` for bitcoin icon
- Buttons: dark variants (`bg-gray-800 hover:bg-gray-700`) to match dark card
