

# Electric Stepper: Remove Line, Persistent Bolts, Faster Timing

## Changes

### 1. Remove the static line
Delete `<div className="stepper-line" />` from the TSX and remove the `.stepper-line` CSS rule (plus its mobile override). The lightning bolts alone will connect the nodes.

### 2. Keep lightning bolts visible after they fire
Currently, bolts disappear immediately after the 400ms transition (`setBoltIndex(-1)`). Instead:
- Track which bolts have completed using a `Set<number>` state (`completedBolts`)
- When a bolt finishes traveling, add it to `completedBolts` instead of hiding it
- Completed bolts stay rendered at full opacity (no dashoffset animation, just static)
- On reset (after Mine completes), clear `completedBolts` along with everything else

### 3. Hold all bolts visible for 1 second after Mine activates, then reset
When `activeStep` reaches the last node (Mine, index 3):
- Wait 1 second with all 3 lightning bolts still showing
- Then clear everything and restart from node 1

This replaces the current behavior of waiting `STEP_DURATION` (1.8s) before reset.

### 4. Faster lightning -- reduce step duration
Reduce `STEP_DURATION` from 1800ms to 1200ms so the lightning fires more frequently. The bolt travel animation stays at 400ms.

## Revised Animation Timeline (loops every ~4.6s)

```text
0.0s  - Node 1 (Wired) active
1.2s  - Bolt 1->2 fires (400ms), bolt stays visible
1.6s  - Node 2 (Connect) active
2.8s  - Bolt 2->3 fires (400ms), bolt stays visible
3.2s  - Node 3 (Plan) active
4.4s  - Bolt 3->4 fires (400ms), bolt stays visible
4.8s  - Node 4 (Mine) active, all 3 bolts visible
5.8s  - Hold complete, reset everything, restart
```

## Technical Details

### `src/components/ElectricProgressBar.tsx`
- Remove `<div className="stepper-line" />`
- Add `completedBolts` state (`Set<number>`)
- Change `STEP_DURATION` from 1800 to 1200
- In `advanceStep`: after bolt travel completes, add `boltIndex` to `completedBolts` instead of setting `setBoltIndex(-1)`
- Bolt SVG rendering: show bolt if `boltIndex === i` (animating) OR `completedBolts.has(i)` (static)
- End-of-sequence logic: when `next >= STEPS.length`, wait 1000ms then reset all states including `completedBolts`

### `src/components/ElectricProgressBar.css`
- Remove `.stepper-line` rule block (lines 17-26)
- Remove `.stepper-line` mobile override (lines 297-299)
- Add `.bolt-static` class for completed bolts (no animation, `stroke-dashoffset: 0`, slight opacity fade)

