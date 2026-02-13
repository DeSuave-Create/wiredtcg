

# Crop Classification Card to Hide Role Title

## Problem
The classification card image (`character.image`) is a full card PNG that includes the role name at the top (e.g., "Security Specialist"). Since the role is already shown as the dropdown at the top of the player card, it's redundant.

## Solution
Use CSS cropping to hide the top portion of the card image (the role title area) and only display the character artwork and description text from the middle/bottom of the card.

## Technical Details

### File: `src/components/PlayerCard.tsx`

Update the classification card image section (lines 186-193) to crop out the top title area:

- Wrap the `img` in a container with `overflow-hidden` and a fixed height
- Use `object-cover` with `object-position: center 60%` (or similar) to shift the visible area down, cutting off the role title at the top while keeping the character artwork and description visible
- The container uses `flex-1` to fill remaining space, and the image is scaled to fill that area with the top cropped out

```tsx
{/* Classification card image - cropped to hide role title */}
<div className="flex-1 flex items-center justify-center w-full overflow-hidden">
  <div className="w-3/4 h-full overflow-hidden flex items-center justify-center">
    <img
      src={character.image}
      alt={character.name}
      className="w-full object-cover object-[center_65%] scale-125 opacity-80 border-0 shadow-none"
    />
  </div>
</div>
```

The `object-position: center 65%` shifts the focal point downward (past the title), and `scale-125` zooms in slightly so the cropped area fills the space without blank edges. These values may need minor tuning based on the exact card image layout.

No other files affected.
