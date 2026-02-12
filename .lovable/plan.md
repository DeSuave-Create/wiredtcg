

# Player Card Readability and Leader Indicator Fixes

## Problem 1: "Bitcoins Mined" text is hard to read
The label, score, and buttons sit directly on the light circuit board background with no contrast.

## Problem 2: Facilities yellow border looks like the winning player
The leader highlight uses `border-yellow-400`, which is the same color as the Facilities role border, causing confusion.

## Solutions

### 1. Dark pill behind the score section (desktop and mobile)
Wrap the Bitcoin icon, "Bitcoins Mined" label, score number, and +/- buttons in a `bg-black/50 rounded-xl px-4 py-3` container on desktop. On mobile, the score controls area already has a darker context but will get a similar subtle backdrop if needed.

### 2. Change the leader indicator style
Instead of a yellow border (which clashes with Facilities), use a distinct leader style that no role uses:
- A **white/silver glowing border** (`border-white shadow-white/40`) with a subtle pulsing glow effect
- This is visually distinct from all four role colors (red, yellow, green, blue)

## Technical Details

### File: `src/components/PlayerCard.tsx`

**Leader border change (line ~54):**
- Change `border-yellow-400 shadow-yellow-400/30` to `border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]`

**Desktop score section (~lines 155-175):**
- Wrap the "Bitcoins Mined" label, score, and +/- buttons in a `bg-black/50 rounded-xl px-4 py-3` div

**Mobile layout:**
- Add a subtle `bg-black/40 rounded-lg px-2 py-1` behind the score controls group for consistency

