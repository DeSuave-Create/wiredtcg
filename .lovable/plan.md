

## Improve Network Board Clarity: Vertical Lines and Better Alignment

### Problem
Connection lines between equipment are too short and equipment cards don't visually align with their parent, making it hard to follow which equipment is connected to what. The board is also too cramped, causing overlap when the network grows.

### Changes

**File: `src/components/game/NetworkBoardDroppable.tsx`**

1. **Increase row heights** to create more vertical space between tiers:
   - Internet row: keep at 60px (desktop) / 50px (mobile)
   - Switch row: increase from 80px to 100px (desktop) / 70px to 85px (mobile)
   - Cable row: increase from 80px to 100px (desktop) / 70px to 85px (mobile)  
   - Computer row: increase from 80px to 100px (desktop) / 70px to 85px (mobile)
   - This extra padding between rows gives the SVG lines room to draw vertically

2. **Increase equipment spacing** from `gap-10` (40px) to `gap-14` (56px) so cards don't crowd each other

3. **Increase the Unconnected section height** from 200px to 220px (desktop) to account for the larger board

4. **Increase the min-height on the board container** in `PlayerSection.tsx` from `min-h-[300px]` to `min-h-[420px]` (desktop) and from `min-h-[200px]` to `min-h-[300px]` (mobile) so the expanded rows don't overflow

**File: `src/components/game/NetworkConnectionLines.tsx`**

5. **Use curved Bezier paths instead of straight lines** -- replace `<line>` with `<path>` using quadratic Bezier curves (`Q`) that route more vertically. The control point will be at the midpoint X of the parent (not averaged), making lines drop straight down from the parent before curving to the child. This keeps lines more vertical.

6. **Increase stroke widths** for better visibility:
   - Internet-to-switch: 3px (was 2px)
   - Switch-to-cable: 2.5px (was 1.5px)
   - Cable-to-computer: 2px dashed (was 1.5px)

7. **Color-code lines by switch branch** -- assign each switch a distinct hue so all cables and computers under that switch share the same color, making it immediately obvious which branch each piece of equipment belongs to.

**File: `src/components/game/PlayerSection.tsx`**

8. **Update the network board container min-height** to accommodate the taller rows (as noted in point 4).

---

### Technical Details

| File | What changes |
|------|-------------|
| `NetworkBoardDroppable.tsx` | Row heights from 80px to 100px, gap from `gap-10` to `gap-14`, unconnected height increased |
| `NetworkConnectionLines.tsx` | Straight `<line>` replaced with Bezier `<path>`, thicker strokes, color-coded by switch branch |
| `PlayerSection.tsx` | Board container `min-h-[300px]` to `min-h-[420px]` |

