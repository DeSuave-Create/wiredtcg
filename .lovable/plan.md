## Goal

Add a live countdown timer targeting **June 1, 2026** to the Kickstarter promotional elements. Once the target date passes, the countdown is replaced with a celebratory "Now Live!" message.

## Implementation

### 1. New shared hook: `src/hooks/useCountdown.ts`
- Computes `{ days, hours, minutes, seconds, isLive }` from a target Date.
- Ticks once per second via `setInterval`, cleared on unmount.
- `isLive` flips true when `now >= target`.

Target: `new Date('2026-06-01T00:00:00Z')` (UTC, exported as a shared constant alongside the hook so both components stay in sync).

### 2. `src/components/KickstarterAnnouncementBar.tsx`
- Replace the "LAUNCHING SOON" text with a compact countdown.
- Desktop: `BACK WIRED ON KICKSTARTER — LAUNCHES IN 04D 12H 33M 21S`
- Mobile: `KICKSTARTER — 04D 12H 33M 21S`
- When `isLive`: show `BACK WIRED ON KICKSTARTER — NOW LIVE!` with pulsing accent.

### 3. `src/components/KickstarterCTA.tsx`
- Above the existing description, add a 4-cell countdown display (Days / Hours / Minutes / Seconds) using semantic tokens (`bg-background/20`, `text-primary-foreground`, `font-orbitron`).
- Each cell: large bold number + small label below.
- Update body copy to "Our campaign launches in:" before the timer and keep CTA button unchanged.
- When `isLive`: hide the timer, show a "🚀 Campaign is now LIVE!" headline and current copy reverts to "Back the campaign now and claim your exclusive rewards."

### Styling
- Reuse existing gradient/shimmer treatment — no new colors.
- Numbers use `font-orbitron`, monospaced tabular-nums to prevent layout shift.
- All text remains readable in light & dark mode (uses `text-primary-foreground` over the gradient).

### Files touched
- `src/hooks/useCountdown.ts` (new)
- `src/components/KickstarterAnnouncementBar.tsx`
- `src/components/KickstarterCTA.tsx`
