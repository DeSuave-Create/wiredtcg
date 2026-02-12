

# Remove Card Border Glow, Add Glow to Score Number Only

## What Changes
Move the yellow leader glow from the card's outer border to just the score number itself, so only the number glows when a player is winning.

## Technical Details

### File: `src/components/PlayerCard.tsx`

1. **Card border (line 55)**: Remove the leader override. The card border will always use the role color regardless of leader status:
   - Change from: `isLeader ? 'border-yellow-400 shadow-yellow-400/30' : ...`
   - Change to: always use `${colors.border} ${colors.shadow}`

2. **Desktop score number (line 175)**: Add a yellow glow shadow directly on the score text when `isLeader` is true:
   - Add inline `style` with `textShadow: '0 0 20px rgba(250, 204, 21, 0.8), 0 0 40px rgba(250, 204, 21, 0.4)'` when leading
   - Keep the existing `animate-pulse-bitcoin` class

3. **Mobile score number (line 119)**: Apply the same text glow treatment for consistency on mobile.

This way the card keeps its role-colored border at all times, and only the score number gets the golden glow when that player is in the lead.

