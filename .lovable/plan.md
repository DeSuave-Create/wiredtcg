# Mobile PlayerCard — match sketch layout

Restructure the mobile layout in `src/components/PlayerCard.tsx` (lines 91–147) into the structure shown in your sketch.

## Layout

```text
┌────────────────────────────────────────────────┐
│                                          [🗑]  │
│  ┌─────┐  ┌────────────────────┐  ┌─────────┐  │
│  │     │  │  Name input        │  │         │  │
│  │ img │  ├────────────────────┤  │  ₿ 12   │  │
│  │     │  │  Role dropdown ↓   │  │         │  │
│  └─────┘  └────────────────────┘  └─────────┘  │
│  ┌──────────────┐          ┌──────────────┐    │
│  │      −       │          │      +       │    │
│  └──────────────┘          └──────────────┘    │
└────────────────────────────────────────────────┘
```

## Changes

1. **Top section** — single `flex items-center gap-2` row:
   - **Left:** character artwork, fixed `~56px` square (`flex-shrink-0`).
   - **Middle:** vertical stack (`flex-1 min-w-0 flex flex-col gap-1`) containing the name `Input` on top and the role `Select` below it, both `w-full`. Role keeps wrap behavior (`whitespace-normal h-auto min-h-7`) and role color class.
   - **Right:** score block, fixed width (`~56px`, `flex-shrink-0`), centered Bitcoin icon + score number, larger font (`text-lg font-bold text-red-500` / yellow when leader).
2. **Bottom row** — `−` and `+` buttons in a `flex justify-between gap-2 mt-2`, each `flex-1` so they span the card width like in the sketch.
3. **Trash** stays absolutely positioned top-right (`z-20`) so it doesn't shift columns.
4. Outer wrapper stays `p-2`. Desktop layout untouched.

## Why this fixes 6–8 players

Name and role each get the full middle column width (no longer competing horizontally with image + score + buttons), so long names and roles like "Security Specialist" always render in full regardless of player count.
