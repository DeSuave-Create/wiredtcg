

# Performance Optimization Plan for WIRED TCG

## Issues Identified

### 1. No Code Splitting -- All 15 pages load upfront
Every page (Simulation, SimulationLog, Extras, FAQs, etc.) is eagerly imported in `App.tsx`. On a slow connection, the entire app's JavaScript must download before anything renders. The Simulation pages alone include a complex AI engine with ~10 utility modules.

### 2. 20+ images preloaded on homepage immediately
`GameMechanicsSection` fires off 20 `new Image()` requests on mount, competing with critical resources on slow networks.

### 3. Multiple ElectricProgressBar instances running continuous intervals
The homepage renders 2 `ElectricProgressBar` components, each running a `setInterval` every 32ms with complex CSS animations (glows, lightning overlays, wave effects, sparks). These run even when off-screen.

### 4. Heavy CSS animations everywhere
- `animate-neon-flicker` on multiple header elements and titles
- `animate-pulse-neon` on content sections
- `backdrop-blur` on every `ContentSection` (expensive compositing)
- SVG glow filters in `Logo` component with hardcoded filter ID (potential conflicts)
- `logo-glow` infinite animation on progress bar logos

### 5. Videos not lazy-loaded
The Extras page references 4 video files that begin fetching metadata immediately.

### 6. No loading skeleton or suspense boundaries
Navigation between pages shows nothing while the new page's data/assets load.

### 7. GameMechanicsSection card dealing runs infinite recursive timeouts
The `dealCards()` function calls itself recursively via nested `setTimeout` chains, creating an infinite animation loop that never stops consuming CPU.

---

## Implementation Plan

### Step 1: Lazy-load all routes
Convert all page imports in `App.tsx` to `React.lazy()` with a `Suspense` boundary showing a simple loading spinner. This is the single biggest win -- the Simulation/AI engine code (~50KB+ gzipped) won't load until visited.

### Step 2: Defer image preloading with Intersection Observer
Replace the eager `new Image()` preloading in `GameMechanicsSection` with lazy loading -- only preload card images when the section scrolls into view using `IntersectionObserver`.

### Step 3: Pause off-screen animations
Add an `IntersectionObserver` to `ElectricProgressBar` so its interval only runs when visible. When off-screen, clear the interval entirely.

### Step 4: Reduce CSS animation weight
- Add `will-change: transform` to animated elements for GPU compositing
- Use `prefers-reduced-motion` media query to disable heavy animations (neon flicker, pulse, glow) for users who prefer reduced motion or on slow devices
- Give the `Logo` component's SVG filter a unique ID to avoid conflicts

### Step 5: Lazy-load videos
Add `loading="lazy"` and `preload="none"` to video elements in `VideoCarousel` and `VideoSection` so they don't fetch until the user interacts.

### Step 6: Add a lightweight Suspense fallback
Create a simple loading spinner component used as the `Suspense` fallback for lazy routes.

### Step 7: Stop infinite dealing loop when off-screen
Wrap the `GameMechanicsSection` dealing animation in an `IntersectionObserver` so it pauses when scrolled out of view, saving CPU cycles.

---

## Technical Details

**Files to modify:**
- `src/App.tsx` -- lazy imports + Suspense wrapper
- `src/components/GameMechanicsSection.tsx` -- IntersectionObserver for preloading + dealing animation
- `src/components/ElectricProgressBar.tsx` -- IntersectionObserver to pause interval
- `src/components/VideoCarousel.tsx` -- `preload="none"` on videos
- `src/components/VideoSection.tsx` -- `preload="none"` on videos
- `src/components/Logo.tsx` -- unique SVG filter ID via `useId()`
- `src/index.css` -- add `prefers-reduced-motion` rules

**New file:**
- `src/components/LoadingSpinner.tsx` -- lightweight fallback component

**No new dependencies required.**

### Expected Impact
- Initial JS bundle reduced by ~40-60% via code splitting
- Homepage loads 20 fewer concurrent image requests
- CPU usage drops significantly when progress bars are off-screen
- Videos no longer compete for bandwidth until needed
- Users on slow 3G/4G connections see content much faster
