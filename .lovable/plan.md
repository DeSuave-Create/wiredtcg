# Fix Score Keeper: Always show full role + name

## Problem
On the mobile card layout (the only layout that changes with player count on small screens), the middle column squeezes when players add longer names or pick a longer role (e.g. "Security Specialist", "Headhunter"). The role dropdown uses `whitespace-nowrap` + `truncate`, and the name `<Input>` has a small fixed height with center alignment, so long values get cut off — most visible when players 6, 7, 8 fill in real names.

## Fix (mobile `PlayerCard` only)

Re-flow each card into two rows so the name and role get the full card width and can never be squeezed by the score controls.

```text
┌─────────────────────────────────────────────┐
│ [🗑]  [Role dropdown — full width, wraps]   │ row 1
│       [Name input — full width            ] │
├─────────────────────────────────────────────┤
│ [img]            [-]  ₿ 12  [+]             │ row 2
└─────────────────────────────────────────────┘
```

Specific changes in `src/components/PlayerCard.tsx` (mobile block, lines 92–149):

1. Wrap content in a vertical stack (`flex flex-col gap-2 p-2`).
2. **Row 1 — identity (full width):**
   - Role `Select` trigger: remove width constraints, allow wrap (`whitespace-normal text-center leading-tight min-h-6 h-auto py-1`), keep role color class from `roleColors` so it's visually obvious.
   - Name `Input`: full width, larger (`h-8 text-sm`), still centered.
   - Trash button floats top-right absolutely so it doesn't steal horizontal space.
3. **Row 2 — score row:**
   - Character thumbnail on the left (same 48px).
   - Score controls right-aligned (`ml-auto`), same `-` / ₿ / `+` group.

This guarantees role names like "Security Specialist" and player names up to ~16 characters always render in full, regardless of how many players are on screen.

## Out of scope
- Desktop layout (3-column grid; cards keep fixed width so no truncation issue there). I will leave it untouched unless you also want it tweaked.
- No data, persistence, or scoring logic changes.

## Files
- `src/components/PlayerCard.tsx` — mobile layout block only.
