

# Premium Prismatic Cyber-Glass Border Upgrade

## Overview
Enhance the PlayerCard border from flat Tailwind outlines to a layered, luminous cyber-glass frame system. Only border, glow, and depth styling changes -- no layout, icon, or typography modifications.

## Current State
- Borders use Tailwind classes (`border-red-500`, `border-yellow-400`, etc.)
- Leader card has a special purple glow via inline `boxShadow`
- Cards have `overflow-hidden` and `rounded-3xl`

## Approach
Switch from Tailwind border classes to fully inline-styled borders using raw RGB color values per role. This enables the multi-layer `boxShadow`, prismatic gradient overlay, and inner glow effects that Tailwind classes alone cannot express.

## Color Map (RGB values for inline styles)

| Role | RGB |
|------|-----|
| Security Specialist | 239, 68, 68 (red) |
| Facilities | 250, 204, 21 (yellow) |
| Supervisor | 34, 197, 94 (green) |
| Field Tech | 59, 130, 246 (blue) |
| Headhunter | 20, 184, 166 (teal) |
| Auditor | 236, 72, 153 (pink) |

## Changes to `src/components/PlayerCard.tsx`

### 1. Update `roleColors` to include RGB values
Add an `rgb` property to each role entry (e.g., `'239, 68, 68'`). Keep the existing `text` property for role name color.

### 2. Replace Tailwind border classes with inline styles
Remove `border-*` and `shadow-*` Tailwind classes from the card wrapper. Apply all border effects via the `style` prop.

### 3. Inline style object per card (non-leader)
Build a computed style object with:

**Outer border**: `border: 3px solid rgba(R,G,B, 0.85)`

**Layered box-shadow** (4 layers):
- `0 0 18px rgba(R,G,B, 0.35)` -- bloom glow
- `0 0 42px rgba(255,255,255, 0.12)` -- soft white haze
- `inset 0 0 12px rgba(255,255,255, 0.10)` -- inner depth
- `inset 0 0 1px rgba(255,255,255, 0.40)` -- inner edge highlight

### 4. Prismatic gradient overlay (::before pseudo-element)
Since React can't directly apply `::before` styles inline, add a positioned child `<div>` as the first element inside the card wrapper:
- `position: absolute; inset: 0; z-index: 1; pointer-events: none; border-radius: inherit`
- `background: linear-gradient(135deg, rgba(R,G,B,0.15) 0%, rgba(255,255,255,0.08) 50%, rgba(R,G,B,0.12) 100%)`
- This creates the prismatic shimmer without obscuring content

### 5. Corner illumination overlay
Add a second positioned child `<div>`:
- `position: absolute; inset: 0; z-index: 2; pointer-events: none; border-radius: inherit`
- `background: radial-gradient(ellipse at 10% 10%, rgba(255,255,255,0.12) 0%, transparent 50%), radial-gradient(ellipse at 90% 90%, rgba(255,255,255,0.08) 0%, transparent 50%)`
- Simulates polished corner light catches

### 6. Leader card enhancement
Keep the existing purple leader glow but upgrade it to the same layered system:
- Border: `3px solid rgba(200, 180, 255, 0.9)`
- Box-shadow: existing purple glow layers PLUS the inner depth and inner edge layers

### 7. Ensure content stays above overlays
Both mobile and desktop layout wrappers already have `relative z-10`, so they naturally sit above the `z-1` and `z-2` overlay divs.

## No Other Files Change
All modifications are contained within `PlayerCard.tsx`. No CSS file needed -- everything is inline styles and overlay divs.

