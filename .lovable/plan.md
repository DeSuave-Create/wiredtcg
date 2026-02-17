

# Electric Progress Stepper Redesign

## Overview
Replace the current `ElectricProgressBar` with a completely new node-based stepper that feels like electricity flowing between circuit nodes. No progress bars, no buttons -- just 4 circular nodes connected by SVG lightning arcs that fire sequentially.

## Visual Design

```text
  [WIRED]----⚡----[Connect]----⚡----[Plan]----⚡----[Mine]
     o                o                 o               o
   (logo)          (cable)          (monitor)       (bitcoin)
```

- Dark background section with subtle radial bloom behind active node
- Cyan/teal energy palette (not neon green/red/yellow)
- Circular nodes: thin ring border, soft inner glow, icon centered inside
- Dim inactive nodes, softly glowing completed nodes, bright pulsing active node

## Animation Sequence (loops every ~7.2s)

1. **Node 1 (WIRED)** starts active and glowing (0s)
2. **Lightning arc 1→2** fires at 1.8s: jagged SVG bolt travels from node 1 to node 2 over ~400ms
3. **Node 2 (Connect)** charges up: spark particles eject, glow expands, micro-jitter, radial bloom shifts
4. **Lightning arc 2→3** fires at 3.6s: same effect
5. **Node 3 (Plan)** charges up
6. **Lightning arc 3→4** fires at 5.4s
7. **Node 4 (Mine)** charges up
8. Pause 1.8s, then reset and loop

## Lightning Bolt Implementation

- SVG overlay positioned between each pair of nodes
- Jagged path generated with randomized midpoints (6-8 segments with vertical offsets)
- Path re-randomized on each cycle for organic feel
- Animated with `stroke-dasharray` + `stroke-dashoffset` for the "traveling" effect
- Cyan glow via SVG filter (`feGaussianBlur` + `feComposite`)
- Lightning visible ONLY during the ~400ms transition window

## Spark Particles

- 6-8 tiny circles ejected radially from destination node when lightning lands
- Each particle: random angle, random distance (20-40px), fades out over 300ms
- CSS animations with randomized `--angle` and `--distance` custom properties

## Node States

| State | Visual |
|-------|--------|
| Inactive | Dim ring, no glow, muted icon color |
| Active (charging) | Bright ring, expanding glow, micro-jitter animation, radial bloom behind |
| Completed | Soft steady glow, full opacity icon, thin bright ring |

## Files Changed

### Modified: `src/components/ElectricProgressBar.tsx`
Complete rewrite:
- 4 steps: WIRED (logo), Connect (Cable icon), Plan (Monitor icon), Mine (Bitcoin icon)
- State: `activeStep` (0-3), `transitioning` (boolean), `completedSteps` Set
- `useEffect` timer: advances every 1.8s, resets after all complete + pause
- SVG overlay between nodes for lightning bolts
- `generateLightningPath()` utility: creates jagged SVG path with random vertical offsets
- Spark particle component rendered on charge-up
- IntersectionObserver to pause when off-screen (kept from current)

### Modified: `src/components/ElectricProgressBar.css`
Complete rewrite with:
- Node styling (`.stepper-node`, `.node-ring`, `.node-icon`)
- Glow/bloom keyframes (`@keyframes node-charge`, `@keyframes node-bloom`)
- Micro-jitter animation (`@keyframes micro-jitter` -- subtle 1-2px random translate)
- Spark particle animation (`@keyframes spark-eject`)
- Lightning glow filter styles
- Responsive adjustments for mobile
- Cyan/teal color variables throughout

### No other files change
The component name and import path stay the same (`ElectricProgressBar`), so all 7 pages using it automatically get the new stepper.

## Technical Notes
- Lightning path randomization uses `Math.random()` seeded per cycle for organic variation
- `requestAnimationFrame` used for smooth spark particle animations
- SVG lightning uses `stroke-dasharray` animation for the traveling bolt effect
- Mobile: reduced particle count and simplified glow for performance
- The WIRED logo node uses the existing `/wire-logo-official.png` asset

