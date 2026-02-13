

# Prismatic Glow Border for the Leading Player

## What Changes
The winning player's card will get a prismatic (white/lavender/purple) neon glow border -- matching the holographic look from the reference image -- while non-leading players keep their standard role-colored border with no glow aura.

## Visual Result
- **Leading player**: Border shifts to a bright white/lavender color with a multi-layered purple-pink glow radiating outward, creating the prismatic "neon tube" effect from the reference image. Border stays at the current 2px thickness.
- **Other players**: No change -- they keep their role-colored border (red/yellow/green/blue) with the subtle role shadow.

## Technical Details

### File: `src/components/PlayerCard.tsx`

1. **Add a `leaderBorderGlow` style object** when `isLeader` is true, containing:
   - `borderColor: 'rgba(200, 180, 255, 0.9)'` -- lavender/white border color
   - `boxShadow` with 4 layered glows:
     - `0 0 4px rgba(255, 255, 255, 0.7)` -- tight white core
     - `0 0 10px rgba(200, 170, 255, 0.5)` -- lavender mid
     - `0 0 20px rgba(160, 120, 255, 0.3)` -- purple spread
     - `0 0 35px rgba(140, 100, 255, 0.15)` -- soft outer purple

2. **Conditionally apply** this inline style on the card container `div` only when `isLeader` is true. Non-leaders keep the Tailwind `border-*` and `shadow-*` classes as-is.

3. **Keep existing leader score glow** (the golden `textShadow` on the score number) unchanged.

No other files are affected.

