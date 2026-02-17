

# Fix Electric Stepper: Progression Bug + Node Colors

## Problems Found

1. **Stepper never advances** -- The IntersectionObserver sets `isVisibleRef = true` and calls `setActiveStep(0)`, but since `activeStep` is already `0`, React skips the re-render. The timer effect never re-fires, so the stepper stays stuck on node 1 forever.

2. **Spark particles don't animate** -- The CSS `spark-eject` keyframe uses `cos()` and `sin()` CSS functions, which are not supported in all browsers. The sparks appear but don't fly outward.

3. **All nodes are the same cyan color** -- Connect should be green, Plan should be red, Mine should be yellow.

## Fix 1: Stepper Progression

In the IntersectionObserver callback, instead of setting `activeStep(0)` (which is a no-op on mount), use a separate trigger state or force a re-render. The simplest fix: add a `running` state that the timer effect depends on. When the observer fires, toggle `running` to `true`, which triggers the timer effect to schedule the first advance.

## Fix 2: Spark Particles

Replace CSS `cos()`/`sin()` in the `spark-eject` keyframe with pre-computed inline `transform` values calculated in JavaScript. Each spark particle will get its final `translate(Xpx, Ypx)` baked into an inline CSS variable, using `Math.cos()` and `Math.sin()` in the React component.

## Fix 3: Per-Node Colors

Add a `color` property to each step definition:
- **Wired** (node 0): Cyan/teal (unchanged, the default energy color)
- **Connect** (node 1): Green -- `hsl(140, 70%, 50%)`
- **Plan** (node 2): Red -- `hsl(0, 70%, 55%)`
- **Mine** (node 3): Yellow -- `hsl(45, 85%, 55%)`

Apply per-node colors using CSS custom properties (`--node-color`, `--node-glow`) set as inline styles on each node. The CSS will reference these variables for border, glow, icon color, label color, bloom gradient, and spark color. Lightning bolts between nodes will also use the destination node's color.

## Files Changed

### `src/components/ElectricProgressBar.tsx`
- Add `running` state; IntersectionObserver sets it to `true`; timer effect checks `running` instead of `isVisibleRef` for scheduling
- Add color config to each step (`hue` and `saturation` values)
- Compute spark particle end positions with `Math.cos()` / `Math.sin()` and pass as `--tx` and `--ty` CSS variables
- Set `--node-hue` and `--node-sat` inline style on each node element
- Lightning bolt stroke colors use destination node's hue

### `src/components/ElectricProgressBar.css`
- Replace all hardcoded `hsl(185, ...)` in node states with `hsl(var(--node-hue), ...)` references
- Update `spark-eject` keyframe to use `--tx` and `--ty` instead of `cos()`/`sin()`
- Add node-bloom gradient using `--node-hue`
- Keep the Wired/default cyan as fallback values for `--node-hue: 185` and `--node-sat: 80%`

