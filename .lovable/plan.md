

# Fill Empty Space on Player Cards

## Problem
The 5:7 aspect ratio creates too much empty space below the +/- buttons on desktop.

## Solution
Add the classification card image (already available per character) below the +/- buttons to fill the remaining space. This reinforces the player's chosen role visually and uses the existing `character.image` data.

## Visual Result
- Role name (dropdown) at top
- Player name input
- "Bitcoins Mined" label + score
- +/- buttons
- **Classification card artwork filling the remaining space** (contained, rounded, with slight opacity to not overpower the score)

## Technical Details

### File: `src/components/PlayerCard.tsx`

In the desktop layout section (after the +/- buttons div, around line 175), add:

```tsx
{/* Classification card image */}
<div className="flex-1 flex items-end justify-center w-full overflow-hidden">
  <img
    src={character.image}
    alt={character.name}
    className="w-3/4 h-auto object-contain opacity-80 rounded-xl"
  />
</div>
```

Also update the desktop container to use `flex-1` properly so the image stretches into remaining space — change `space-y-4` to `space-y-3 gap-0` and ensure the image container grows with `flex-1`.

No other files are affected.
