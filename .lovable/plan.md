

## Fix Network Board Layout: Group Equipment by Switch Column

### Problem
Currently, all cables are flattened into a single row and all computers into another row, regardless of which switch they belong to. This forces connection lines to cross diagonally, making it impossible to tell which cable connects to which switch. The "purple lines" are the branch-colored connections from the 3rd switch -- they look confusing because they cut across other branches.

### Solution
Replace the flat 4-row layout (Internet / Switches / Cables / Computers) with a **column-based layout** where each switch and its children (cables, computers) are grouped vertically. This keeps all connection lines nearly vertical and makes the hierarchy immediately obvious.

```text
Current (flat rows):
  [Internet]
  [Switch1] [Switch2] [Switch3]        <-- row of all switches
  [Cable1] [Cable2] [Cable3] [Cable4]  <-- row of ALL cables (mixed branches)
  [Comp1] [Comp2] [Comp3]              <-- row of ALL computers (mixed branches)

Proposed (column groups):
  [Internet]
  [Switch1]      [Switch2]      [Switch3]
  [Cable1]       [Cable3]       [Cable4]
  [Comp1][Comp2] [Comp3]
```

Each switch forms its own vertical column. Cables sit directly below their parent switch, and computers sit directly below their parent cable -- all within the same column. Lines only need to travel straight down.

### Changes

**File: `src/components/game/NetworkBoardDroppable.tsx`**

1. Remove the flat `allCables` and `allComputers` arrays (lines 44-60)
2. Remove the separate Row 3 (cables) and Row 4 (computers) sections
3. Replace Rows 2-4 with a single flex container of "switch columns":
   - Each column contains: the switch card at top, its cables below, and each cable's computers below that
   - Columns are spaced with `gap-14` horizontally
   - Within each column, vertical spacing uses `gap-6` (24px) between tiers
4. Keep Row 1 (Internet) and Row 5 (Unconnected) as-is
5. Adjust the overall board min-height if needed since columns will self-size

**File: `src/components/game/NetworkConnectionLines.tsx`**

No changes needed -- it already calculates line positions from DOM element positions using `data-equipment-id`. Since equipment will now be vertically aligned in columns, the existing Bezier curves will naturally become nearly vertical.

**File: `src/components/game/PlayerSection.tsx`**

Adjust `min-h` on the board container if the column layout requires more or less space. The column layout may actually be more compact since it doesn't reserve fixed row heights for empty tiers.

### Technical Details

The new column layout structure inside the DroppableZone:

```text
<div class="flex justify-center gap-14">        <!-- switch columns -->
  {network.switches.map(sw => (
    <div class="flex flex-col items-center gap-6">  <!-- one column -->
      <SwitchCard ... />
      {sw.cables.map(cable => (
        <div class="flex flex-col items-center gap-4">
          <CableCard ... />
          <div class="flex gap-2">               <!-- computers row -->
            {cable.computers.map(comp => (
              <ComputerCard ... />
            ))}
          </div>
        </div>
      ))}
    </div>
  ))}
</div>
```

- When a switch has no cables, its column just shows the switch card
- When a cable has no computers, it just shows the cable card with capacity indicator
- Empty placeholder text ("Switches", "Cables", "Computers") only shows when there are zero switches total
- Mobile: columns wrap horizontally with `overflow-x-auto`
- The existing `NetworkConnectionLines` SVG will automatically draw near-vertical lines since parent and child elements will be vertically aligned in the DOM

